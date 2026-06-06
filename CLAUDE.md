# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:api          # Start NestJS backend (localhost:3000)
npm run start:frontend     # Start Vite frontend (localhost:4200)

# Build
npm run build:api          # Webpack build for backend
npm run build:frontend     # Vite build for frontend

# Testing
npx nx test backend-api                              # Run all backend tests
npx nx test backend-api --testFile=src/path/to/file.spec.ts  # Run a single test file

# Database migrations
npm run db:migrate                  # Apply pending migrations
npm run db:migration:revert         # Revert last migration
npm run db:migration:show           # Show migration status
npm run db:migration:generate       # Auto-generate migration from entity changes
npm run db:migration:create         # Create empty migration file

# Quality (runs across all projects)
npx nx run-many -t lint test build typecheck
```

## Architecture Overview

This is an **Nx monorepo** with two apps and two shared libraries:

```
apps/
  backend-api/    NestJS REST API (port 3000, global prefix /api)
  frontend/       React + Vite SPA (port 4200)
libs/
  common/         Shared TypeScript types, Zod schemas, enums, DTOs
  database/       TypeORM entities, migrations, datasource config
```

**Import aliases** (defined in `tsconfig.base.json`):
- `@market-mind/common` → `libs/common/src/index.ts`
- `@market-mind/database` → `libs/database/src/index.ts`
- `@/*` → `src/*` (frontend only)

---

### Backend (`apps/backend-api`)

NestJS module structure under `src/`:

| Module | Responsibility |
|---|---|
| `auth/` | JWT + Passport authentication, refresh tokens |
| `ai/` | Gemini integration: `GeminiClientService`, `PromptBuilderService`, `ResponseParserService` |
| `chat/` | Persistent AI chat: sessions, messages, Gemini-backed replies |
| `processing/` | Recommendation pipeline (scheduled, triggered on price changes) |
| `market/` | Yahoo Finance data ingestion |
| `news/` | NewsAPI / Alpha Vantage / Massive API aggregation |
| `portfolio/` | User portfolio management + AI market summary |
| `stock/` | Stock master data |
| `profile/` | User profile (risk tolerance, sector interests) |
| `filter/` | Symbol filter state management |
| `pipeline/` | Orchestrates data refresh + AI processing |

All controllers are guarded by NestJS `AuthGuard` (JWT). The authenticated user ID is extracted from the JWT payload via a `@User()` decorator.

**AI pipeline flow:** `PipelineService` → `MarketModule` (fetch prices) → `NewsModule` (fetch news) → `ProcessingService` → `AiService` → `GeminiClientService` → `RecommendationEntity` saved.

**Chat flow:** `ChatController` → `ChatService` → `PromptBuilderService.buildChatPrompt()` (injects user profile, portfolio, last 10 messages, optional stock context) → `GeminiClientService` (JSON schema response: `{ reply, title? }`) → saves `ChatMessageEntity`, optionally updates `ChatSessionEntity.title`.

**Gemini model:** `gemini-2.5-flash-lite`, temperature 0.2, structured JSON output via response schema, retries at [1000ms, 2000ms].

---

### Frontend (`apps/frontend`)

React 19 SPA with React Router v6. Routes are in `app.tsx`.

**Data layer:**
- All API calls go through `dataFetch.ts` (Axios wrapper with JWT + refresh token interceptors) implementing the `iDataProvider` interface.
- React Query hooks are in `useClientQueries.tsx`, consuming `iClientQueriesProvider`. This is the only place where `useQuery`/`useMutation` calls live.

**Key patterns:**
- `useSendChatMessage` uses **optimistic updates**: the user message bubble is added to cache immediately and rolled back on failure, restoring input text.
- Auth state is managed via `useIsAuthenticated` (reads JWT from `localStorage`).
- Toast notifications via `useToast` (wraps Radix UI toast).

**Views** under `src/components/views/`:
- `auth/` — sign-in, sign-up (public routes)
- `onboarding/` — interests selection, risk tolerance (post-signup flow)
- `dashboard/` — main landing after login
- `portfolio/` — user holdings
- `stockDetails/` — per-symbol analysis with "Ask AI" button
- `chat/` — Gemini-style chat with collapsible sidebar, lazy session creation (DB record only written on first message send)

---

### Database (`libs/database`)

PostgreSQL (TimescaleDB compatible). TypeORM with migration-based schema management.

**Key entities:** `UserProfileEntity`, `StockEntity`, `PortfolioEntity`, `MarketDataEntity`, `RecommendationEntity`, `ChatSessionEntity`, `ChatMessageEntity`, `SymbolFilterStateEntity`.

Entities are registered in `createDataSourceOptions` (`libs/database/src/datasource/datasource.options.ts`) — **add new entities here** when creating them.

Migrations live in `libs/database/src/migrations/`. Always generate via `npm run db:migration:generate` after entity changes.

---

### Shared Types (`libs/common`)

- **Enums:** `RiskTolerance`, `SectorInterest`, `RecommendationStatus` (Invest/Hold/Exit)
- **Zod schemas + TS interfaces:** DTOs for all API payloads live here, including `chat.types.ts` (ChatSession, ChatMessage, SendMessagePayload)
- Import from `@market-mind/common` in both frontend and backend

---

## Environment Variables

Required in `.env` at the project root:

```
# Database
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL

# Auth
JWT_SECRET, JWT_REFRESH_SECRET
JWT_EXPIRES_IN=3600s, JWT_REFRESH_EXPIRES_IN=604800s

# External APIs
GEMINI_API_KEY, NEWSAPI_KEY, ALPHA_VANTAGE_API_KEY, MASSIVE_API_KEY

# Frontend (Vite)
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## Code Style

Prettier is enforced with **single quotes**, **100-char line width**, **trailing commas**, and import sorting via `@ianvs/prettier-plugin-sort-imports`. Import order: `reflect-metadata` → third-party → `@market-mind/*` → `@/*` → relative.
