#!/usr/bin/env bash
# Build one uploadable ZIP per skill for claude.ai (Customize > Skills > + Create skill).
# Each ZIP contains the skill FOLDER at its root — the format claude.ai expects.
#
# Self-containment: many skills point at a shared connection guide in tools/integrations/
# (e.g. veo-3 -> veo.md, and every publishing skill -> woopsocial.md). That guide lives
# OUTSIDE the skill folder, so a standalone upload can't see it. At build time we copy each
# skill's referenced guide(s) into the zip under references/tools/ so the uploaded skill is
# self-contained. The repo itself stays single-source — nothing is duplicated on disk.
#
# Usage: ./scripts/build-skill-zips.sh   (outputs to dist/)
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$PWD"
mkdir -p dist
rm -f dist/*.zip

for dir in skills/*/; do
  name=$(basename "$dir")
  stage=$(mktemp -d)
  cp -R "skills/$name" "$stage/$name"

  # Find referenced integration guides and embed them so the skill is self-contained.
  guides=$(grep -rhoE 'integrations/[a-z0-9-]+\.md' "skills/$name" 2>/dev/null | sed 's#integrations/##' | sort -u || true)
  if [ -n "$guides" ]; then
    mkdir -p "$stage/$name/references/tools"
    for g in $guides; do
      [ -f "tools/integrations/$g" ] && cp "tools/integrations/$g" "$stage/$name/references/tools/$g"
    done
  fi

  (cd "$stage" && zip -qr "$ROOT/dist/${name}.zip" "$name" -x "*.DS_Store")
  rm -rf "$stage"
  echo "built dist/${name}.zip${guides:+  (+ ${guides// /, }guides)}"
done

echo ""
echo "$(ls dist/*.zip | wc -l | tr -d ' ') skill zips in dist/ — each self-contained. Attach to a GitHub release."
