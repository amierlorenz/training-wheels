# training-wheels

A Claude Code plugin that coaches someone who has never coded through building their own first app, over many sessions. Claude asks where they want to use the app (a phone, a browser, a game on their computer) and what computer they have, then picks free tools that fit.

The learner starts by seeing what's possible: they make only product decisions while Claude writes the code. Each level then removes one layer of abstraction, until they're writing features with real software engineering habits:

| Level | The learner | Habits picked up |
|---|---|---|
| 1 The Boss | Decides what the app does and how it looks. Touches no code. | Small steps, run it after each one |
| 2 The Designer | Changes words, colors and spacing in the code. | Save points (commits) |
| 3 The Rule Maker | Writes the app's rules in English, then edits the code version. | Reading errors, debugging |
| 4 The Builder | Fills in the blanks, with a hint ladder. | Naming, small functions, reading docs |
| 5 The Developer | Plans and writes features; Claude reviews. | Planning, testing, refactoring |

- Claude never suggests leveling up. The learner asks when they want to know if they're ready.
- "You do it" is always offered, and it's always the learner's choice.
- At Level 1, Claude invites curiosity about the code but shows it only when asked.
- Every win lands on a phone-friendly **trophy page** to show friends.

## The band

In a folder linked to a training-wheels workspace, a band above the prompt shows the app, the learner's level, their wins and the next goal. Until `/training-wheels` runs in the session it offers **Start today's session**. After that it has buttons for what a beginner would otherwise type: **I'll try it**, **You do this one**, **Trophies**, **Am I ready?** and **Done for today**. It appears once the first session has linked the project folder, and in every session started there after that. The skill works the same without it.

## Progress

Progress lives in `~/Learning/<app>/`, the shared workspace defined by [learning-core](https://github.com/amierlorenz/learning-core): `MISSION.md`, `learning-records/` and `~/Learning/LEARNER.md`, plus this plugin's `PROGRESS.md` (level, wins, glossary, parking lot) and `trophies.html`. So `/learn` sessions build on what `/training-wheels` taught, and the other way round. The project gets a `.learning` link, kept out of git.

## Requirements

A computer (Mac, Windows or Chromebook) and Claude Code. Claude helps install whatever free tools the chosen platform needs. A native iPhone app needs a Mac.

## Install

```
/plugin marketplace add amierlorenz/skills
/plugin install training-wheels@amierlorenz
```

This also installs [learning-core](https://github.com/amierlorenz/learning-core), which it depends on. Then run `/training-wheels <your app idea>` from an empty folder for the app. Claude won't start it on its own.

**Updates:** marketplaces other than Anthropic's don't auto-update by default. To get fixes as they're released, open `/plugin` → Marketplaces → `amierlorenz` → **Enable auto-update**.

**Fewer prompts:** to let it write progress without asking each time, add `~/Learning` to `permissions.additionalDirectories` in `~/.claude/settings.json`.

## Uninstall

`/plugin uninstall training-wheels@amierlorenz`. The plugin keeps no cache or config. Progress stays in `~/Learning/<app>/` until you delete it.
