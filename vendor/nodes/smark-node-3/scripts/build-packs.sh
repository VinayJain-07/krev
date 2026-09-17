#!/usr/bin/env bash
# Build topic-pack bundles for claude.ai web users.
# Each pack ZIP contains: one ready-to-upload ZIP per skill + a README.txt with upload steps.
# (claude.ai takes ONE skill per upload, so a pack is a bundle of per-skill ZIPs, not one mega-skill.)
# Usage: ./scripts/build-packs.sh   (outputs to dist/packs/; builds per-skill zips first if missing)
set -euo pipefail

cd "$(dirname "$0")/.."
MANIFEST="scripts/packs.json"

# 1. Rebuild per-skill zips (always — stale zips silently omit new skills)
./scripts/build-skill-zips.sh >/dev/null

mkdir -p dist/packs
rm -f dist/packs/*.zip

# 2. Validate every referenced skill exists
python3 - "$MANIFEST" <<'EOF'
import json, os, sys
m = json.load(open(sys.argv[1]))
missing = [(p["name"], s) for p in m["packs"] for s in p["skills"] if not os.path.isdir(f"skills/{s}")]
if missing:
    for pack, s in missing: print(f"ERROR: pack '{pack}' references missing skill '{s}'")
    sys.exit(1)
print(f"manifest OK: {len(m['packs'])} packs, all skills resolve")
EOF

# 3. Assemble each pack
python3 - "$MANIFEST" <<'EOF'
import json, os, shutil, subprocess, sys, tempfile
m = json.load(open(sys.argv[1]))
for p in m["packs"]:
    with tempfile.TemporaryDirectory() as tmp:
        root = os.path.join(tmp, p["name"])
        os.makedirs(root)
        for s in p["skills"]:
            shutil.copy(f"dist/{s}.zip", os.path.join(root, f"{s}.zip"))
        steps = "\n".join(f"  {i+1}. {s}.zip" for i, s in enumerate(p["skills"]))
        header = f'{p["title"]} — {p.get("tagline", "")}'.rstrip(" —")
        readme = f"""{header}
{"=" * len(header)}

{p["description"]}

HOW TO INSTALL (Claude on web or mobile — any plan)
1. In Claude, open Customize > Skills and click "+ Create skill".
   (Code execution must be enabled in Settings.)
2. Upload each ZIP in this pack, one at a time, in this order:
{steps}
3. Toggle each skill on. Done.

FIRST STEPS
Work in one chat per brand. Say "Set up my brand profile" first —
every other skill reads the profile it creates. Then try
"Build my content calendar" or "Write this week's posts".
When your content is ready to go out, the scheduling skill will
walk you through connecting your accounts.

More skills and packs: see the repository this pack came from.
"""
        with open(os.path.join(root, "README.txt"), "w") as f:
            f.write(readme)
        out = os.path.abspath(f"dist/packs/{p['name']}-pack.zip")
        subprocess.run(["zip", "-qr", out, p["name"]], cwd=tmp, check=True)
        print(f"built dist/packs/{p['name']}-pack.zip ({len(p['skills'])} skills)")
print("\nAttach dist/packs/*.zip (and dist/*.zip for single skills) to a GitHub release or the website.")
EOF
