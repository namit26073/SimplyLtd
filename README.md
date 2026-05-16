# Simply Ltd — fresh build

A parallel website rebuild for Simply Ltd (UK food-truck group, 5 sub-brands, Paddington Basin London). This workspace is intentionally separate from the existing build at `../SimplyLtdWebsite/` so a fresh Claude Code session can approach the design from scratch without inheriting decisions that have been rejected.

## For the human reader

1. Open this folder in a fresh VS Code window.
2. Start a new Claude Code chat in that window.
3. Paste the contents of [BRIEFING.md](BRIEFING.md) as your first message to the agent.
4. The agent has full creative freedom on stack, design direction, and tooling — but is briefed on the constraints, the assets available, what was rejected previously and why, and how to use subagents.

## What's already in this workspace

- `BRIEFING.md` — **the prompt to paste into a new Claude Code chat.** Comprehensive context-load.
- `CLAUDE.md` — domain context the agent will read automatically each session.
- `AGENT-WORKFLOW.md` — multi-agent / multi-chat strategy for getting this built efficiently.
- `assets-inbox/` — the owner's real videos (Falafel + Shawarma kitchen footage) and logo files.
- `references/` — aesthetic input, previous-build rules (for reference, not for re-use), reference brand notes.
- `docs/` — `plans/` and `decisions/` for the agent to populate.
- `.claude/agents/` — three pre-wired subagents (design-reviewer, accessibility-auditor, content-researcher).
- `.claude/commands/` — `/perf` and `/shoot` slash commands.

## What's NOT in this workspace yet

- Source code, framework, build config — agent's call.
- Real food photography — owner needs to provide; placeholders from Unsplash are explicitly allowed.
- Production domain wiring, Cloudflare account credentials — held by the owner/Namit.

## Parallel project

The existing `../SimplyLtdWebsite/` project keeps running. We'll show the owner both builds and let him pick. This isn't a replacement, it's an alternative.

## Working principles (agent should read these)

See [BRIEFING.md](BRIEFING.md) for the full brief. The short version:

1. **No procedural-3D heroes.** Three iterations of stylised hero-as-novelty have been rejected by the client. Apple/Adidas reference quality requires real photography or commissioned art, not generated geometry.
2. **Plan before building.** New direction = new plan doc in `docs/plans/YYYY-MM-DD-<topic>.md`. User approves. Then execute.
3. **Use subagents.** Design review + a11y audit + research are pre-wired. Run them automatically; don't ship a slice without them.
4. **Commit often, atomically.** Each meaningful change is a commit. Conventional commit messages.
5. **Quality bar is "ready to email the client."** Not "first pass, will iterate." If it's not client-ready, say so explicitly.
