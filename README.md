# MJ Skills

A collection of custom skills for Claude Code and other AI coding agents.

## Skills

| Skill | What it does |
|-------|--------------|
| [Journal Dashboard](skills/journal) | Turns your engineering journal into an interactive 9-tab dashboard |
| [Feature Demo Video](skills/feature-demo-video) | Builds a polished product demo video (MP4 with music) of one feature |

Each skill folder has its own README with details, screenshots and usage.

## Install

Install with the [skills CLI](https://github.com/vercel-labs/skills). It works with Claude Code and other agents.

**Journal Dashboard**

```bash
npx skills add dashtaki/mj-skills --skill journal
```

**Feature Demo Video**

```bash
npx skills add dashtaki/mj-skills --skill feature-demo-video
```

**All skills**

```bash
npx skills add dashtaki/mj-skills
```

Options:

- `-a claude-code` installs for Claude Code only, without asking which agent.
- `-g` installs for your user (`~/.claude/skills`) instead of the current project.
- `-y` skips the confirmation prompts.

**Claude app (claude.ai / desktop)**: zip the skill folder so `SKILL.md` sits inside a folder named after the skill, then upload the zip in the Skills section of Settings.

```bash
cd skills && zip -r journal.zip journal
```

```bash
cd skills && zip -r feature-demo-video.zip feature-demo-video
```

## Add a new skill

1. Create `skills/<skill-name>/SKILL.md` (instructions for the agent). It must start with YAML frontmatter containing `name` (same as the folder, lowercase and hyphens) and `description` (what it does and when to use it, max 1024 characters). Without it, installers skip the skill. Check with `npx skills add . --list`.
2. Add `skills/<skill-name>/README.md` (docs for people).
3. Put images in `assets/` at the repo root, so they are not copied into every install.
4. Add one row to the table above, and its own install command under Install.

## License

MIT
