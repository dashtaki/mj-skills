# Feature Demo Video

Makes a 20–40 second launch video of one feature, like the ones Linear or Vercel post. It is not a screen recording. Claude rebuilds your app's UI in React with [Remotion](https://www.remotion.dev) and animates it: camera zoom, cursor clicks, typing, captions, an intro, an end card and calm background music.

<img src="../../assets/feature-demo-video.gif" alt="Feature Demo Video example" width="600" />

*Example output from the starter template (a made-up notes app).*

**What you give it:**

1. The steps to show, in order. Start where a real user starts, for example "Dashboard → Settings → Billing → change plan".
2. The UI, as one of:
   - screenshots of every state,
   - a Figma link, or
   - the app URL. Claude clicks through the app and takes the screenshots itself (needs a browser tool and a logged-in session).
3. Optional: a short screen recording of app animations to match, your logo as SVG, a music mood.

**What you get:** an MP4 (1920×1080, 30 fps) and the Remotion project, so you can change captions, timing or music later.

## Usage

Say `/feature-demo-video`, "make a demo video of our new export feature", or "turn these screenshots into a launch video". If something is missing, the skill shows a short guide. Type `help` anytime to see it again.

**Highlights:**

- Starter project with ready parts: camera, cursor with click ripple, typing, word-blur placeholders, shimmer loaders, captions, intro, end card.
- UI is laid out in the screenshot's own pixels, so it matches your app closely.
- Music and click/typing sounds are synthesized with numpy, so there are no music license issues.
- Checks key frames before the full render, and checks loudness after.

**Requirements:** Node 18+ and Python 3 with numpy. ffmpeg is optional (used for frame and loudness checks). Remotion downloads its own headless browser on the first render.

> **Remotion license:** Remotion is free for individuals, non-profits and companies with up to 3 employees. Larger companies need a [Remotion Company License](https://www.remotion.dev/license).

## Install

```bash
npx skills add dashtaki/mj-skills --skill feature-demo-video
```

Back to [all skills](../../README.md).
