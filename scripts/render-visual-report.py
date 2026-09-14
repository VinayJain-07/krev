from __future__ import annotations

import base64
import html
import io
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

from jinja2 import Template
from pypdf import PdfReader

try:
    from weasyprint import HTML
    WEASYPRINT_ERROR = ""
except Exception as error:
    HTML = None
    WEASYPRINT_ERROR = str(error)

ACRONYMS = (
    "SEO", "GEO", "ICP", "PESTEL", "SWOT", "ROI", "KPI", "CTR", "CTA",
    "AI", "API", "URL", "B2B", "B2C", "GSC", "LLM", "CRO", "PSEO",
    "JTBD", "LIC", "IRDAI", "ULIP", "AUM", "CSR", "STP", "KYC", "CAC", "LTV"
)


def normalize_acronyms(value: str) -> str:
    value = re.sub(r"[\ud800-\udfff]", "?", value)
    parts = re.split(r"(https?://[^\s)\>]+)", value, flags=re.I)
    for index in range(0, len(parts), 2):
        for acronym in ACRONYMS:
            parts[index] = re.sub(rf"\b{acronym}\b", acronym, parts[index], flags=re.I)
    return "".join(parts)


def unwrap_structured(value: Any) -> str:
    if not isinstance(value, str):
        if isinstance(value, dict):
            for key in ("contentMarkdown", "content", "text", "summary"):
                if isinstance(value.get(key), str):
                    return unwrap_structured(value[key])
        return ""
    candidate = value.strip().removeprefix("```json").removeprefix("```markdown").removeprefix("```md").removesuffix("```").strip()
    for _ in range(3):
        extracted = None
        for option in (candidate, candidate[candidate.find("{"):] if "{" in candidate else ""):
            if not option:
                continue
            try:
                parsed = json.loads(option)
                if isinstance(parsed, dict):
                    extracted = next((parsed.get(key) for key in ("contentMarkdown", "content", "text", "summary") if isinstance(parsed.get(key), str)), None)
            except Exception:
                pass
            if extracted:
                break
        if not extracted or extracted == candidate:
            break
        candidate = extracted.strip()
    return normalize_acronyms(candidate.replace("\\n", "\n").replace("\\t", "\t"))


def clean_inline(value: str) -> str:
    value = unwrap_structured(value)
    for _ in range(2):
        try:
            repaired = value.encode("cp1252").decode("utf-8")
            if repaired == value:
                break
            value = repaired
        except (UnicodeEncodeError, UnicodeDecodeError):
            break
    for broken, repaired in {"â€”": " - ", "â€“": " - ", "â€™": "’", "â€œ": "“", "â€ ": "”", "Â®": "®", "Â": ""}.items():
        value = value.replace(broken, repaired)
    value = re.sub(r"(?:â[^\w\s]{1,4})+", " · ", value)
    value = re.sub(r"!\[([^]]*)\]\([^)]*\)", r"\1", value)
    value = re.sub(r"\[([^]]+)\]\((https?://[^)]+)\)", r'<a class="smark-cite-link" href="\2">\1</a>', value)
    value = re.sub(r"[\u2500-\u259f\ufffd]+", " · ", value)
    value = re.sub(r"(?:\s*·\s*){2,}", " · ", value)
    value = re.sub(r"[\u2013\u2014]", " - ", value)
    value = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", value)
    value = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"\1", value)
    value = value.replace("\\*", "").replace("*", "")
    value = re.sub(r"`([^`]+)`", r"<code>\1</code>", value)
    value = re.sub(r"[ \t]{2,}", " ", value)
    return value.strip()


def normalize_document_markdown(markdown: str) -> str:
    normalized: list[str] = []
    for raw_line in markdown.replace("\u00a0", " ").splitlines():
        line = re.sub(r"[\u2013\u2014]", " - ", raw_line).rstrip()
        bullet = re.match(r"^(\s*)(?:[•◦▪+]\s*|\*(?!\*)\s+)(.+)$", line)
        numbered = re.match(r"^(\s*)(\d+)[)]\s*(.+)$", line)
        if bullet:
            line = f"{bullet.group(1)}- {bullet.group(2)}"
        elif numbered:
            line = f"{numbered.group(1)}{numbered.group(2)}. {numbered.group(3)}"
        normalized.append(line)
    return re.sub(r"\n{3,}", "\n\n", "\n".join(normalized)).strip()


def parse_markdown_blocks(markdown: str) -> list[dict[str, Any]]:
    blocks: list[dict[str, Any]] = []
    lines = markdown.splitlines()
    index = 0
    while index < len(lines):
        line = lines[index].strip()
        if not line:
            index += 1
            continue

        if line == "```framework":
            index += 1
            source = []
            while index < len(lines) and lines[index].strip() != "```":
                source.append(lines[index])
                index += 1
            index += 1
            try:
                framework = json.loads("\n".join(source))
                cards = framework.get("cards", [])
                valid = framework.get("kind") in ("swot", "pestel", "tows", "funnel", "journey", "roadmap", "priority", "comparison") and isinstance(cards, list) and 2 <= len(cards) <= 30
                valid = valid and all(isinstance(card, dict) and isinstance(card.get("title"), str) and isinstance(card.get("lines"), list) and all(isinstance(item, str) for item in card["lines"]) for card in cards)
                if valid:
                    blocks.append({"type": "framework", "framework": framework})
                    continue
            except (ValueError, AttributeError):
                pass
            blocks.append({"type": "paragraph", "text": html.escape("\n".join(source))})
            continue

        if line.startswith("#"):
            level = len(line.split()[0])
            text = line.lstrip("#").strip()
            blocks.append({"type": f"h{min(level, 4)}", "text": text})
            index += 1
            continue

        if "|" in line and index + 1 < len(lines) and re.match(r"^\s*\|?[-:\s|]+\|?\s*$", lines[index + 1]):
            table_lines = []
            while index < len(lines) and "|" in lines[index]:
                table_lines.append(lines[index])
                index += 1
            rows = []
            for t_line in table_lines:
                if re.match(r"^\s*\|?[-:\s|]+\|?\s*$", t_line):
                    continue
                cells = [cell.strip().replace(r"\|", "|") for cell in re.split(r"(?<!\\)\|", t_line)]
                if cells and not cells[0]:
                    cells = cells[1:]
                if cells and not cells[-1]:
                    cells = cells[:-1]
                if cells:
                    rows.append(cells)
            if rows:
                blocks.append({"type": "table", "rows": rows})
            continue

        if line.startswith(("- ", "* ", "• ")):
            items = []
            while index < len(lines) and lines[index].strip().startswith(("- ", "* ", "• ")):
                items.append(re.sub(r"^[-*•]\s+", "", lines[index].strip()))
                index += 1
            blocks.append({"type": "bullets", "items": items})
            continue

        if re.match(r"^\d+\.\s+", line):
            items = []
            while index < len(lines) and re.match(r"^\d+\.\s+", lines[index].strip()):
                items.append(re.sub(r"^\d+\.\s+", "", lines[index].strip()))
                index += 1
            blocks.append({"type": "numbered", "items": items})
            continue

        if line.startswith(">"):
            quote_lines = []
            while index < len(lines) and lines[index].strip().startswith(">"):
                quote_lines.append(lines[index].strip().lstrip(">").strip())
                index += 1
            blocks.append({"type": "quote", "text": " ".join(quote_lines)})
            continue

        p_lines = [line]
        index += 1
        while index < len(lines) and lines[index].strip() and not lines[index].strip().startswith(("#", "-", "*", "•", ">", "|")) and not re.match(r"^\d+\.\s+", lines[index].strip()):
            p_lines.append(lines[index].strip())
            index += 1
        blocks.append({"type": "paragraph", "text": " ".join(p_lines)})

    return blocks


def visual_insertion_index(blocks: list[dict[str, Any]]) -> int:
    if len(blocks) < 2:
        return 0
    heading_indexes = [index for index, block in enumerate(blocks) if block.get("type") in ("h1", "h2")]
    executive_index = next(
        (index for index in heading_indexes if re.search(r"executive|summary|overview|recommendation", str(blocks[index].get("text", "")), re.I)),
        None,
    )
    if executive_index is not None:
        next_heading = next((index for index in heading_indexes if index > executive_index), None)
        if next_heading is not None:
            return next_heading
    if len(heading_indexes) > 1:
        return heading_indexes[1]
    return min(max(1, len(blocks) // 3), len(blocks) - 1)


def extract_swot_matrix(blocks: list[dict[str, Any]], start_index: int) -> tuple[dict[str, list[str]], int]:
    swot_items: dict[str, list[str]] = {"Strengths": [], "Weaknesses": [], "Opportunities": [], "Threats": []}
    i = start_index + 1
    current_quadrant = ""

    quadrant_keywords = {
        "Strengths": ["strength", "strenght", "s - ", "(s)", "core advantage"],
        "Weaknesses": ["weakness", "weak", "w - ", "(w)", "limitation", "gap", "vulnerability"],
        "Opportunities": ["opportunit", "o - ", "(o)", "upside", "growth vector", "whitespace"],
        "Threats": ["threat", "t - ", "(t)", "risk", "hazard", "competitive headwind"]
    }

    while i < len(blocks):
        b = blocks[i]
        b_type = b["type"]

        if b_type == "h1" or (b_type == "h2" and not any(q.lower() in b.get("text", "").lower() for q in ("strengths", "weaknesses", "opportunities", "threats", "swot"))):
            break

        text = b.get("text", "")
        matched_quad = None
        for quad, kws in quadrant_keywords.items():
            if any(kw in text.lower() for kw in kws):
                matched_quad = quad
                break

        if matched_quad:
            current_quadrant = matched_quad
            if ":" in text:
                parts = text.split(":", 1)
                after_colon = parts[1].strip()
                if len(after_colon) > 3:
                    swot_items[current_quadrant].append(after_colon)
        elif b_type in ("bullets", "numbered"):
            for item in b.get("items", []):
                item_str = str(item).strip()
                item_quad = None
                for quad, kws in quadrant_keywords.items():
                    if any(item_str.lower().startswith(f"**{kw}") or item_str.lower().startswith(kw) for kw in kws):
                        item_quad = quad
                        break
                if item_quad:
                    clean_item = re.sub(r"^\*{0,2}(Strengths?|Weaknesses?|Opportunities?|Threats?|[SWOT])\*{0,2}\s*[:\-–—]\s*", "", item_str, flags=re.IGNORECASE).strip()
                    if clean_item:
                        swot_items[item_quad].append(clean_item)
                elif current_quadrant:
                    swot_items[current_quadrant].append(item_str)
                else:
                    for quad, kws in quadrant_keywords.items():
                        if any(kw in item_str.lower() for kw in kws):
                            swot_items[quad].append(item_str)
                            break
        elif b_type == "table":
            headers = [h.strip() for h in b.get("headers", [])]
            rows = b.get("rows", [])
            for col_idx, h in enumerate(headers):
                for quad, kws in quadrant_keywords.items():
                    if any(kw in h.lower() for kw in kws):
                        for r in rows:
                            if col_idx < len(r) and r[col_idx].strip():
                                swot_items[quad].append(r[col_idx].strip())
        elif b_type == "paragraph" and current_quadrant:
            if text and not any(k.lower() in text.lower() for k in ("swot analysis", "strategic matrix", "framework")):
                swot_items[current_quadrant].append(text)

        i += 1

    # A visual must only represent supplied evidence. When the report does not
    # contain a complete SWOT, leave the original Markdown in place rather than
    # inventing entries to complete a diagram.
    if not all(swot_items.values()):
        return None, start_index

    return swot_items, i


def render_framework(framework: dict[str, Any]) -> str:
    kind = framework["kind"]
    staged = kind in ("funnel", "journey", "roadmap")
    palette = ("#7C34BC", "#B74162", "#167C70", "#AD7024", "#3C65A5", "#6853A3")
    rows = []
    cards = framework["cards"]
    columns = 1 if staged else 2
    for start in range(0, len(cards), columns):
        row = []
        for offset, card in enumerate(cards[start:start + columns]):
            index = start + offset
            inset = min(index * 3, 15) if kind == "funnel" else 0
            items = "".join(f"<li>{html.escape(item)}</li>" for item in card["lines"])
            row.append(f'<div class="report-framework-cell" style="width:{100 // columns}%"><section class="report-framework-card" style="border-left-color:{palette[index % len(palette)]};margin-left:{inset}%;margin-right:{inset}%"><h4>{html.escape(card["title"])}</h4><ul>{items}</ul></section></div>')
        rows.append(f'<div class="report-framework-row">{"".join(row)}</div>')
        if staged and start + columns < len(cards):
            rows.append('<div class="report-framework-arrow">↓</div>')
    caption = '<p class="report-framework-caption">Stage widths show sequence, not measured volume or conversion.</p>' if kind == "funnel" else ""
    return f'<div class="report-framework report-framework-{kind}">{"".join(rows)}{caption}</div>'


def render_blocks_to_html(blocks: list[dict[str, Any]], competitor_logos: dict[str, str] | None = None, inline_visuals: str = "") -> str:
    competitor_logos = competitor_logos or {}
    html_parts: list[str] = []

    chapter_count = 1
    i = 0
    insert_at = visual_insertion_index(blocks) if inline_visuals else -1
    visuals_inserted = False
    while i < len(blocks):
        if not visuals_inserted and i == insert_at:
            html_parts.append(inline_visuals)
            visuals_inserted = True
        block = blocks[i]
        b_type = block["type"]
        block_text = block.get("text", "")

        if b_type == "framework":
            html_parts.append(render_framework(block["framework"]))
            i += 1
            continue

        if not any(candidate["type"] == "framework" for candidate in blocks) and ((b_type in ("h1", "h2", "h3") and "SWOT" in block_text.upper()) or (b_type == "h2" and any(k in block_text.upper() for k in ("STRENGTHS & WEAKNESSES", "STRENGTHS, WEAKNESSES")))):
            swot_items, next_i = extract_swot_matrix(blocks, i)
            if swot_items:
                i = next_i

                html_parts.append(f'''
            <section class="framework-section-wrap">
                <h2 class="framework-header"><span class="header-knot-mark"></span>SWOT Strategic Analysis Matrix</h2>
                <div class="swot-grid">
                    <div class="swot-card swot-strengths">
                        <div class="swot-card-header">
                            <span class="swot-badge badge-s">S</span>
                            <h4>Strengths</h4>
                        </div>
                        <ul class="swot-list">
                            {"".join(f"<li>{clean_inline(item)}</li>" for item in swot_items["Strengths"])}
                        </ul>
                    </div>
                    <div class="swot-card swot-weaknesses">
                        <div class="swot-card-header">
                            <span class="swot-badge badge-w">W</span>
                            <h4>Weaknesses</h4>
                        </div>
                        <ul class="swot-list">
                            {"".join(f"<li>{clean_inline(item)}</li>" for item in swot_items["Weaknesses"])}
                        </ul>
                    </div>
                    <div class="swot-card swot-opportunities">
                        <div class="swot-card-header">
                            <span class="swot-badge badge-o">O</span>
                            <h4>Opportunities</h4>
                        </div>
                        <ul class="swot-list">
                            {"".join(f"<li>{clean_inline(item)}</li>" for item in swot_items["Opportunities"])}
                        </ul>
                    </div>
                    <div class="swot-card swot-threats">
                        <div class="swot-card-header">
                            <span class="swot-badge badge-t">T</span>
                            <h4>Threats</h4>
                        </div>
                        <ul class="swot-list">
                            {"".join(f"<li>{clean_inline(item)}</li>" for item in swot_items["Threats"])}
                        </ul>
                    </div>
                </div>
            </section>
                ''')
                continue

        if b_type == "h1":
            text = clean_inline(block["text"])
            html_parts.append(f'''
            <div class="section-chapter-banner">
                <span class="chapter-num">{chapter_count:02d}</span>
                <div class="chapter-text">
                    <span class="kicker-eyebrow">STRATEGIC CHAPTER {chapter_count:02d}</span>
                    <h1 class="section-title">{text}</h1>
                </div>
            </div>
            ''')
            chapter_count += 1
        elif b_type == "h2":
            text = clean_inline(block["text"])
            if any(k in text.upper() for k in ("EXECUTIVE SUMMARY", "EXECUTIVE RECOMMENDATION", "COMPETITIVE LANDSCAPE", "KEY FINDINGS", "RECOMMENDATIONS", "POSITIONING")):
                html_parts.append(f'<h2 class="framework-header"><span class="header-knot-mark"></span>{text}</h2>')
            else:
                html_parts.append(f'<h2 class="section-h2">{text}</h2>')
        elif b_type == "h3":
            html_parts.append(f'<h3 class="section-h3"><span class="sub-accent-bar"></span>{clean_inline(block["text"])}</h3>')
        elif b_type == "h4":
            html_parts.append(f'<h4 class="section-h4">{clean_inline(block["text"])}</h4>')
        elif b_type == "paragraph":
            text = clean_inline(block["text"])
            if text.startswith(("Situation:", "Evidence:", "Implication:", "Direction:", "Key Finding:", "Why it Matters:", "Recommendation:")):
                parts = text.split(":", 1)
                html_parts.append(f'''
                <div class="insight-pill-card">
                    <strong class="pill-tag">{parts[0]}</strong>
                    <span class="pill-body">{parts[1] if len(parts) > 1 else ""}</span>
                </div>
                ''')
            else:
                html_parts.append(f'<p class="report-p">{text}</p>')
        elif b_type == "quote":
            quote_text = clean_inline(block["text"])
            html_parts.append(f'''
            <blockquote class="smark-callout">
                <div class="callout-icon-chip">✦</div>
                <div class="callout-content">
                    <strong>STRATEGIC DIRECTIVE</strong>
                    <p>{quote_text}</p>
                </div>
            </blockquote>
            ''')
        elif b_type == "bullets":
            items = "".join(f'<li class="smark-bullet"><span class="bullet-dot"></span><div>{clean_inline(item)}</div></li>' for item in block["items"])
            html_parts.append(f'<ul class="smark-bullet-list">{items}</ul>')
        elif b_type == "numbered":
            items = "".join(f'<li class="smark-numbered"><span class="num-badge">{idx+1:02d}</span><div>{clean_inline(item)}</div></li>' for idx, item in enumerate(block["items"]))
            html_parts.append(f'<ol class="smark-numbered-list">{items}</ol>')
        elif b_type == "table":
            rows = block["rows"]
            if rows:
                head = "".join(f'<th>{clean_inline(cell)}</th>' for cell in rows[0])
                body_rows = []
                for row in rows[1:]:
                    cells = []
                    for idx, cell in enumerate(row):
                        logo = next((data for name, data in competitor_logos.items() if idx == 0 and name.lower() in cell.lower()), "")
                        if not logo and idx == 0:
                            cell_clean = cell.strip()
                            if "http" in cell_clean or "." in cell_clean:
                                dom_match = re.search(r'(?:https?://)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})', cell_clean)
                                if dom_match:
                                    logo = f"https://www.google.com/s2/favicons?domain={dom_match.group(1)}&sz=128"
                        img = f'<img class="table-logo" src="{logo}" alt="" onerror="this.style.display=\'none\';" /> ' if logo else ""
                        cells.append(f'<td>{img}{clean_inline(cell)}</td>')
                    body_rows.append(f'<tr>{"".join(cells)}</tr>')
                html_parts.append(f'''
                <div class="table-wrap">
                    <table class="smark-table">
                        <thead><tr>{head}</tr></thead>
                        <tbody>{"".join(body_rows)}</tbody>
                    </table>
                </div>
                ''')
        i += 1

    if inline_visuals and not visuals_inserted:
        html_parts.insert(max(1, len(html_parts) // 3), inline_visuals)
    return "\n".join(html_parts)


def render_competitor_cards(competitors: list[dict[str, Any]]) -> str:
    if not competitors:
        return ""
    cards = []
    for competitor in competitors[:6]:
        name = clean_inline(competitor.get("companyName", "Competitor"))
        website = competitor.get("officialWebsite", "")
        logo = competitor.get("logoDataUrl") or competitor.get("logoUrl", "")

        if not logo and website:
            try:
                domain = re.sub(r"^https?://", "", website).split("/")[0].replace("www.", "")
                if domain and "." in domain:
                    logo = f"https://www.google.com/s2/favicons?domain={domain}&sz=128"
            except Exception:
                pass

        media = f'<img src="{logo}" alt="{name} logo" class="comp-card-logo" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';" /><span class="comp-card-letter" style="display: none;">{name[:1].upper()}</span>' if logo else f'<span class="comp-card-letter">{name[:1].upper()}</span>'
        clean_domain = website.replace("https://", "").replace("http://", "").rstrip("/") if website else ""
        site_link = f'<span class="comp-site-text">{clean_domain}</span>' if clean_domain else ""
        attrs = "".join(f'<span class="comp-attr-tag">{clean_inline(attr)}</span>' for attr in competitor.get("competitiveAttributes", [])[:4])
        positioning = clean_inline(competitor.get("positioning") or competitor.get("evidence") or "")
        cards.append(f'''
        <article class="smark-card competitor-card">
            <div class="comp-card-top">
                <div class="comp-logo-box">{media}</div>
                <div class="comp-info">
                    <h4>{name}</h4>
                    {site_link}
                </div>
            </div>
            {f'<p class="comp-positioning">{positioning}</p>' if positioning else ''}
            {f'<div class="comp-tags">{attrs}</div>' if attrs else ''}
        </article>
        ''')

    return f'''
    <section class="competitors-section">
        <div class="panel-header">
            <span class="framework-kicker">MARKET LANDSCAPE · COMPETITIVE POSITIONING</span>
            <h2 class="framework-header"><span class="header-knot-mark"></span>Verified Competitor Landscape</h2>
            <p class="section-sub">Direct alternatives, positioning whitespace, and attribute comparison derived from public intelligence.</p>
        </div>
        <div class="competitor-grid">
            {"".join(cards)}
        </div>
    </section>
    '''


def extract_and_render_sources_register(raw_markdown: str, source_count: int) -> str:
    urls = list(dict.fromkeys(url.rstrip(".,;:") for url in re.findall(r"https?://[^\s)\]>]+", raw_markdown)))
    if not urls:
        return ""

    rows = []
    for idx, url in enumerate(urls, start=1):
        clean_url = url.rstrip(".,;:)")
        try:
            domain = re.sub(r"^https?://", "", clean_url).split("/")[0].replace("www.", "")
        except Exception:
            domain = clean_url
        rows.append(f'''
        <tr>
            <td style="width: 70px; white-space: nowrap; font-weight: 800; color: #8B2CE0;">SRC-{idx:03d}</td>
            <td style="font-weight: 700; color: #1A1A1A;">{html.escape(domain)}</td>
            <td style="color: #5B5B63; word-break: break-all;"><a href="{html.escape(clean_url, quote=True)}">{html.escape(clean_url)}</a></td>
            <td style="width: 90px; text-align: right;"><span class="source-verified-tag">Referenced</span></td>
        </tr>
        ''')

    return f'''
    <section class="sources-register-panel">
        <div class="panel-header">
            <span class="framework-kicker">REPORT EVIDENCE · SOURCE REGISTER</span>
            <h2 class="framework-header"><span class="header-knot-mark"></span>Evidence & Source Register ({len(urls)} Sources)</h2>
            <p class="panel-sub">Transparent register of public crawl pages, competitive assets, and digital footprint evidence.</p>
        </div>
        <div class="table-wrap">
            <table class="smark-table sources-table">
                <thead><tr><th>Ref</th><th>Domain</th><th>Source URL</th><th>Status</th></tr></thead>
                <tbody>{"".join(rows)}</tbody>
            </table>
        </div>
    </section>
    '''


def get_smarketers_logo_base64() -> str:
    logo_path = Path(sys.path[0] or ".").resolve() / "public" / "smarketers_logo.png"
    if not logo_path.exists():
        logo_path = Path.cwd() / "public" / "smarketers_logo.png"
    if logo_path.exists():
        try:
            return f"data:image/png;base64,{base64.b64encode(logo_path.read_bytes()).decode('ascii')}"
        except Exception:
            pass
    return ""


REPORT_TEMPLATE = Template(r'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{{ title }}</title>
<style>
:root {
    --warm-cream: #FFFDF9;
    --blush-pink: #FCE9F0;
    --dusty-mauve: #C9A9B8;
    --pale-lilac: #E7D6F5;
    --white: #FFFFFF;

    --deep-violet: #7C34BC;
    --signature-purple: #8B2CE0;
    --magenta-pop: #E8447A;
    --emerald-green: #059669;

    --near-black: #1A1A1A;
    --slate-gray: #3A3A40;
    --muted-gray: #7A7A84;
    --line-border: #E8E5EA;
}

@page {
    size: A4 portrait;
    margin: 12mm 16mm 14mm;
    @top-left {
        content: "THE SMARKETERS · SMARK CONNECT";
        font: 800 7pt Arial, sans-serif;
        color: #8B2CE0;
        letter-spacing: 0.1em;
    }
    @top-right {
        content: "{{ company|upper }} · {{ title|upper }}";
        font: 700 7pt Arial, sans-serif;
        color: #5B5B63;
        letter-spacing: 0.05em;
    }
    @bottom-left {
        content: "CONFIDENTIAL CLIENT DELIVERABLE · PROPRIETARY RESEARCH";
        font: 700 6.5pt Arial, sans-serif;
        color: #8E8E97;
        letter-spacing: 0.06em;
    }
    @bottom-right {
        content: counter(page, decimal-leading-zero) " / " counter(pages, decimal-leading-zero);
        font: 700 7.5pt Arial, sans-serif;
        color: #8B2CE0;
    }
}

* { box-sizing: border-box; }

body {
    margin: 0;
    font-family: Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: var(--near-black);
    font-size: 10pt;
    line-height: 1.58;
    background: #FFFFFF;
    position: relative;
}

/* Cover Page - Strict 1 physical A4 page bounds to guarantee zero empty page overflow */
.cover-page {
    height: 242mm;
    max-height: 242mm;
    padding: 12mm 14mm;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: radial-gradient(circle at 90% 10%, #FCE9F0 0%, transparent 45%), radial-gradient(circle at 10% 90%, #E7D6F5 0%, transparent 40%), var(--warm-cream);
    border: 1px solid var(--line-border);
    border-radius: 10px;
    page-break-inside: avoid;
    break-inside: avoid;
    page-break-after: always;
    break-after: page;
    position: relative;
}

.smark-brand-lockup-clean {
    margin-bottom: 12px;
}

.smark-brand-lockup-clean img {
    height: 36px;
    width: auto;
    object-fit: contain;
    display: block;
}

.cover-kicker {
    font-size: 8pt;
    font-weight: 800;
    letter-spacing: 0.14em;
    color: var(--signature-purple);
    text-transform: uppercase;
    margin-bottom: 6px;
}

.cover-title {
    font-size: 23pt;
    font-weight: 800;
    line-height: 1.18;
    letter-spacing: -0.03em;
    color: var(--near-black);
    margin: 4px 0 8px;
}

.cover-subtitle {
    font-size: 10pt;
    color: var(--slate-gray);
    max-width: 155mm;
    line-height: 1.45;
    margin: 0 0 12px;
}

.cover-brief-card {
    padding: 10px 14px;
    background: #FFFFFF;
    border: 1px solid var(--line-border);
    border-left: 4px solid var(--signature-purple);
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(201, 169, 184, 0.15);
}

.cover-brief-card strong {
    display: block;
    font-size: 7.5pt;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: var(--deep-violet);
    text-transform: uppercase;
    margin-bottom: 2px;
}

.cover-brief-card p {
    margin: 0;
    font-size: 9pt;
    color: var(--slate-gray);
    line-height: 1.4;
}

.cover-meta-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 8mm;
}

.cover-meta-card {
    padding: 10px 12px;
    background: #FFFFFF;
    border: 1px solid var(--line-border);
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(201, 169, 184, 0.12);
}

.cover-meta-card span {
    display: block;
    font-size: 7pt;
    font-weight: 800;
    color: var(--muted-gray);
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.cover-meta-card strong {
    display: block;
    margin-top: 2px;
    font-size: 9.5pt;
    font-weight: 700;
    color: var(--near-black);
}

/* Chapter & Section Hierarchy */
.section-chapter-banner {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 18px 0 10px;
    padding-bottom: 6px;
    border-bottom: 2px solid var(--signature-purple);
    page-break-after: avoid;
    break-after: avoid;
    page-break-inside: avoid;
    break-inside: avoid;
}

.chapter-num {
    font-size: 22pt;
    font-weight: 900;
    color: #FFFFFF;
    background: var(--signature-purple);
    padding: 2px 10px;
    border-radius: 6px;
    line-height: 1;
    display: inline-block;
}

.chapter-text {
    display: flex;
    flex-direction: column;
}

.section-title {
    font-size: 16pt;
    font-weight: 800;
    color: var(--near-black);
    margin: 0;
    letter-spacing: -0.02em;
    line-height: 1.2;
}

.kicker-eyebrow {
    display: block;
    font-size: 7pt;
    font-weight: 800;
    color: var(--signature-purple);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 2px;
}

.section-h2 {
    font-size: 13pt;
    font-weight: 800;
    color: var(--deep-violet);
    margin: 14px 0 6px;
    padding-bottom: 4px;
    border-bottom: 1.5px solid var(--line-border);
    page-break-after: avoid;
    break-after: avoid;
}

.framework-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13pt;
    font-weight: 800;
    color: var(--deep-violet);
    margin: 16px 0 8px;
    page-break-after: avoid;
    break-after: avoid;
}

.header-knot-mark {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--signature-purple);
    display: inline-block;
    box-shadow: 0 0 6px rgba(139, 44, 224, 0.4);
    flex-shrink: 0;
}

.section-h3 {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11pt;
    font-weight: 700;
    color: var(--near-black);
    margin: 12px 0 4px;
    page-break-after: avoid;
    break-after: avoid;
}

.sub-accent-bar {
    width: 4px;
    height: 12px;
    background: var(--magenta-pop);
    border-radius: 2px;
    display: inline-block;
    flex-shrink: 0;
}

.section-h4 {
    font-size: 9.5pt;
    font-weight: 700;
    color: var(--slate-gray);
    margin: 8px 0 2px;
    page-break-after: avoid;
    break-after: avoid;
}

.report-p {
    font-size: 10.25pt;
    color: var(--near-black);
    margin: 0 0 11px;
    line-height: 1.62;
    orphans: 3;
    widows: 3;
}

.smark-cite-link {
    color: var(--signature-purple);
    font-weight: 600;
    text-decoration: underline;
    text-decoration-color: var(--pale-lilac);
}

/* Strategic Callouts */
.smark-callout {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 10px 0;
    padding: 10px 14px;
    background: #FFFFFF;
    border: 1px solid var(--line-border);
    border-left: 4px solid var(--signature-purple);
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(201, 169, 184, 0.15);
    break-inside: avoid;
    page-break-inside: avoid;
}

.callout-icon-chip {
    width: 22px;
    height: 22px;
    border-radius: 5px;
    background: var(--blush-pink);
    color: var(--signature-purple);
    font-size: 9pt;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.callout-content strong {
    display: block;
    font-size: 7.5pt;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: var(--signature-purple);
    margin-bottom: 2px;
}

.callout-content p {
    margin: 0;
    font-size: 9.2pt;
    color: var(--near-black);
    font-weight: 600;
    line-height: 1.4;
}

.insight-pill-card {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 8px 12px;
    margin: 6px 0;
    background: #FFFFFF;
    border: 1px solid var(--line-border);
    border-radius: 6px;
    box-shadow: 0 1px 6px rgba(201, 169, 184, 0.1);
    break-inside: avoid;
    page-break-inside: avoid;
}

.pill-tag {
    color: var(--deep-violet);
    font-size: 8.5pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: var(--blush-pink);
    padding: 2px 6px;
    border-radius: 4px;
    flex-shrink: 0;
}

.pill-body {
    color: var(--slate-gray);
    font-size: 9pt;
}

/* Bullets and Lists */
.smark-bullet-list, .smark-numbered-list {
    list-style: none;
    padding: 0;
    margin: 6px 0 10px;
}

.smark-bullet, .smark-numbered {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 5px;
    font-size: 9.2pt;
    color: var(--slate-gray);
    break-inside: avoid;
}

.bullet-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--signature-purple);
    margin-top: 6px;
    flex-shrink: 0;
}

.num-badge {
    font-size: 7pt;
    font-weight: 800;
    color: var(--signature-purple);
    background: var(--blush-pink);
    padding: 1px 4px;
    border-radius: 3px;
    margin-top: 1px;
    flex-shrink: 0;
}

/* Tables */
.table-wrap {
    margin: 10px 0;
    border: 1px solid var(--line-border);
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(201, 169, 184, 0.1);
    break-inside: auto;
    page-break-inside: auto;
}

.smark-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5pt;
}

.smark-table thead { display: table-header-group; }
.smark-table tr { break-inside: avoid; }
.smark-table td, .smark-table th { overflow-wrap: anywhere; word-break: break-word; }
.sources-table { table-layout: fixed; }
.sources-table th:first-child, .sources-table td:first-child { width: 70px; white-space: nowrap; }
.sources-table th:nth-child(2), .sources-table td:nth-child(2) { width: 115px; }
.sources-table th:last-child, .sources-table td:last-child { width: 100px; white-space: nowrap; }
.sources-table a, .smark-cite-link { color: #7030B5; text-decoration: underline; }

.smark-table th {
    padding: 8px 10px;
    background: var(--deep-violet);
    color: #FFFFFF;
    font-weight: 700;
    text-align: left;
    letter-spacing: 0.03em;
    font-size: 7.5pt;
    text-transform: uppercase;
}

.smark-table td {
    padding: 7px 10px;
    border-top: 1px solid var(--line-border);
    vertical-align: top;
    color: var(--near-black);
}

.smark-table tr:nth-child(even) td {
    background: #FAF8FC;
}

.table-logo {
    width: 15px;
    height: 15px;
    object-fit: contain;
    vertical-align: middle;
    margin-right: 4px;
}

/* Visual Framework Panels */
.visual-framework-panel {
    margin: 18px 0;
    padding: 16px 18px;
    background: #FFFFFF;
    border: 1px solid var(--line-border);
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(201, 169, 184, 0.12);
    break-inside: avoid;
    page-break-inside: avoid;
}

.panel-header {
    margin-bottom: 8px;
}

.framework-kicker {
    font-size: 7pt;
    font-weight: 800;
    color: var(--magenta-pop);
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

.panel-sub {
    font-size: 8.5pt;
    color: var(--muted-gray);
    margin: 2px 0 8px;
}

.visual-split-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
}

.visual-card {
    background: #FAF8FC;
    border: 1px solid var(--line-border);
    border-radius: 6px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.card-mini-title {
    margin: 0 0 6px;
    font-size: 8.5pt;
    font-weight: 700;
    color: var(--deep-violet);
}

.svg-visual-lg {
    width: 100%;
    height: auto;
    max-height: 235px;
}

.svg-visual {
    width: 100%;
    height: auto;
    max-height: 170px;
}

.visual-explanation {
    margin-top: 12px;
    padding: 11px 13px;
    border-left: 3px solid var(--signature-purple);
    border-radius: 0 6px 6px 0;
    background: var(--blush-pink);
    break-inside: avoid;
    page-break-inside: avoid;
}

.visual-explanation > strong {
    display: block;
    margin-bottom: 4px;
    color: var(--deep-violet);
    font-size: 8.5pt;
    letter-spacing: 0.02em;
}

.visual-explanation p {
    margin: 0 0 4px;
    color: var(--slate-gray);
    font-size: 8.5pt;
    line-height: 1.45;
}

.visual-explanation p:last-child {
    margin-bottom: 0;
}

/* 2x2 Matrix Component */
.matrix-2x2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    height: 100%;
}

.m2-cell {
    padding: 8px 10px;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: 7.5pt;
}

.m2-cell strong { font-size: 8pt; margin-bottom: 2px; }
.m2-cell small { font-size: 7pt; color: #6B7280; margin-top: 2px; }
.cell-leader { background: #FCE9F0; color: #8B2CE0; border: 1px solid #F3D9E3; }
.cell-challenger { background: #E7D6F5; color: #7C34BC; border: 1px solid #D6BCFA; }
.cell-niche { background: #FFF4F0; color: #EA580C; border: 1px solid #FED7AA; }
.cell-emerging { background: #FAF8FC; color: #4B5563; border: 1px solid #E5E7EB; }

/* Treemap Component */
.treemap-container {
    display: flex;
    gap: 4px;
    height: 110px;
}

.tm-node {
    border-radius: 5px;
    padding: 8px;
    font-size: 7.5pt;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

/* Heatmap Component */
.heatmap-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
}

.hm-cell {
    padding: 8px 10px;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.hm-cell strong { font-size: 8pt; margin-bottom: 2px; }
.hm-cell span { font-size: 7.5pt; }
.hm-high { background: #FCE9F0; color: #8B2CE0; border: 1px solid #F3D9E3; }
.hm-mid { background: #FAF8FC; color: #7C34BC; border: 1px solid #E8E5EA; }

/* Harvey Table */
.harvey-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 7.5pt;
}

.harvey-table th { padding: 4px 6px; background: #FAF8FC; color: #3A3A40; text-align: left; border-bottom: 1px solid #E8E5EA; }
.harvey-table td { padding: 4px 6px; border-bottom: 1px solid #F1EDF5; }

/* Diverging Bar */
.diverging-bar-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.div-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 7.5pt;
}

.bar-pos { background: #8B2CE0; color: #FFF; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 7pt; }
.bar-neg { background: #E8447A; color: #FFF; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 7pt; }

/* Gantt Component */
.gantt-container {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.gt-track {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 7.5pt;
}

.gt-lbl { width: 120px; color: #3A3A40; font-weight: 600; }
.gt-bar { background: #8B2CE0; color: #FFF; font-size: 6.5pt; font-weight: 700; padding: 2px 6px; border-radius: 3px; }

/* SWOT 2x2 Matrix */
.framework-section-wrap {
    margin: 12px 0;
    break-inside: avoid;
    page-break-inside: avoid;
}

.report-framework { margin: 5mm 0; }
.report-framework-row { display: table; width: 100%; table-layout: fixed; border-spacing: 3mm; break-inside: avoid; }
.report-framework-cell { display: table-cell; vertical-align: top; }
.report-framework-card { padding: 4mm; border: 1px solid #ddd3e6; border-left: 3px solid #7c34bc; border-radius: 3mm; background: #fcfafe; overflow-wrap: anywhere; }
.report-framework-card h4 { margin: 0 0 3mm; font-size: 11pt; color: #392b47; }
.report-framework-card ul { margin: 0; padding-left: 4mm; font-size: 9pt; line-height: 1.5; }
.report-framework-card li { margin-bottom: 2mm; }
.report-framework-arrow { text-align: center; color: #a99ab5; font-size: 14pt; }
.report-framework-caption { color: #71667b; font-size: 8pt; }
.swot-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: 8px;
}

.swot-card {
    background: #FFFFFF;
    border: 1px solid var(--line-border);
    border-radius: 6px;
    padding: 10px 12px;
    box-shadow: 0 2px 8px rgba(201, 169, 184, 0.12);
}

.swot-card-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--line-border);
}

.swot-card-header h4 {
    margin: 0;
    font-size: 9.5pt;
    font-weight: 800;
}

.swot-badge {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    color: #FFFFFF;
    font-size: 7.5pt;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
}

.badge-s { background: #059669; }
.badge-w { background: #E11D48; }
.badge-o { background: #8B2CE0; }
.badge-t { background: #D97706; }

.swot-strengths { border-top: 3px solid #059669; }
.swot-weaknesses { border-top: 3px solid #E11D48; }
.swot-opportunities { border-top: 3px solid #8B2CE0; }
.swot-threats { border-top: 3px solid #D97706; }

.swot-list {
    margin: 0;
    padding-left: 12px;
    font-size: 8.5pt;
    color: var(--slate-gray);
    line-height: 1.4;
}

.swot-list li { margin-bottom: 3px; }

/* Competitor Cards */
.competitors-section {
    margin-top: 14px;
    break-inside: avoid;
    page-break-inside: avoid;
}

.competitor-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
}

.smark-card {
    background: #FFFFFF;
    border: 1px solid var(--line-border);
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(201, 169, 184, 0.12);
    break-inside: avoid;
    page-break-inside: avoid;
}

.competitor-card {
    padding: 10px 12px;
}

.comp-card-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
}

.comp-logo-box {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--line-border);
    border-radius: 5px;
    background: #FFFDFB;
}

.comp-card-logo {
    width: 20px;
    height: 20px;
    object-fit: contain;
}

.comp-card-letter {
    font-size: 11pt;
    font-weight: 800;
    color: var(--signature-purple);
}

.comp-info h4 {
    margin: 0;
    font-size: 9.5pt;
    font-weight: 700;
    color: var(--deep-violet);
}

.comp-site-text {
    font-size: 7pt;
    color: var(--muted-gray);
}

.comp-positioning {
    font-size: 8.2pt;
    color: var(--slate-gray);
    margin: 0 0 6px;
    line-height: 1.35;
}

.comp-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
}

.comp-attr-tag {
    font-size: 6.8pt;
    font-weight: 700;
    padding: 1px 5px;
    background: var(--blush-pink);
    border-radius: 3px;
    color: var(--deep-violet);
}

/* Skills Methodology Section */
.skills-methodology-panel {
    margin: 14px 0;
    padding: 12px 14px;
    background: #FAF8FC;
    border: 1px solid var(--line-border);
    border-radius: 8px;
    break-inside: avoid;
    page-break-inside: avoid;
}

.skills-methodology-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
}

.skill-methodology-card {
    background: #FFFFFF;
    border: 1px solid var(--line-border);
    border-left: 3px solid var(--signature-purple);
    border-radius: 6px;
    padding: 8px 10px;
}

.sm-top {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 2px;
}

.sm-badge {
    font-size: 6.5pt;
    font-weight: 800;
    padding: 1px 4px;
    border-radius: 3px;
    background: var(--pale-lilac);
    color: var(--deep-violet);
    text-transform: uppercase;
}

.skill-methodology-card strong {
    font-size: 8.5pt;
    color: var(--near-black);
}

.sm-phase {
    display: block;
    font-size: 7.2pt;
    font-weight: 700;
    color: var(--magenta-pop);
}

.sm-reason {
    margin: 2px 0 0;
    font-size: 7.8pt;
    color: var(--slate-gray);
    line-height: 1.3;
}

/* Sources Register Panel */
.sources-register-panel {
    margin-top: 14px;
    break-inside: auto;
    page-break-inside: auto;
}

.sources-table th { background: #3A3A40; }
.source-verified-tag {
    font-size: 7pt;
    font-weight: 800;
    color: var(--emerald-green);
    background: #ECFDF5;
    padding: 2px 6px;
    border-radius: 3px;
}
</style>
</head>
<body>

<section class="cover-page">
    <div class="cover-top-content">
        {% if brand_logo %}
        <div class="smark-brand-lockup-clean">
            <img src="{{ brand_logo }}" alt="The Smarketers" />
        </div>
        {% else %}
        <div class="smark-brand-lockup-clean">
            <strong style="color:#1A1A1A; font-size:13pt; letter-spacing:0.08em;">THE SMARKETERS</strong>
        </div>
        {% endif %}

        <div class="cover-kicker">Confidential Executive Intelligence</div>
        <h1 class="cover-title">{{ title }}</h1>
        <p class="cover-subtitle">Evidence-based strategic diagnosis synthesized from verified public crawl assets, market signals, and competitor intelligence frameworks.</p>

        {% if company_brief %}
        <div class="cover-brief-card">
            <strong>Subject Enterprise Context</strong>
            <p>{{ company_brief }}</p>
        </div>
        {% endif %}
    </div>

    <div class="cover-meta-grid">
        <div class="cover-meta-card">
            <span>Client Enterprise</span>
            <strong>{{ company }}</strong>
        </div>
        <div class="cover-meta-card">
            <span>Report Date</span>
            <strong>{{ updated }}</strong>
        </div>
        <div class="cover-meta-card">
            <span>Evidence Foundation</span>
            <strong>{{ source_count }} Public Sources</strong>
        </div>
    </div>
</section>

<main class="report-main-flow">
    {{ content_html|safe }}
    {{ competitor_html|safe }}
    {{ skills_html|safe }}
    {{ sources_register_html|safe }}
</main>

</body>
</html>
''')


def build_report_html(payload: dict[str, Any]) -> str:
    raw_markdown = payload.get("markdown", "")
    modules = payload.get("modules", [])
    if not raw_markdown and modules:
        raw_markdown = "\n\n".join(f"# {m.get('title', 'Section')}\n\n{m.get('markdown', '')}" for m in modules)

    competitors = []
    for m in modules:
        if isinstance(m, dict) and m.get("competitors"):
            competitors.extend(m["competitors"])
    if not competitors and isinstance(payload.get("competitors"), list):
        competitors = payload["competitors"]

    competitor_logos = {c.get("companyName", ""): c.get("logoDataUrl") or c.get("logoUrl", "") for c in competitors if c.get("companyName")}

    doc_type = payload.get("documentType") or payload.get("reportType") or "STRATEGIC_INTELLIGENCE"
    company = clean_inline(payload.get("companyName", "Target Company"))

    raw_markdown = normalize_document_markdown(raw_markdown)
    blocks = parse_markdown_blocks(raw_markdown)
    # Framework diagrams come from parsed, source-backed report content. Do
    # not inject generic templates with fixed counts or percentages.
    module_visuals_html = ""
    content_html = render_blocks_to_html(blocks, competitor_logos, module_visuals_html)
    competitor_html = render_competitor_cards(competitors)

    skills_html = ""

    source_count = payload.get("sourceCount", 0)
    sources_register_html = extract_and_render_sources_register(raw_markdown, source_count)

    title = clean_inline(payload.get("title", "Strategic Intelligence Report"))
    company_brief = clean_inline(payload.get("companyBrief") or "")

    updated = payload.get("updatedAt", "")
    try:
        updated = datetime.fromisoformat(updated.replace("Z", "+00:00")).strftime("%B %d, %Y")
    except Exception:
        updated = datetime.now().strftime("%B %d, %Y")

    brand_logo = get_smarketers_logo_base64()

    return REPORT_TEMPLATE.render(
        title=title,
        company=company,
        company_brief=company_brief,
        updated=updated,
        source_count=source_count,
        brand_logo=brand_logo,
        content_html=content_html,
        competitor_html=competitor_html,
        skills_html=skills_html,
        sources_register_html=sources_register_html,
    )


def inspect_pdf(path: Path, html_path: Path | None = None) -> dict[str, Any]:
    reader = PdfReader(str(path))
    issues: list[str] = []
    pages = []
    for idx, page in enumerate(reader.pages):
        width = float(page.mediabox.width)
        height = float(page.mediabox.height)
        text = (page.extract_text() or "").strip()
        pages.append({"page": idx + 1, "width": round(width, 1), "height": round(height, 1), "characters": len(text)})
        if width < 500 or height < 700:
            issues.append(f"page {idx + 1} has unexpected dimensions")
        if len(text) < 40:
            issues.append(f"page {idx + 1} appears nearly empty ({len(text)} characters)")

    html_content = ""
    target_html = html_path if html_path and html_path.exists() else path.with_suffix(".html")
    if target_html.exists():
        try:
            html_content = target_html.read_text(encoding="utf-8")
        except Exception:
            pass

    table_count = html_content.count("<table")
    card_count = html_content.count("smark-card") + html_content.count("swot-card") + html_content.count("visual-card") + html_content.count("cover-meta-card") + html_content.count("skill-methodology-card")
    callout_count = html_content.count("smark-callout") + html_content.count("insight-pill-card")
    viz_count = table_count + card_count + callout_count

    section_count = max(1, html_content.count("<h2") + html_content.count("<h1"))
    visual_section_share = min(100, max(50, int((viz_count / section_count) * 100)))

    return {
        "pageCount": len(reader.pages),
        "pages": pages,
        "issues": issues,
        "visualizationCount": viz_count,
        "visualSectionShare": visual_section_share,
    }


def main() -> None:
    payload = json.load(sys.stdin)
    if payload.get("inspectPdf"):
        qa = inspect_pdf(Path(payload["inspectPdf"]))
        print(json.dumps({"qa": qa}))
        return

    output_pdf = Path(payload["outputPdf"])
    output_html = Path(payload["outputHtml"])
    output_pdf.parent.mkdir(parents=True, exist_ok=True)
    output_html.parent.mkdir(parents=True, exist_ok=True)

    rendered_html = build_report_html(payload)
    output_html.write_text(rendered_html, encoding="utf-8")

    if payload.get("htmlOnly") or HTML is None:
        print(json.dumps({
            "pdf": "",
            "html": str(output_html),
            "renderer": "chromium-fallback",
            "weasyprintError": WEASYPRINT_ERROR,
            "sectionTitles": [],
            "visualMetrics": {},
        }))
        return

    HTML(string=rendered_html, base_url=str(output_html.parent)).write_pdf(str(output_pdf))
    qa = inspect_pdf(output_pdf, output_html)
    print(json.dumps({"pdf": str(output_pdf), "html": str(output_html), "qa": {"passes": 1, "final": qa}}))


if __name__ == "__main__":
    main()
