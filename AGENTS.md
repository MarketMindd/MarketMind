# MarketMind Agent Guide

## Project Summary
MarketMind is an Nx monorepo for an AI-assisted stock analysis platform.

## Tech Stack
- Backend: NestJS (Node.js, TypeScript, Webpack)
- Frontend: React + Vite + Tailwind
- Data: TypeORM + PostgreSQL (`packages/database`)
- Workspace: Nx + npm workspaces
- Testing standard: Jest + `agent-browser`

## Repository Layout
```text
apps/
  backend-api/      # NestJS API
  frontend/         # React web app
packages/
  database/         # Shared DB package (entities, datasource, migrations)
```

## Setup
```bash
npm install
```

## Core Commands
```bash
# Frontend
npm run start:frontend
npm run build:frontend

# Backend API
npm run start:api
npm run build:api

# Database migrations
npm run db:migrate
npm run db:migration:revert
npm run db:migration:show
npm run db:migration:generate
```

## Testing Policy (Required)
- Use **Jest** for automated tests (unit and integration).
- Use **`agent-browser`** for browser and end-to-end workflow testing.
- Do not introduce new Vitest-based test suites.

## Testing Workflow
1. Add or update Jest tests near the related code (`*.spec.ts` / `*.spec.tsx`).
2. Run project tests through Nx once dependencies are installed:
```bash
npx.cmd nx test <project-name>
```
3. Validate key browser flows with `agent-browser`:
```bash
agent-browser open http://localhost:4200
agent-browser wait --load networkidle
agent-browser snapshot -i
```
4. Re-snapshot after every page-changing action and capture screenshots for failures:
```bash
agent-browser screenshot --full
```

## `agent-browser` Usage Notes
- Preferred flow: `open` -> `snapshot -i` -> interact via `@e*` refs -> re-snapshot.
- Use `agent-browser wait --load networkidle` after navigation.
- Close sessions after tests:
```bash
agent-browser close
```

## Coding Conventions
- TypeScript-first, strict typing preferred.
- Keep backend modules feature-scoped and small.
- Keep DB schema changes in explicit TypeORM migrations.
- Avoid cross-app imports that bypass package boundaries.

## References
- Product context: [README.md](README.md)
- Frontend app: `apps/frontend`
- Backend app: `apps/backend-api`
- Database package: `packages/database`
