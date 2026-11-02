# MJ Skills

A collection of custom skills for Claude Code and other AI coding agents.

## Skills

| Skill | What it does |
|-------|--------------|
| [Journal Dashboard](skills/journal) | Turns your engineering journal into an interactive 9-tab dashboard |
| [Feature Demo Video](skills/feature-demo-video) | Builds a polished product demo video (MP4 with music) of one feature |

Each skill folder has its own README with details, screenshots and usage.

## Install

```bash
npx skills add dashtaki/mj-skills
```

## Add a new skill

1. Create `skills/<skill-name>/SKILL.md` (instructions for the agent).
2. Add `skills/<skill-name>/README.md` (docs for people).
3. Put images in `assets/` at the repo root, so they are not copied into every install.
4. Add one row to the table above.

## License

MIT
