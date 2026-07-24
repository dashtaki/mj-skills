# How I Built a Personal Work Journal Dashboard with Claude

I've been keeping a work journal for almost 1.5 years now. Nothing fancy: just a Google Doc where I dump daily notes: what I shipped, what frustrated me, who I worked with, how I felt. After a year and a half, I had a wall of text that I never actually read back.

Then I thought: what if Claude could read it *for* me?

---


## The idea: a Claude "skill"

The inspiration came from a weekly ritual at my company: every Friday we have a Company Standup where each person shares the highlights and lowlights of their week. I always found myself scrambling to remember what I'd actually done, mentally skimming five days of work in thirty seconds while someone else was still talking.

I thought: I already have all of this written down. I just need something to read it back to me, and ideally tell me more than I'd remember on my own.

That's when I started building a Claude skill around my journal. I use Claude Code with a custom skills system (essentially markdown files that tell Claude how to handle specific commands). When I type `/journal`, Claude reads a `SKILL.md` file and knows exactly what to do: read my journal from Google Drive, analyze it, and render an interactive dashboard.

The skill file looks like this:

```md
---
name: journal
description: >
  Work journal dashboard skill. Reads your work journal from Google Drive,
  a pasted text, or a local file, analyzes the entries, and renders an
  interactive dashboard.

  Trigger when user says:
  - /journal
  - "show my dashboard"
  - "how was my week"
  - "what did I ship this week"
  - any mention of viewing or analyzing their work journal
---
```

The description isn't just documentation: it's what Claude uses to decide *when* to activate this skill. Any phrasing works. As long as the intent is there, Claude picks it up.

---

## How it works: three steps

### Step 1: Read the journal from Google Drive

Claude has a Google Drive MCP (Model Context Protocol) connection. With one tool call, it fetches the full document:

```
Google Drive: read_file_content
fileId: 1Y8rsID6YF3Zhmnbt8t-...
```

My journal format is simple: bold date headings with bullet points underneath.

```
**14.03**
- Got good feedback from Sarah in standup
- Helped deploy the new search feature to prod
- Started working on the notification redesign
```

No schema, no special syntax. Just notes.

### Step 2: Claude analyzes the text directly

One important architectural note: **the Anthropic API cannot be called from inside a browser widget** due to sandbox restrictions. Claude analyzes the journal in the conversation itself, not at render time.

Instead, Claude itself analyzes the journal text in the conversation and produces a structured JSON object. This gets embedded directly into the widget as a `const D = {...}`. No runtime API calls needed.

The JSON schema covers everything I care about:

```json
{
  "weeks": [
    {
      "label": "W1: 23–27 Mar",
      "week_highlights": ["..."],
      "week_lowlights": ["..."],
      "days": [
        { "date": "23.03", "sentiment": "good", "pos": 65, "neg": 10 }
      ],
      "meetings_regular": 5,
      "meetings_friction": 0
    }
  ],
  "appreciation": [
    { "from": "Sarah", "text": "Really clean PR structure, easy to review...", "date": "14.03" }
  ],
  "pain_points": [
    { "label": "Local dev / deploy process", "count": 12 }
  ],
  "people": [
    { "name": "Sarah", "score": 14, "tags": ["pairing", "reviews"] }
  ],
  "skills": [
    { "name": "Git worktree", "date": "13.04", "type": "skill" }
  ]
}
```

The analysis rules I give Claude matter a lot here. For example:

- `appreciation`: only include *explicitly* positive feedback from others, no self-praise
- `pain_points.count`: count by how many distinct days mention that theme
- `sentiment pos + neg`: should sum to at most 90, leaving room for neutral days

### Step 3: Render an interactive dashboard

Claude uses a visualizer tool to render an HTML widget inline in the chat. The widget has 9 tabs:

| Tab | What it shows |
|-----|---------------|
| This week | Highlights and challenges for current + previous week |
| Full month | PR count, features shipped, overtime days |
| Sentiment | Daily mood bars per week (green = positive, red = negative) |
| Appreciation | Public feedback received from teammates |
| Pain points | Frequency bars for recurring frustrations |
| Meeting load | Stacked bar chart: regular vs friction meetings per week |
| Feature delivery | Gantt-style bars from start to prod, colored by speed |
| Collaboration | Who I worked with most, and how |
| Skills picked up | Tools and techniques learned, with date and context |

All styling uses CSS variables, so it adapts to light and dark mode automatically.

Here's what it looks like:

![Full month tab showing PRs opened, features shipped, and month highlights](screenshot-1-full-month.png)

![Appreciation tab showing positive feedback from teammates](screenshot-2-appreciation.png)

![Pain points tab showing frequency bars and overtime log](screenshot-3-pain-points.png)

![Meeting load tab showing stacked bar chart of regular vs friction meetings](screenshot-4-meetings.png)

---

## What I actually learned from it

A year and a half of data, visualized, told me things I hadn't consciously registered:

**The notification redesign took 18 days**, nearly 3x longer than the search feature (6 days). The journal shows why: repeated interruptions, unclear API ownership, and a PM pushing for delivery before the spec was settled.

**My worst weeks weren't about the work**, they were about communication. Week 4 had the most "friction" meetings and the lowest sentiment scores, all tied to one recurring dynamic with a teammate.

**I picked up 11 new tools and skills in 6 weeks**, seeing it laid out as a card grid made me realize how much ground I'd covered during onboarding, even when it felt chaotic.

**The Appreciation tab is underrated.** On a rough day, scrolling through actual quotes from teammates is genuinely useful.

---

## The skill file: what makes it reusable

The whole thing is driven by a single `SKILL.md` file. When I want to update what the dashboard shows, I just edit the file. No code deployment, no config changes. The skill tells Claude:

- When to trigger (any phrasing, any language)
- Where to read data from (Google Drive file ID)
- What JSON schema to produce
- What tabs to render and how

This is what makes it powerful: the "app" lives in a markdown file, and Claude is the runtime.

---

## Try it yourself

The skill is open source. Install it in one line:

```bash
npx skills add github.com/mjdashtaki/mj-skills
```

Or clone the repo directly: [github.com/mjdashtaki/mj-skills](https://github.com/mjdashtaki/mj-skills)

The skill supports three journal sources out of the box: Google Drive (via the Drive connector), direct paste, or a `.txt`/`.md` file upload. No hardcoded file IDs: Claude asks you on first run.

If you want to build it yourself from scratch, the core idea works with any journal format:

1. Keep a simple daily log (bullet points are enough)
2. Write a `SKILL.md` that tells Claude when to activate and what to analyze
3. Define the JSON schema for the data you care about
4. Let Claude analyze and render. No backend needed.

The hardest part isn't the code. It's deciding what questions you actually want to answer about your own work. Start there, and work backwards.

---

*I write about frontend engineering, AI tooling, and developer experience. If you're building something similar, I'd love to hear about it.*
