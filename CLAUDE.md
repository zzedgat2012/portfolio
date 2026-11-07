# CLAUDE.md

@AGENTS.md

## Claude Code specifics

- BMAD runs as skills here: `/bmad-build` for a story, `/bmad` for questions about the method. Use one session per story; run `/clear` (or start a new session) before the next one.
- At the start of `/bmad-build`, write the failing Playwright specs for the story's acceptance criteria before touching implementation code.
- Before declaring a story done, run `pnpm turbo lint typecheck test` and `pnpm --filter web test:e2e` and report the result.
- Do not duplicate rules in this file. Change AGENTS.md (outside the `bmad:context` block) or docs/conventions.md instead.
- Use `/memory` to check which instruction files are loaded.

# Individual preferences (not committed)
- @~/.claude/portfolio-instructions.md
