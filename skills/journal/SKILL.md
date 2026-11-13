---
name: journal
description: Builds an interactive 9-tab work dashboard from the user's work journal (Google Drive doc, pasted text, or a .txt/.md file) and their Slack and GitHub activity, alone or combined. Shows weekly highlights and lowlights, sentiment, appreciation, pain points, meeting load, feature delivery, collaboration and skills picked up. Use when the user says /journal, "show my journal dashboard", "analyze my journal", "how was my week", "what did I ship this week", "summarize my Slack and GitHub activity", "show highlights", "how am I doing at work", or otherwise wants a summary or reflection of a work period, even without saying "journal".
compatibility: Google Drive, Slack and GitHub connectors are optional. Each one adds a source. Works without any of them via paste or file upload.
---

# Journal Dashboard Skill

## What this skill does

1. Reads the user's work journal (from Google Drive, paste, or file) and/or their
   Slack and GitHub activity
2. Claude analyzes everything and extracts structured data
3. Renders an interactive dashboard with 9 tabs

---

## Step 0 — First time setup

If this is the **first time** the user runs `/journal` in this conversation, Claude must ask
which sources to use. The user can pick **one or several**; the dashboard combines them.

> "To get started, which sources should I read? You can pick more than one."
>
> **Journal** (pick one):
> - **Google Drive** (recommended): "Paste your Google Doc URL or file ID. Make sure the Google Drive connector is enabled in Claude settings."
> - **Paste**: "Paste your journal text directly into the chat."
> - **File**: "Upload a .txt or .md file with your journal entries."
>
> **Activity** (optional, adds facts the journal may miss):
> - **Slack**: "I'll read your own messages, threads you took part in, and messages that mention you. Needs the Slack connector."
> - **GitHub**: "I'll read pull requests you opened, reviewed or merged, and their review comments. Tell me which org or repos to include, or I'll use everything you can access. Needs the GitHub connector or the `gh` CLI."
>
> **Period**: "Which period? Default: the last 30 days."

Before asking, check which connectors are available and only offer the ones that work.
If the user's request already names the sources (e.g. "how was my week on Slack and GitHub"),
skip the question and use those. If no journal is given, Slack and/or GitHub alone are fine.

Once the user provides the sources, remember them for the rest of the conversation.
If the user has already provided their sources earlier in the conversation, skip this step.

### How to get the Google Doc file ID

The file ID is the long string in the Google Doc URL:
```
https://docs.google.com/document/d/FILE_ID_IS_HERE/edit
```

Example:
```
https://docs.google.com/document/d/1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789ABCDEFG/edit
                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                    This part is the file ID
```

---

## Step 1 — Read the journal

### If Google Drive:
Use the Google Drive `read_file_content` tool with the file ID the user provided.

```
fileId: <provided by user>
```

If the tool is unavailable or fails:
> "It looks like Google Drive isn't connected. You can enable it in Claude Settings > Connectors, or paste your journal text directly here."

### If paste or file:
Use the text the user provided directly. No tool call needed.

### If Slack:
Use the Slack connector's search tool (e.g. `slack_search_public_and_private`, or
`slack_search_public` if that is the only one). Limit every search to the chosen period:

- `from:<@me> after:YYYY-MM-DD` — what the user said and worked on
- `to:<@me> after:YYYY-MM-DD` and messages that @-mention the user — feedback, requests, praise
- For busy threads the user took part in, read the thread for context.

Resolve "me" to the user's Slack ID first if the tool needs it (e.g. look up their profile).
Page through results until the period is covered, but stop at about 500 messages and say so.
Read only. Never post, react or send messages from this skill.

### If GitHub:
Use the GitHub connector (MCP tools) if present, otherwise the `gh` CLI. Limit to the period
and to the org/repos the user named. Collect:

- PRs authored by the user: title, repo, created / merged / closed dates, state.
  With `gh`: `gh search prs --author=@me --created=">=YYYY-MM-DD" --json title,repository,state,createdAt,closedAt,url`
- PRs the user reviewed: `gh search prs --reviewed-by=@me --updated=">=YYYY-MM-DD"`
- Review comments others left on the user's PRs (for appreciation and pain points).
- Issues the user opened or closed, if relevant.

Read only. Never comment, approve or change anything from this skill.

### Combining sources
Turn every Slack message and GitHub event into a dated line, in the same style as a
journal entry, tagged with its source, e.g. `27.03 [GitHub] Merged PR "Add export to PDF" (web-app)`.
Merge these with the journal entries by date, then continue with Step 2.
The journal is the main source for feelings and context; Slack and GitHub add facts.

---

## Step 2 — Detect journal format

The skill supports any free-form journal format. Common patterns:

**Format A — Bold date headings (default):**
```
**27.03**
- Shipped the new dashboard feature
- 1-1 with team lead, good feedback
```

**Format B — Markdown headings:**
```
## March 27
- Shipped the new dashboard feature
```

**Format C — Plain text with date prefix:**
```
2024-03-27: Shipped dashboard, had 1-1 with lead
```

Infer the format automatically. Do not require the user to specify it.

---

## Step 3 — Analyze the content

**CRITICAL: Do NOT call the Anthropic API from inside the widget HTML/JS. It will fail.**
Instead, Claude analyzes the journal text directly in the conversation and produces
a structured JSON object, which gets embedded into the widget as `const D = {...}`.

Analyze the full journal and produce a JSON object with this schema:

```json
{
  "weeks": [
    {
      "label": "W1: 23–27 Mar",
      "week_highlights": ["..."],
      "week_lowlights": ["..."],
      "days": [
        {
          "date": "23.03",
          "sentiment": "great|good|ok|mixed|tired|rough|angry|drained|low",
          "pos": 70,
          "neg": 10
        }
      ],
      "meetings_regular": 5,
      "meetings_friction": 2
    }
  ],
  "month": {
    "prs_opened": 10,
    "prs_reviewed": 8,
    "features_shipped": ["Feature A", "Feature B"],
    "overtime_days": 3,
    "highlights": ["..."],
    "lowlights": ["..."]
  },
  "appreciation": [
    { "from": "Person", "text": "...", "date": "27.03" }
  ],
  "pain_points": [
    { "label": "Theme name", "count": 5 }
  ],
  "overtime_log": [
    { "date": "27.03", "reason": "..." }
  ],
  "features": [
    { "name": "Feature A", "start": 0, "end": 5, "color": "#1D9E75" }
  ],
  "totalDays": 30,
  "people": [
    { "name": "Alex", "initials": "AL", "role": "Tech lead", "score": 10, "tags": ["reviews", "pairing"] }
  ],
  "skills": [
    { "name": "Git worktree", "date": "13.04", "type": "skill", "desc": "First time used for parallel branch work" }
  ]
}
```

### Week grouping rules

- Weeks run **Monday to Friday**.
- Group journal entries by their calendar week (Mon–Fri).
- If a date falls on a weekend, attach it to the nearest weekday week.
- Label weeks as `"W1: 23–27 Mar"`, `"W2: 30 Mar–2 Apr"`, etc.
- The **current week** is the most recent Mon–Fri period that has at least one entry.
- Do not mix dates from different calendar weeks into the same week group.
- If the journal spans less than a week, treat everything as "This week".

### Journal entry conventions

- Bold bullets (e.g. `**did X**`) signal more important items — weight them higher in highlights.
- No explicit categories — infer them from content.

### Analysis rules

**General:**
- `sentiment` and `pos`/`neg`: pos + neg should sum to at most 90 (leave room for neutral).

**Using Slack and GitHub data** (when those sources are used):
- PR metrics: use GitHub counts, not journal mentions. GitHub is exact.
- `features_shipped` and `features`: a merged PR (or group of PRs for one feature) counts as
  shipped. `start` = first PR opened, `end` = last PR merged. Combine with journal mentions of
  the same feature; don't count it twice.
- `appreciation`: also include praise in Slack messages to/about the user and in PR review
  comments (e.g. "great work", "thanks for fixing this", 🙏 / 🎉 replies with words).
  Keep the quote short and use the sender's name.
- `people`: Slack conversations, PR reviews in both directions and co-authored work all
  add to `score`.
- `pain_points`: also count themes in Slack (blocked, broken CI, flaky tests, "still waiting")
  and in PRs (long review waits, many review rounds, reverted PRs).
- `overtime_days`: Slack or GitHub activity clearly outside working hours (after 20:00 or on
  weekends, in the user's time zone) can count, but only with 2+ events that day.
- `sentiment`: base it on the journal when there is one. Slack/GitHub-only days get a neutral-ish
  score unless the messages show a clear mood.
- Ignore bots, automated messages and CI notifications.

**Metrics** — if not mentioned in any source, set to 0 or omit:
- `prs_opened` / `prs_reviewed`: count explicit PR mentions (or GitHub data, see above)
- `overtime_days`: count days with explicit overtime or after-hours mentions
- `features_shipped`: only count features that reached prod/merge

**Appreciation:**
- Only include explicitly positive feedback FROM others TO the user
- Do not include self-assessment or general positive days

**Pain points:**
- Count by how many distinct days mention that theme, not total mentions
- Label them clearly and concisely (e.g. "Slow CI pipeline", "Unclear requirements")

**Features:**
- `start` and `end`: days since journal start (day 0 = first journal entry)
- `totalDays`: total span of the entire journal
- Color by speed: ≤5 days = `#1D9E75` (green), 6–15 days = `#378ADD` (blue), 15+ days = `#BA7517` (amber)

**People:**
- `score`: count of meaningful interactions (mentions, sessions, PR reviews, calls)
- `initials`: first two letters of first name, or first letter of each word for two-word names
- `role`: infer from context if not explicit (e.g. "Tech lead", "PM", "Designer")

**Skills:**
- `type`: one of `"tool"`, `"platform"`, or `"skill"`
  - tool: software, CLI, library (e.g. Git, Figma, Langsmith)
  - platform: internal systems, cloud platforms (e.g. AWS, internal deploy tool)
  - skill: practices, techniques (e.g. spec-driven dev, ticket scoping)
- Only include skills mentioned as new or first-time

**Meetings:**
- `meetings_regular`: estimated count of planned meetings that week
- `meetings_friction`: meetings that ran over, were unplanned, or caused stress

---

## Step 4 — Render the dashboard

Build the dashboard as one self-contained HTML page.
Embed the analyzed data inline as `const D = {...}` — no runtime API calls.

Show it with the best tool available:
- claude.ai with the visualizer: call `visualize:read_me` with modules
  `["interactive", "chart", "data_viz"]`, then `visualize:show_widget` with the HTML.
- Otherwise, if an artifact tool exists, publish the HTML as an artifact.
- Otherwise (e.g. Claude Code with no artifact tool), write it to
  `journal-dashboard.html` and tell the user to open it in a browser.

### Dashboard — 9 tabs

| Tab | Content |
|-----|---------|
| **This week** | Highlight/lowlight cards for the **current week only** |
| **Full month** | Metric cards + highlights/lowlights + shipped feature pills |
| **Sentiment** | Week selector + daily mood bars (green=positive, red=negative) |
| **Appreciation** | Positive feedback cards with person badge, quote, date |
| **Pain points** | Frequency bars + overtime log |
| **Meeting load** | Stacked bar chart: regular vs friction meetings per week |
| **Feature delivery** | Gantt-style bars: one row per feature, width = days, color = speed |
| **Collaboration** | Person cards grid with avatar, role, interaction bar, tags |
| **Skills picked up** | Card grid with type badge, name, date, description |

### "This week" tab — important rule

Show **only the current week** (the most recent Mon–Fri period with entries).
Do NOT also render the previous week in this tab.
Label it clearly, e.g. `"Current — W8: 8–12 May"`.

### Design rules

- Use CSS variables for all colors — light/dark mode safe
- Highlight cards: `#EAF3DE` bg / `#C0DD97` border for highlights
- Lowlight cards: `#FCEBEB` bg / `#F7C1C1` border for lowlights
- Sentiment bars: `#639922` positive, `#E24B4A` negative
- Appreciation badges: `#E6F1FB` bg, `#0C447C` text
- Skills badge colors: tool=blue (`#E6F1FB`/`#0C447C`), platform=teal (`#E1F5EE`/`#085041`), skill=purple (`#EEEDFE`/`#3C3489`)
- Person avatars: unique color pair per person — pick from a diverse palette
- Chart.js for meeting load bar chart — load from cdnjs, custom HTML legend
- All data embedded — no loading states needed

---

## Step 5 — After rendering

Say one short line summarizing the most notable thing from this period.

Examples:
- "This week you shipped Feature A and received positive feedback from your lead."
- "Looks like a tough week — lots of friction meetings and overtime logged."

---

## Error handling

| Situation | Response |
|-----------|----------|
| Google Drive not connected | Ask user to connect it or paste journal text |
| File ID invalid / access denied | Ask user to check sharing settings or paste text |
| Slack not connected | Say so, offer to continue with the other sources, or ask the user to enable the Slack connector |
| GitHub not connected and no `gh` CLI | Say so, offer to continue with the other sources, or ask the user to enable the GitHub connector |
| Slack / GitHub returns nothing for the period | Note it in one line, render with the remaining sources |
| Too many Slack messages | Stop at ~500, mention the dashboard is based on a sample |
| Journal has no dates | Parse as a single period, label as "This period" |
| Journal too short (< 3 days) | Render what's available, note limited data |
| No PRs / features mentioned | Set counts to 0, skip those metrics gracefully |
| No appreciation entries found | Show empty state: "No explicit appreciation entries logged yet." |
