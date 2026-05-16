---
description: Run a Lighthouse audit (mobile throttling) on a URL and report Performance / Accessibility / Best Practices / SEO scores. Defaults to http://localhost:4321 if no URL is given. Use after building a vertical slice.
argument-hint: "[url]"
allowed-tools: mcp__plugin_chrome-devtools-mcp_chrome-devtools__navigate_page, mcp__plugin_chrome-devtools-mcp_chrome-devtools__new_page, mcp__plugin_chrome-devtools-mcp_chrome-devtools__lighthouse_audit, mcp__plugin_chrome-devtools-mcp_chrome-devtools__list_console_messages
---

Run Lighthouse on $ARGUMENTS (default: `http://localhost:4321/`).

Steps:

1. Open the URL via Chrome DevTools MCP.
2. Trigger a Lighthouse audit at mobile throttling.
3. Capture Performance / Accessibility / Best Practices / SEO scores.
4. List any console messages.
5. Report:
   - Each score, with a ✅ if ≥95 and a ❌ if <95.
   - The top 3 opportunities flagged by Lighthouse, with their estimated improvement.
   - Any console errors or warnings.

If any score is <95, do **not** propose fixes here — that's a separate task. Just report.
