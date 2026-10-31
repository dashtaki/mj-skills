---
name: feature-demo-video
description: Build a polished product feature demo video (MP4 with music) by rebuilding the app UI in React/Remotion from screenshots, a Figma link or the live app URL, then animating camera zooms, cursor clicks, typing, captions and an end card. Use this whenever the user wants a demo, launch, release, changelog or "show the feature" video for a web app, wants to turn screenshots or a screen recording into a nice video, mentions Remotion, or asks for a video "like Linear or Vercel launch videos", even if they do not say "Remotion". Also use it when the user asks how to make such a video or runs it with "help".
---

# Feature demo video

Make a 20–40 second motion video that shows one feature of a web app.
It is not a screen recording. You rebuild the UI as React components in
Remotion and animate it frame by frame. This gives clean data, smooth
camera moves and full control over timing.

The look: app window on a soft background, camera zooms in on each action,
a cursor clicks and types, one short caption per scene, calm music, logo
end card.

A working starter project is in `template/` next to this file. It contains
the shared animation helpers, ready components, an example video and the
music script. Always start from it instead of writing these parts again.

> **License note.** Remotion is free for individuals, non-profits and
> for-profit companies with up to 3 employees. Larger companies need a
> Remotion Company License (https://www.remotion.dev/license). Tell the
> user once, before the first render, if they make the video for a company.

## 0. Help mode

Most users will not know that help exists, so show it without being asked.

Before building, check the request for the two required inputs: **the
steps to show** and **a UI source** (screenshots, Figma link or app URL).

- **Both present** → start working.
- **One or both missing**, or the user says "help" or asks how to use it →
  do not start building and do not ask a bare question. Reply with the
  guide below, in the user's language and in plain short sentences. Put a
  short checklist at the top that shows what you already have (✓) and what
  is still missing (✗), then wait.

End every reply in this skill (first version, revisions) with one short
line: *"Type **help** anytime to see what I need and what I can change."*

Guide:

> **Feature demo video – how to use**
>
> I make a 20–40 second demo video of one feature, with zoom, cursor,
> typing, captions and music. You get an MP4 and the source code.
>
> **Send me:**
> 1. **The feature and the steps**, in order. Start where a real user
>    starts. Example: "Dashboard → Settings → Billing → change plan →
>    confirm".
> 2. **The UI**, one of these:
>    - screenshots of every state (best), or
>    - a Figma link, or
>    - the app URL (I click through it and take screenshots myself; log
>      in first and make sure test data exists).
> 3. **Optional:** a short screen recording of app animations to match,
>    logo files (SVG), the music mood (default: calm).
>
> **Example:** "Make a demo video for our new export feature. Start on the
> Reports page, open a report, click Export, pick PDF, download it.
> Screenshots attached."
>
> **Things you can change later:** order of steps, captions, zoom on a
> part, speed, sample data, music mood and volume, intro and end card text.

## 1. Collect input

The UI must look like the real app. If a required input is missing, show
the guide from section 0. Ask with your question tool only for small open
choices (which steps to include, music mood).

- **The UI**, from one of these sources:
  - **Screenshots of every state**: the start page, each menu or dropdown
    open, modals, empty states, error states, the final result.
  - **A Figma link**: pull the frames with the Figma tools if available.
  - **The app URL**: if a browser tool is available, open the app, follow
    the steps and take a screenshot of each state. The user must be logged
    in and test data must exist. Ask before any action that changes data
    (upload, save, delete). OS dialogs (file pickers) and animations
    cannot be captured: draw dialogs yourself, ask for a recording of
    animations.
- **A screen recording** of any app animation that must match (placeholder
  tips, loaders, transitions). Extract frames and copy the timing:
  `ffmpeg -ss 4.3 -t 2 -i rec.mov -vf "fps=20,crop=900:90:0:20" f_%03d.png`,
  then tile them into one image and look at it.
- **The story**: the feature, the steps, and where the feature lives in
  the app. Start where a real user starts, so viewers learn how to find it.
- **Logos**: use the user's own logo (SVG from their repo, or traced from
  a screenshot). Do not draw other companies' logos (model providers,
  Microsoft, Google, etc.). Ask for the SVG files and use them as images,
  or use neutral icons.

Check each screenshot's pixel size (`PIL.Image.open(p).size`). Crop and
zoom small parts to read details: logo shape, icons, colors.

## 2. Plan the storyboard

Write a short frame plan at 30 fps before coding. Typical shape:

| Part | Frames | Notes |
|---|---|---|
| Intro title | 0–64 | "New in <Product>" + feature name, fades out |
| App enters | 58–90 | window springs in, drums start here |
| Scenes | 3–6 scenes, 60–150 frames each | one action + one caption each |
| Result | 80–200 | show the outcome (created item, file, toast) |
| End card | last ~90 | logo, feature name, "Live now in <Product>" |

Guidelines:

- One idea per scene, one caption per scene (max ~6 words, plain English).
- Show real OS steps when a real user does them (file picker before an
  upload progress dialog).
- Show the result, not just the input (after "send", show the answer and
  any created file).
- If the feature has search, show a hit, and a no-match state if the app
  has one.
- Use realistic sample data from the user's domain. Never "test", "asdf",
  "Hello admin" or other dev-environment data.
- Keep the pace brisk: ~1 second per cursor move, ~0.5 s hold after a
  click, zoom moves of ~25–35 frames.

## 3. Project setup

Copy the template and install:

```bash
cp -r <this-skill-dir>/template ./demo-video && cd demo-video
npm install
npm run audio      # writes public/demo-music.wav and public/demo-sfx.wav
npm run studio     # optional: live preview in the browser
```

What is in it:

| File | Purpose |
|---|---|
| `src/theme.ts` | product name, feature name, tagline, colors |
| `src/timeline.json` | fps, duration, click frames, typing, end card frame (shared with the audio script) |
| `src/lib/anim.ts` | `ramp`, `window01`, `keyframes`, `popIn`, `typed`, `press` |
| `src/lib/components.tsx` | `makeStage`, `AppWindow` (camera), `Cursor`, `Caret`, `BlurWords`, `ShimmerText`, `Captions`, `Intro`, `EndCard`, `Logo`, `Background` |
| `src/DemoVideo.tsx` | example video (made-up notes app): search, modal, typing, toggle, toast |
| `scripts/make_audio.py` | calm music + click and key sounds, synthesized with numpy |

Replace the example page with the user's UI. Keep several videos in one
project by adding one `<Composition>` per video in `src/Root.tsx`.

## 4. How to build the UI

**Author in screenshot pixels.** Lay out every element with absolute
positions in the screenshot's own coordinates ("design px"). Then
`makeStage(DW, DH, K)` scales the page by `K` into the app window. You read
positions straight from the screenshot, and cursor targets and camera
focus points use the same numbers.

```tsx
const stage = makeStage(2000, 1333, 0.72); // screenshot size, scale
const CAMERA = [stage.cam(0, 1, 1000, 666), stage.cam(140, 1.4, 1300, 400)];
```

- Fonts: the template loads Inter. If the app uses another font, install
  it with `@fontsource/<font>`. `useFonts()` waits for fonts before render.
- Icons: `lucide-react` matches many product UIs. Otherwise use the
  app's own SVG icons.
- Colors: copy them from the screenshot (sample pixels with PIL).
- Derive all state from the frame `f` (menu open, tab active, text
  typed). Do not use `useState` for animation.
- For lists that filter or reorder (tabs, search), keep grid states
  `{ f, ids[] }` and slide each card between slots (see `DemoVideo.tsx`).
- **Camera:** keyframes `{f, s, x, y}`; two equal keyframes in a row hold
  the shot. Zoom 1.3–1.7 on the action, back to 1 between scenes and before
  the end card.
- **Cursor:** keyframes in design px; arrive 3 frames before each click
  frame. Pass `scale={1 / K}` so it looks normal size.
- **Typing:** `typed(f, start, speed, text)`; speed 0.3 (slow search) to
  1.3 chars/frame (long prompt). Show `<Caret>`.
- **App micro-animations:** match the real app. `BlurWords` covers
  placeholder tips that blur in and out word by word; `ShimmerText` covers
  loader text with a moving highlight.

## 5. Audio

`scripts/make_audio.py <timeline.json> <prefix>` synthesizes the music, so
there are no license issues. It reads the same timeline, so clicks and
typing sounds stay in sync.

Default mood is **calm, mid energy**: 98 BPM, soft electric piano chords,
a quiet pad, sine bass, light drums from `drumsIn` until `endCard`, then
one chord rings out. Change `BPM`, `CHORDS` and the gains in the script for
another mood. Change one step at a time: very hype music (risers, impacts)
and very sparse music (no drums) both tend to feel wrong under a product
demo.

Loudness: keep music volume ~0.55 and SFX ~0.6 in the composition. Target
about −25 dB mean and peaks below −3 dB:
`ffmpeg -i out/demo.mp4 -af volumedetect -f null /dev/null`.

## 6. Render and check

```bash
npx remotion still src/index.ts DemoVideo out/f300.png --frame=300
npx remotion render src/index.ts DemoVideo out/demo.mp4 --crf=18
```

Remotion downloads its own headless browser the first time. In a sandbox
without internet access, pass a local Chromium with
`--browser-executable=<path to chrome or headless_shell>`.

Before the full render:

1. Render 6–8 stills at key frames (middle of each scene, menu open,
   typing, modal, end card). Tile them into one image with PIL and look.
2. Check: the cursor sits on its target, menus are not cut off at the
   zoom level, captions do not cover the action, text does not wrap, and
   nothing overlaps mid-transition (for example an empty state fading in
   over cards that are still fading out).

After the render, look at 3–4 frames from the MP4 (ffmpeg) and run
volumedetect.

## 7. Deliver

- Give the user the MP4 (send it as a file if you have a file tool) and
  the project folder (or a zip without `node_modules` and `out`).
- Reply in the user's language, in short plain sentences: the scene
  list, what changed since the last version, and any open point (for
  example "send me the SVG icons for the model list").
- Small changes take ~2–3 minutes (edit + render), so offer quick rounds.
- End with the help line from section 0.
