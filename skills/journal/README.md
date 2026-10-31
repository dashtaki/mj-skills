# Journal Dashboard

An interactive work journal dashboard that reads your engineering journal and renders a 9-tab dashboard with weekly highlights, sentiment tracking, appreciation, pain points, meeting load, feature delivery timelines, collaboration maps, and skills picked up.

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

<img src="../../assets/screenshots.png" alt="Journal Dashboard Screenshots" width="600" />

## Usage

Say `/journal`, "show my journal dashboard", "how was my week" or "analyze my journal". The skill reads your journal from Google Drive, a pasted text, or a local file.

## Install

```bash
npx skills add dashtaki/mj-skills
```

Back to [all skills](../../README.md).
