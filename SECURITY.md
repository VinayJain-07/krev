# 🛡️ Security & Coding Agent Governance Policy

This policy governs code integrity, security practices, and agent-assisted development across the **Smark Connect** repository (`Vinay-TheSmarketers/Smark-Connect`).

---

## 1. Absolute Rule: No Direct Remote Changes from Coding Agents

> **MANDATORY ENFORCEMENT: ALL CODING AGENTS (Antigravity, Cursor, Claude Code, GitHub Copilot, Windsurf, Devin, Aider, etc.) ARE STRICTLY FORBIDDEN FROM DIRECTLY COMMITTING OR PUSHING CHANGES TO REMOTE REPOSITORIES.**
>
> Commits, branch merges, and pushes to remote Git branches (especially `main`, `staging`, and `production`) **MUST ONLY BE PERFORMED MANUALLY BY A VERIFIED HUMAN DEVELOPER**.

### Mandatory Rules for AI Coding Agents:
1. **No Autonomous `git push`**: Coding agents must **never** execute `git push`, `git push --force`, or alter remote branches.
2. **No Autonomous `git commit`**: Coding agents must not create git commits without explicit human request, and must never push them automatically.
3. **Manual Human-in-the-Loop**: All edits proposed by an agent must be inspected, reviewed, and approved by the human developer before staging.
4. **No Destructive Operations**: Agents are barred from executing destructive git commands (`git reset --hard`, `git clean -fd`, `git checkout .`, `rm -rf`).
5. **No Secret Mutation or Exposure**: Agents must never read, write, print, or commit API keys, `.env` files, database connection strings, or encryption keys.

---

## 2. Developer Workflow & Change Lifecycle

1. **Assistance Only**: AI agents may suggest code changes, assist in debugging, and propose file edits locally upon request.
2. **Review & Verification**: The human developer inspects the diff using `git diff` or the IDE diff viewer.
3. **Manual Commit & Push**: Only the human developer runs `git commit` and `git push` from their authenticated terminal.

---

## 3. Git Push Guard (Pre-Push Protection)

To physically prevent any script, tool, or agent from accidentally running `git push`, a pre-push protection hook is provided at `.githooks/pre-push`.

To activate the hook locally:
```bash
git config core.hooksPath .githooks
```

When active, any `git push` command requires manual human confirmation (`MANUAL_PUSH_CONFIRMED=1` or interactive terminal confirmation), completely blocking unattended agent push actions.

---

## 4. Protected Assets

The following files and paths are considered sensitive and must never be altered by automated agents without explicit, itemized developer instructions:
- `.env`, `.env.local`, `.env.production`
- `prisma/schema.prisma` and database migrations
- `src/lib/auth*` and authentication helpers
- Encryption keys and KMS/AES-256 logic (`src/lib/crypto.ts`, `git-crypt`)
- CI/CD workflow definitions and deployment scripts
