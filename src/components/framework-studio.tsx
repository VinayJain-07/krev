"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { Download, FileJson2, LayoutGrid, RotateCcw, Search, X } from "lucide-react";
import { FRAMEWORK_TEMPLATES } from "@/visuals/engine/templates/frameworks";
import { PrimitiveEngine } from "@/visuals/engine/primitives/PrimitiveEngine";
import type { CompleteFramework, FrameworkConfig, PrimitiveType } from "@/visuals/engine/types/schema";
import { isStudioConfig } from "@/lib/documents/studio-config";
import "./framework-studio.css";

const primitiveTypes: PrimitiveType[] = ["matrix", "funnel", "flow", "tree", "map", "bridge", "time", "network"];

export function FrameworkStudio({ companyId, companyName, reportFrameworks, focusDocumentId }: {
  companyId: string;
  companyName: string;
  reportFrameworks: CompleteFramework[];
  focusDocumentId?: string;
}) {
  const original = useMemo(() => [...reportFrameworks, ...FRAMEWORK_TEMPLATES], [reportFrameworks]);
  const initial = reportFrameworks.find((framework) => focusDocumentId && framework.meta.id.startsWith(`report-${focusDocumentId}-`)) ?? reportFrameworks[0] ?? FRAMEWORK_TEMPLATES[0];
  const [frameworks, setFrameworks] = useState<CompleteFramework[]>(original);
  const [source, setSource] = useState<"reports" | "examples">(initial.meta.id.startsWith("report-") ? "reports" : "examples");
  const [selectedId, setSelectedId] = useState(initial.meta.id);
  const [query, setQuery] = useState("");
  const [primitive, setPrimitive] = useState<PrimitiveType | "all">("all");
  const [jsonOpen, setJsonOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [message, setMessage] = useState("");
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const visible = frameworks.filter((framework) => {
    if (source === "reports" && !framework.meta.id.startsWith("report-")) return false;
    if (source === "examples" && framework.meta.id.startsWith("report-")) return false;
    if (primitive !== "all" && framework.config.primitive !== primitive) return false;
    const search = `${framework.meta.name} ${framework.meta.description} ${framework.meta.tags.join(" ")}`.toLowerCase();
    return search.includes(query.toLowerCase());
  });
  const current = frameworks.find((framework) => framework.meta.id === selectedId) ?? initial;
  const isReport = current.meta.id.startsWith("report-");

  function changeSource(next: "reports" | "examples") {
    setSource(next);
    setQuery("");
    setPrimitive("all");
    const first = frameworks.find((framework) => next === "reports" ? framework.meta.id.startsWith("report-") : !framework.meta.id.startsWith("report-"));
    if (first) setSelectedId(first.meta.id);
    setJsonOpen(false);
    setMessage("");
  }

  function updateConfig(config: FrameworkConfig) {
    setFrameworks((items) => items.map((item) => item.meta.id === current.meta.id ? { ...item, config } : item));
  }

  function changePrimitive(next: PrimitiveType | "all") {
    setPrimitive(next);
    const first = visible.find((framework) => next === "all" || framework.config.primitive === next) ??
      frameworks.find((framework) => (source === "reports" ? framework.meta.id.startsWith("report-") : !framework.meta.id.startsWith("report-")) && (next === "all" || framework.config.primitive === next));
    if (first) setSelectedId(first.meta.id);
    setJsonOpen(false);
    setMessage("");
  }

  function resetCurrent() {
    const template = original.find((item) => item.meta.id === current.meta.id);
    if (template) setFrameworks((items) => items.map((item) => item.meta.id === current.meta.id ? template : item));
    setMessage("This canvas has been reset to its starting data.");
  }

  function applyJson() {
    try {
      const value: unknown = JSON.parse(jsonText);
      if (!isStudioConfig(value, current.config.primitive)) throw new Error("Keep the same visual type and its required fields, arrays, and value types.");
      updateConfig(value);
      setJsonOpen(false);
      setMessage("Canvas updated from JSON. These changes are local to this page.");
    } catch (cause) {
      setMessage(cause instanceof SyntaxError ? "The JSON has a syntax error. Check commas and brackets." : cause instanceof Error ? cause.message : "The JSON could not be applied.");
    }
  }

  async function exportPng() {
    if (!canvasRef.current || exporting) return;
    setExporting(true);
    setMessage("");
    try {
      const dataUrl = await toPng(canvasRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: "#0f172a", skipFonts: true });
      const link = window.document.createElement("a");
      link.href = dataUrl;
      link.download = `${current.meta.id.replace(/[^a-z0-9-]/gi, "-")}-visual.png`;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage("PNG exported. Review example values before sharing it.");
    } catch {
      setMessage("The PNG could not be exported. Try again after the canvas finishes rendering.");
    } finally {
      setExporting(false);
    }
  }

  return <main className="visual-studio">
    <header className="visual-studio-header">
      <div className="visual-studio-brand"><span><LayoutGrid size={20} /></span><div><small>SMARK CONNECT / {companyName}</small><h1>Visual Framework Studio</h1></div></div>
      <div className="visual-studio-header-actions"><Link href={`/dashboard/${companyId}`}>Back to dashboard</Link><button type="button" onClick={() => { setJsonText(JSON.stringify(current.config, null, 2)); setJsonOpen(true); setMessage(""); }}><FileJson2 size={16} /> Edit data</button><button className="visual-studio-primary" type="button" onClick={() => void exportPng()} disabled={exporting}><Download size={16} /> {exporting ? "Exporting…" : "Export PNG"}</button></div>
    </header>
    <div className="visual-studio-layout">
      <aside className="visual-studio-catalog" aria-label="Framework catalog">
        <div className="visual-studio-tabs" role="group" aria-label="Framework source"><button type="button" className={source === "reports" ? "active" : ""} onClick={() => changeSource("reports")} disabled={!reportFrameworks.length}>Your reports <span>{reportFrameworks.length}</span></button><button type="button" className={source === "examples" ? "active" : ""} onClick={() => changeSource("examples")}>Examples <span>{FRAMEWORK_TEMPLATES.length}</span></button></div>
        <label className="visual-studio-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search frameworks" /></label>
        <div className="visual-studio-filters" aria-label="Visual types"><button type="button" className={primitive === "all" ? "active" : ""} onClick={() => changePrimitive("all")}>All</button>{primitiveTypes.map((type) => <button type="button" className={primitive === type ? "active" : ""} key={type} onClick={() => changePrimitive(type)}>{type}</button>)}</div>
        <div className="visual-studio-list">{visible.length ? visible.map((framework) => <button type="button" key={framework.meta.id} className={selectedId === framework.meta.id ? "selected" : ""} onClick={() => { setSelectedId(framework.meta.id); setMessage(""); setJsonOpen(false); }}><span>{framework.meta.primitive}</span><strong>{framework.meta.name}</strong><small>{framework.meta.description}</small></button>) : <p>No frameworks match this filter.</p>}</div>
      </aside>
      <section className="visual-studio-main" aria-label="Interactive framework canvas">
        <div className="visual-studio-intro"><div><span>{isReport ? "FROM SAVED REPORT" : "ILLUSTRATIVE EXAMPLE"}</span><h2>{current.meta.name}</h2><p>{isReport ? "The content below comes from a saved report. Studio edits stay on this page and do not change the report or its PDF." : "This template contains sample claims and numbers. Replace them with verified company evidence before sharing."}</p></div><button type="button" onClick={resetCurrent}><RotateCcw size={15} /> Reset canvas</button></div>
        <div ref={canvasRef} className="visual-studio-canvas"><PrimitiveEngine framework={current} onConfigChange={updateConfig} isEditable /></div>
        {message && <p className="visual-studio-message" role="status">{message}</p>}
      </section>
    </div>
    {jsonOpen && <div className="visual-studio-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setJsonOpen(false); }}><section className="visual-studio-modal" role="dialog" aria-modal="true" aria-label="Edit framework data"><div><h2>Edit canvas data</h2><button type="button" aria-label="Close data editor" onClick={() => setJsonOpen(false)}><X size={19} /></button></div><p>Edit the JSON for this visual type. Changes stay on this page until you leave or reset it.</p><textarea spellCheck={false} value={jsonText} onChange={(event) => setJsonText(event.target.value)} /><footer><button type="button" onClick={() => setJsonOpen(false)}>Cancel</button><button type="button" onClick={applyJson}>Apply to canvas</button></footer>{message && <p role="alert">{message}</p>}</section></div>}
  </main>;
}
