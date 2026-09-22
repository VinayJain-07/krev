<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 🛡️ MANDATORY CODING AGENT RESTRICTIONS & SECURITY GOVERNANCE

> [!CAUTION]
> **STRICT POLICY: NO AUTONOMOUS COMMITS OR DIRECT PUSHES TO REMOTE REPOSITORIES**
> 
> All AI coding assistants (including Antigravity, Cursor, Claude Code, Copilot, Windsurf, Aider, Devin, or any automated CLI/API agent) operating on this repository must strictly adhere to the following rules:
>
> 1. **NO DIRECT COMMITS OR PUSHES TO REMOTE REPOSITORIES**:
>    - Agents must NEVER execute `git push`, `git push --force`, `git commit`, `git merge`, or `git rebase` on any remote branches (especially `main`).
>    - Pushing and committing changes to GitHub (`thesmarketers/Smark-Connect` or any remote) **MUST ONLY BE PERFORMED MANUALLY BY A HUMAN DEVELOPER**.
> 2. **PROPOSE LOCAL CHANGES AS REVIEWABLE DIFFS ONLY**:
>    - Agents may only propose, draft, or stage changes locally when explicitly asked by the user.
>    - The final deployment, commit, and git push MUST be done manually by human intervention.
> 3. **PROHIBITION OF SECRET EXPOSURE & MUTATION**:
>    - Never write, modify, print, or commit secrets, `.env*` files, API keys, tokens, or credentials.
> 4. **DESTRUCTIVE COMMANDS FORBIDDEN**:
>    - Never run `git reset --hard`, `git clean -f`, or delete project history.
>
> Refer to [SECURITY.md](SECURITY.md) for full compliance details.

