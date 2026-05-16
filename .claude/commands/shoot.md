---
description: Take mobile and desktop screenshots of a URL and save them with a timestamp. Defaults to http://localhost:4321 if no URL is given. Use for quick visual diff during iteration.
argument-hint: "[url]"
allowed-tools: mcp__plugin_chrome-devtools-mcp_chrome-devtools__navigate_page, mcp__plugin_chrome-devtools-mcp_chrome-devtools__new_page, mcp__plugin_chrome-devtools-mcp_chrome-devtools__resize_page, mcp__plugin_chrome-devtools-mcp_chrome-devtools__emulate, mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_screenshot, Bash
---

Screenshot $ARGUMENTS (default: `http://localhost:4321/`).

Steps:

1. Open the URL via Chrome DevTools MCP.
2. Resize to mobile (375×812, 3× DPR). Take a full-page screenshot.
3. Resize to desktop (1440×900). Take a full-page screenshot.
4. Save both to `docs/screenshots/` with the filename pattern `YYYY-MM-DD_HHMMSS_<mobile|desktop>.png`.
5. Report the two file paths.

Create the `docs/screenshots/` directory if it doesn't exist.
