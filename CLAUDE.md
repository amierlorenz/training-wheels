# training-wheels

A Claude Code plugin that coaches a beginner through their first app. Depends on learning-core for `~/Learning/`.

## Git workflow (pr mode)
<!-- git-workflow:pr — checked by the git-workflow plugin's guard hook; keep this marker -->
- Never commit to main, never merge a PR, never force-push. If a branch falls behind main, merge main into it.
- One branch per issue or feature: `feat/<issue#>-<slug>`, `fix/<issue#>-<slug>`.
- Conventional Commits 1.0.0, subject line only unless the why isn't obvious from the diff.
  Breaking changes: `!` after the type and a `BREAKING CHANGE:` footer.
- Run `git add` and `git commit -m "<subject>"` as separate commands, never chained.
- PR title is a conventional commit (it becomes the squash commit on main).
  Body: what, why, how tested, open questions, `Closes #N`.
- Review comments: fix what's clear, ask on the PR when ambiguous, reply to every thread.

## Writing the skill
Same rules as [amierlorenz/skills](https://github.com/amierlorenz/skills/blob/main/CLAUDE.md#writing-skills):
keep a line only if the agent would act differently without it; `SKILL.md` under 500 lines; material only some
runs need goes in `references/`, behind a pointer that says when to read it. No personal paths or names in examples.
- Shared `~/Learning/` rules (layout, records, profile, tags) live in learning-core. Change them there, never here;
  this skill only adds `PROGRESS.md` and `trophies.html`.
- No platform-specific setup steps: the skill has Claude look them up in official docs, so they don't go stale.
- No `version` on purpose, so installs follow main. When a change needs a newer learning-core, raise the
  `dependencies` range in `.claude-plugin/plugin.json` in the same PR.

## Manifests
After touching `.claude-plugin/plugin.json`: run `claude plugin validate .`.
