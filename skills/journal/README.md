# Journal Dashboard

An interactive work dashboard that reads your engineering journal, your Slack and your GitHub activity and renders a 9-tab dashboard with weekly highlights, sentiment tracking, appreciation, pain points, meeting load, feature delivery timelines, collaboration maps, and skills picked up.

**Sources** (pick one or combine several):

| Source | What it adds | Needs |
|--------|--------------|-------|
| Journal | Your notes, feelings and context. Google Doc, pasted text or a .txt/.md file | Google Drive connector (only for Google Docs) |
| Slack | Your messages, threads, mentions and praise from teammates | Slack connector |
| GitHub | PRs you opened, reviewed and merged, plus review comments | GitHub connector or `gh` CLI |

Default period is the last 30 days. Everything is read-only: the skill never posts, comments or changes anything.

**Tabs:**

| Tab | What it shows |
|-----|---------------|
| This week | Highlights and challenges for current + previous week |
| Full month | Metric cards, shipped features, monthly summary |
| Sentiment | Daily mood bars with positive/negative breakdown |
| Appreciation | Positive feedback from teammates with quotes and dates |
| Pain points | Recurring friction themes ranked by frequency |
| Meeting load | Regular vs friction meetings per week |
| Feature delivery | Gantt-style timeline colored by delivery speed |
| Collaboration | Teammate cards with interaction scores and tags |
| Skills picked up | New tools, platforms, and techniques learned |

## Screenshots

### Month Highlights

<img src="../../assets/month.png" alt="Journal Dashboard: Month Highlights" width="600" />

### Sentiments

<img src="../../assets/sentiment.png" alt="Journal Dashboard: Sentiments" width="600" />

### Appreciations

<img src="../../assets/appreciation.png" alt="Journal Dashboard: Appreciations" width="600" />

### Features

<img src="../../assets/features.png" alt="Journal Dashboard: Features" width="600" />

### Pain Points

<img src="../../assets/pain-points.png" alt="Journal Dashboard: Pain Points" width="600" />

## Usage

Say `/journal`, "show my journal dashboard", "how was my week" or "analyze my journal". The skill reads your journal from Google Drive, a pasted text, or a local file.

## Install

```bash
npx skills add dashtaki/mj-skills --skill journal
```

Back to [all skills](../../README.md).
