# Contributing to ChainForge Backend

This document covers the development workflow, conventions, and expectations for the backend module (`app/backend`).

---

## Workflow

- Create a branch from `main`:
  - `feature/<short-name>` for new work
  - `fix/<short-name>` for bug fixes
  - `chore/<short-name>` for tooling and documentation

## Commit conventions

Use conventional commits with the `backend` scope:

- `feat(backend): ...` — New features
- `fix(backend): ...` — Bug fixes
- `docs(backend): ...` — Documentation
- `refactor(backend): ...` — Code restructuring
- `chore(backend): ...` — Tooling, dependencies, config

---

## Local checks

Run from the monorepo root:

```bash
pnpm install
pnpm --filter backend lint
pnpm --filter backend test
```

If your change touches the database schema:

```bash
pnpm --filter backend prisma:generate
pnpm --filter backend prisma:migrate
```

---

## Pull request expectations

Include the following in the PR description:

- **What changed** — Brief summary of the change and why it's needed
- **How to run locally** — Setup steps if different from standard workflow
- **Test logs** — Output from:
  - `pnpm --filter backend test`
  - `pnpm --filter backend lint`
- **Health check** — `curl -s http://localhost:3001/health | jq`
- **Closes** — Reference to any related issue (`Closes #<issue_id>`)

## PR checklist

- [ ] No secrets committed (only `.env.example`)
- [ ] `pnpm --filter backend test` passes
- [ ] `pnpm --filter backend lint` passes
- [ ] Database migration included if schema changed
- [ ] `/health` returns `200` locally

---

## See also

- [Module README](./README.md) — Environment configuration and API reference
- [Root README](../../README.md) — Project overview
