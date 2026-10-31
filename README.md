# MJ Skills

A collection of custom skills for Claude Code and other AI coding agents.

| Skill | What it does |
|-------|--------------|
| [Journal Dashboard](#journal-dashboard) | Turns your engineering journal into an interactive 9-tab dashboard |
| [Feature Demo Video](#feature-demo-video) | Builds a polished product demo video (MP4 with music) of one feature |

## Install

```bash
npx skills add dashtaki/mj-skills
```

## Skills

### Journal Dashboard

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

<img src="assets/screenshots.png" alt="Journal Dashboard Screenshots" width="600" />

**Usage:** say `/journal`, "show my journal dashboard", "how was my week" or "analyze my journal". The skill reads your journal from Google Drive, a pasted text, or a local file.

### Feature Demo Video

Makes a 20–40 second launch video of one feature, like the ones Linear or Vercel post. It is not a screen recording. Claude rebuilds your app's UI in React with [Remotion](https://www.remotion.dev) and animates it: camera zoom, cursor clicks, typing, captions, an intro, an end card and calm background music.

<img src="assets/feature-demo-video.gif" alt="Feature Demo Video example" width="600" />

*Example output from the starter template (a made-up notes app).*

**What you give it:**

1. The steps to show, in order. Start where a real user starts, for example "Dashboard → Settings → Billing → change plan".
2. The UI, as one of:
   - screenshots of every state,
   - a Figma link, or
   - the app URL. Claude clicks through the app and takes the screenshots itself (needs a browser tool and a logged-in session).
3. Optional: a short screen recording of app animations to match, your logo as SVG, a music mood.

**What you get:** an MP4 (1920×1080, 30 fps) and the Remotion project, so you can change captions, timing or music later.

**Usage:** say `/feature-demo-video`, "make a demo video of our new export feature", or "turn these screenshots into a launch video". If something is missing, the skill shows a short guide. Type `help` anytime to see it again.

**Highlights:**

- Starter project with ready parts: camera, cursor with click ripple, typing, word-blur placeholders, shimmer loaders, captions, intro, end card.
- UI is laid out in the screenshot's own pixels, so it matches your app closely.
- Music and click/typing sounds are synthesized with numpy, so there are no music license issues.
- Checks key frames before the full render, and checks loudness after.

**Requirements:** Node 18+ and Python 3 with numpy. ffmpeg is optional (used for frame and loudness checks). Remotion downloads its own headless browser on the first render.

> **Remotion license:** Remotion is free for individuals, non-profits and companies with up to 3 employees. Larger companies need a [Remotion Company License](https://www.remotion.dev/license).

## License

MIT
