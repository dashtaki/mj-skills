---
name: journal
description: >
  Work journal dashboard skill. Reads your engineering/work journal from Google Drive,
  a pasted text, or a local file, analyzes the entries, and renders an interactive
  dashboard showing highlights, lowlights, sentiment, appreciation, pain points,
  meeting load, feature delivery, collaboration map, and skills picked up.

  Trigger this skill whenever the user says any of these:
  - /journal
  - "show my journal dashboard"
  - "show my work dashboard"
  - "analyze my journal"
  - "how was my week"
  - "what did I ship this week"
  - "show highlights"
  - "how am I doing at work"
  - any mention of viewing or analyzing their work journal

  Always use this skill proactively when the user seems to want a summary
  or reflection of their work period, even if they don't say "journal" explicitly.
compatibility: "Google Drive MCP recommended. Works without it via paste or file upload."
---

# Journal Dashboard Skill

## What this skill does

1. Reads the user's work journal (from Google Drive, paste, or file)
2. Claude analyzes the raw text and extracts structured data
3. Renders an interactive dashboard with 9 tabs

---

## Step 0 — First time setup

If this is the **first time** the user runs `/journal` in this conversation, Claude must ask:

> "To get started, I need access to your journal. How would you like to provide it?"
>
> **Option A — Google Drive** (recommended): "Paste your Google Doc URL or file ID. Make sure you have the Google Drive connector enabled in Claude settings."
>
> **Option B — Paste**: "Paste your journal text directly into the chat."
>
> **Option C — File**: "Upload a .txt or .md file with your journal entries."

Once the user provides the source, remember it for the rest of the conversation.
If the user has already provided their journal source earlier in the conversation, skip this step.

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

**Metrics** — if not mentioned in journal, set to 0 or omit:
- `prs_opened` / `prs_reviewed`: count explicit PR mentions
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

Call `visualize:read_me` with modules `["interactive", "chart", "data_viz"]` first.

Then call `visualize:show_widget` with the full dashboard HTML.
Embed the analyzed data inline as `const D = {...}` — no runtime API calls.

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
| Journal has no dates | Parse as a single period, label as "This period" |
| Journal too short (< 3 days) | Render what's available, note limited data |
| No PRs / features mentioned | Set counts to 0, skip those metrics gracefully |
| No appreciation entries found | Show empty state: "No explicit appreciation entries logged yet." |
