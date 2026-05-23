# Feature: Add Short-Term Outlook, Long-Term Outlook, and AI Summary

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files etc.

## Feature Description

Extend the AI recommendation pipeline to generate and surface three new per-stock fields:

- **`aiSummary`** — A short one-liner (≤20 words) shown on each `StockCard` in the dashboard instead of the full `rationale`. Hidden on cards if null.
- **`shortTermOutlook`** — 1-2 sentence near-term analysis (price targets, near-term catalysts). Shown as a new amber card on the `StockDetails` page. Hidden if null.
- **`longTermOutlook`** — 1-2 sentence long-term analysis (growth potential over 1-2 years). Shown as a new green card on the `StockDetails` page. Hidden if null.

All three fields are generated in a **single Gemini call** (the existing prompt is extended). DB columns are **nullable** — existing rows remain valid. UI sections are **hidden** when the field is null.

The `Performance Indicator` section from the mockup is **not** part of this feature.

## User Story

As a MarketMind user
I want to see short-term and long-term AI outlooks on each stock's detail page and a concise AI summary on dashboard cards
So that I can quickly assess near-term vs long-term investment signals without reading the full rationale

## Problem Statement

The current recommendation model (`rationale`) is a single undifferentiated text field. The frontend StockCard shows this long rationale as a preview, which is both too verbose for cards and doesn't distinguish time horizon. StockDetails has no separation of near-term vs long-term signals.

## Solution Statement

Extend `aiResponseSchema`, `RecommendationEntity`, the Gemini prompt, and both frontend components to add three new AI-generated fields. A single extended JSON prompt produces all fields in one Gemini call. A nullable DB migration preserves existing data.

## Feature Metadata

**Feature Type**: Enhancement  
**Estimated Complexity**: Medium  
**Primary Systems Affected**: `libs/common`, `libs/database`, `apps/backend-api/ai`, `apps/backend-api/processing`, `apps/backend-api/stock`, `apps/frontend/stockCard`, `apps/frontend/stockDetails`  
**Dependencies**: No new external dependencies

---

## CONTEXT REFERENCES

### Relevant Codebase Files — YOU MUST READ THESE BEFORE IMPLEMENTING

- `libs/common/src/entities/aiRecommendation.ts` — The `aiResponseSchema` Zod schema and `AiResponse` type. Add 3 new `.optional()` fields here.
- `libs/common/src/entities/stock.ts` (all) — `Stock` interface uses `AiResponse` for `aiRecommendation`. The optional new fields flow through automatically.
- `libs/database/src/entities/recommendation.entity.ts` — Add 3 new `@Column({ type: 'text', nullable: true })` columns.
- `libs/database/src/migrations/1777200000000-add-recommendations.ts` — Migration pattern to mirror for the new nullable columns.
- `libs/database/src/migrations/index.ts` — Export the new migration from here.
- `apps/backend-api/src/ai/prompt-builder.service.ts` — Extend the JSON field spec in the prompt string.
- `apps/backend-api/src/ai/response-parser.service.ts` — No changes needed; it uses `aiResponseSchema.safeParse` which auto-picks up new fields.
- `apps/backend-api/src/processing/processing.service.ts` (lines 19-38) — Add 3 new fields to the `upsert` object.
- `apps/backend-api/src/stock/types.ts` — Update `RawStock` Nullable key union to include the 3 new fields.
- `apps/backend-api/src/stock/stock.service.ts` (lines 16-95) — Add 3 new SELECT columns and map them in `mapRawStock`.
- `apps/backend-api/src/stock/consts.ts` — `DEFAULT_STOCK_RECOMMENDATION` does not need to include the new optional fields (they're optional in `AiResponse`).
- `apps/frontend/src/components/elements/stockCard.tsx` (lines 84-86) — Replace `rationale` preview text with `aiSummary` (hidden when null).
- `apps/frontend/src/components/views/stockDetails/stockDetails.tsx` (lines 120-142) — Add the two new outlook glass-cards after the existing AI Analysis card.
- `market-mind-stocks/src/pages/StockDetails.tsx` (lines 136-158) — Reference implementation of the Short/Long-Term Outlook UI pattern. **Copy the structure, adapt to the main app's patterns.**
- `market-mind-stocks/src/data/mockData.ts` (lines 1-17) — Reference for field naming (`shortTermInsight`, `longTermInsight`, `shortExplanation`). In the main app these are named `shortTermOutlook`, `longTermOutlook`, `aiSummary`.

### New Files to Create

- `libs/database/src/migrations/1777500000000-add-outlook-fields.ts` — Migration adding 3 nullable TEXT columns to `recommendations`.

### Relevant Documentation

- No new external dependencies. The Gemini client, Zod, and TypeORM patterns are already established in the codebase.

---

## Patterns to Follow

### Zod Optional Fields (`libs/common/src/entities/aiRecommendation.ts`)
```typescript
// Existing pattern:
export const aiResponseSchema = z.object({
  status: recommendationStatusSchema,
  confidence: z.number().min(0).max(1),
  rationale: z.string().min(1),
});

// New pattern — add .optional() for resilience (Gemini may occasionally omit them):
export const aiResponseSchema = z.object({
  status: recommendationStatusSchema,
  confidence: z.number().min(0).max(1),
  rationale: z.string().min(1),
  aiSummary: z.string().optional(),
  shortTermOutlook: z.string().optional(),
  longTermOutlook: z.string().optional(),
});
```

### TypeORM Nullable Column (`libs/database/src/entities/recommendation.entity.ts`)
```typescript
// Existing NOT NULL column:
@Column({ type: 'text' })
rationale!: string;

// New nullable columns:
@Column({ type: 'text', nullable: true })
aiSummary!: string | null;

@Column({ type: 'text', nullable: true })
shortTermOutlook!: string | null;

@Column({ type: 'text', nullable: true })
longTermOutlook!: string | null;
```

### Migration Pattern (`libs/database/src/migrations/1777200000000-add-recommendations.ts`)
```typescript
export class AddOutlookFields1777500000000 implements MigrationInterface {
  name = 'AddOutlookFields1777500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "recommendations"
        ADD COLUMN IF NOT EXISTS "aiSummary"        text,
        ADD COLUMN IF NOT EXISTS "shortTermOutlook" text,
        ADD COLUMN IF NOT EXISTS "longTermOutlook"  text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "recommendations" DROP COLUMN IF EXISTS "longTermOutlook"');
    await queryRunner.query('ALTER TABLE "recommendations" DROP COLUMN IF EXISTS "shortTermOutlook"');
    await queryRunner.query('ALTER TABLE "recommendations" DROP COLUMN IF EXISTS "aiSummary"');
  }
}
```

### RawStock Nullable Union (`apps/backend-api/src/stock/types.ts`)
```typescript
// Current:
export type RawStock = Nullable<
  StringMapper<UnMappedRawStock, 'status'>,
  'status' | 'confidence' | 'rationale'
>;

// Updated — add the 3 new fields so DB nulls are typed correctly:
export type RawStock = Nullable<
  StringMapper<UnMappedRawStock, 'status'>,
  'status' | 'confidence' | 'rationale' | 'aiSummary' | 'shortTermOutlook' | 'longTermOutlook'
>;
```

### StockService SELECT + Map Pattern (`apps/backend-api/src/stock/stock.service.ts`)
```typescript
// Existing SELECT fields (add these three alongside the existing ones):
'recommendation.aiSummary AS "aiSummary"',
'recommendation.shortTermOutlook AS "shortTermOutlook"',
'recommendation.longTermOutlook AS "longTermOutlook"',

// In mapRawStock, inside the aiRecommendation object:
aiSummary: rawStock.aiSummary ?? undefined,
shortTermOutlook: rawStock.shortTermOutlook ?? undefined,
longTermOutlook: rawStock.longTermOutlook ?? undefined,
// null → undefined so it matches AiResponse's optional fields
```

### ProcessingService Upsert Pattern (`apps/backend-api/src/processing/processing.service.ts`)
```typescript
// Add to the existing upsert object (lines 21-28):
aiSummary: rec.aiSummary,
shortTermOutlook: rec.shortTermOutlook,
longTermOutlook: rec.longTermOutlook,
```

### Prompt JSON Field Spec (`apps/backend-api/src/ai/prompt-builder.service.ts`)
The prompt currently lists 3 JSON fields. Extend it to 6:
```
Respond with a JSON object only. No markdown, no explanation outside the JSON.
The JSON must have exactly these fields:
- "status": one of "Invest", "Hold", or "Exit"
- "confidence": a number between 0 and 1
- "rationale": a detailed explanation of your recommendation (3-5 sentences)
- "aiSummary": a single concise sentence (max 20 words) summarising the recommendation for a card preview
- "shortTermOutlook": 1-2 sentences on the near-term price outlook and catalysts (next 1-3 months)
- "longTermOutlook": 1-2 sentences on the long-term growth potential (1-2 year horizon)
```

### StockCard AI Summary (hidden when null)
```tsx
// Replace current rationale preview block (lines 84-86 of stockCard.tsx):
{stock.aiRecommendation.aiSummary && (
  <p className="text-sm text-muted-foreground leading-relaxed">
    {stock.aiRecommendation.aiSummary}
  </p>
)}
```

### StockDetails Outlook Cards (reference: market-mind-stocks/src/pages/StockDetails.tsx lines 136-158)
```tsx
{/* Insert AFTER the existing AI Analysis card and BEFORE closing div */}
{(stock.aiRecommendation.shortTermOutlook || stock.aiRecommendation.longTermOutlook) && (
  <div className="grid md:grid-cols-2 gap-6 mb-6 animate-fade-in stagger-4">
    {stock.aiRecommendation.shortTermOutlook && (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-warning" />
          </div>
          <h3 className="font-semibold text-foreground">Short-Term Outlook</h3>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {stock.aiRecommendation.shortTermOutlook}
        </p>
      </div>
    )}
    {stock.aiRecommendation.longTermOutlook && (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-success" />
          </div>
          <h3 className="font-semibold text-foreground">Long-Term Outlook</h3>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {stock.aiRecommendation.longTermOutlook}
        </p>
      </div>
    )}
  </div>
)}
```
Import `Clock` and `Target` from `lucide-react` in `stockDetails.tsx` (they are already imported in the UI repo reference).

---

## IMPLEMENTATION PLAN

### Phase 1: Shared Types & DB Schema

Update the shared contract (`aiResponseSchema`, `RecommendationEntity`) before any consumer code touches the new fields.

**Tasks:**
1. Extend `aiResponseSchema` with 3 optional fields
2. Add 3 nullable columns to `RecommendationEntity`
3. Write and register the DB migration

### Phase 2: Backend Pipeline

Update the AI generation path (prompt + persistence) and the stock read path (SELECT + mapping).

**Tasks:**
4. Extend prompt in `PromptBuilderService`
5. Add new fields to `ProcessingService` upsert
6. Update `RawStock` type
7. Update `StockService` SELECT columns and `mapRawStock`

### Phase 3: Frontend

Update both frontend components to consume the new optional fields.

**Tasks:**
8. Update `StockCard` to show `aiSummary` (hidden when null)
9. Update `StockDetails` to show Short/Long-Term Outlook cards (hidden when null)

### Phase 4: Testing & Validation

Run existing tests, check types, and verify the pipeline end-to-end.

---

## STEP-BY-STEP TASKS

### Task 1: UPDATE `libs/common/src/entities/aiRecommendation.ts`

- **ADD** three optional fields to `aiResponseSchema`:
  ```typescript
  aiSummary: z.string().optional(),
  shortTermOutlook: z.string().optional(),
  longTermOutlook: z.string().optional(),
  ```
- **PATTERN**: mirror the existing `.string().min(1)` fields but use `.optional()` for resilience
- **GOTCHA**: `aiResponseSchema` is inferred into `AiResponse` — adding `.optional()` here makes the fields `string | undefined` in `AiResponse` automatically. No separate type change needed.
- **VALIDATE**: `cd /Users/rwmmtzqy/Documents/colman/MarketMind && npx tsc --noEmit -p libs/common/tsconfig.json`

### Task 2: UPDATE `libs/database/src/entities/recommendation.entity.ts`

- **ADD** after the `rationale` column:
  ```typescript
  @Column({ type: 'text', nullable: true })
  aiSummary!: string | null;

  @Column({ type: 'text', nullable: true })
  shortTermOutlook!: string | null;

  @Column({ type: 'text', nullable: true })
  longTermOutlook!: string | null;
  ```
- **PATTERN**: `libs/database/src/entities/recommendation.entity.ts` existing `@Column` decorators
- **IMPORTS**: no new imports needed (`Column` already imported from `typeorm`)
- **VALIDATE**: `npx tsc --noEmit -p libs/database/tsconfig.json`

### Task 3: CREATE `libs/database/src/migrations/1777500000000-add-outlook-fields.ts`

- **IMPLEMENT**: new migration file with `up` adding 3 nullable TEXT columns and `down` dropping them
- **PATTERN**: `libs/database/src/migrations/1777325229186-add-refresh-tokens.ts` (simple ALTER TABLE pattern)
- **GOTCHA**: Use `ADD COLUMN IF NOT EXISTS` (PostgreSQL ≥9.6) so re-runs are safe
- **Content**:
  ```typescript
  import { MigrationInterface, QueryRunner } from 'typeorm';

  export class AddOutlookFields1777500000000 implements MigrationInterface {
    name = 'AddOutlookFields1777500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "recommendations"
          ADD COLUMN IF NOT EXISTS "aiSummary"        text,
          ADD COLUMN IF NOT EXISTS "shortTermOutlook" text,
          ADD COLUMN IF NOT EXISTS "longTermOutlook"  text
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE "recommendations" DROP COLUMN IF EXISTS "longTermOutlook"');
      await queryRunner.query('ALTER TABLE "recommendations" DROP COLUMN IF EXISTS "shortTermOutlook"');
      await queryRunner.query('ALTER TABLE "recommendations" DROP COLUMN IF EXISTS "aiSummary"');
    }
  }
  ```
- **VALIDATE**: File exists at the correct path

### Task 4: UPDATE `libs/database/src/migrations/index.ts`

- **ADD** export at the bottom:
  ```typescript
  export * from './1777500000000-add-outlook-fields';
  ```
- **PATTERN**: existing export lines in the same file
- **VALIDATE**: `npx tsc --noEmit -p libs/database/tsconfig.json`

### Task 5: UPDATE `apps/backend-api/src/ai/prompt-builder.service.ts`

- **UPDATE** the return string inside `build()`: replace the current 3-field JSON spec with a 6-field spec
- **IMPLEMENT** new fields in the prompt:
  ```
  - "rationale": a detailed explanation of your recommendation (3-5 sentences)
  - "aiSummary": a single concise sentence (max 20 words) summarising the recommendation for a card preview
  - "shortTermOutlook": 1-2 sentences on the near-term price outlook and catalysts (next 1-3 months)
  - "longTermOutlook": 1-2 sentences on the long-term growth potential (1-2 year horizon)
  ```
- **GOTCHA**: The prompt says "Respond with a JSON object only" — keep that constraint so the parser's fence-stripping logic still works
- **VALIDATE**: `npx tsc --noEmit -p apps/backend-api/tsconfig.json`

### Task 6: UPDATE `apps/backend-api/src/processing/processing.service.ts`

- **ADD** three fields to the upsert object inside `process()` (after `rationale: rec.rationale`):
  ```typescript
  aiSummary: rec.aiSummary,
  shortTermOutlook: rec.shortTermOutlook,
  longTermOutlook: rec.longTermOutlook,
  ```
- **PATTERN**: existing `rationale: rec.rationale` line (lines 26-27)
- **GOTCHA**: `rec` is typed as `AiRecommendation` which extends `aiResponseSchema` — the new optional fields will be `string | undefined`. TypeORM upsert accepts `undefined` and writes `NULL` to the DB column, which is the desired behaviour.
- **VALIDATE**: `npx tsc --noEmit -p apps/backend-api/tsconfig.json`

### Task 7: UPDATE `apps/backend-api/src/stock/types.ts`

- **UPDATE** the `Nullable` key union in `RawStock` to include the 3 new fields:
  ```typescript
  export type RawStock = Nullable<
    StringMapper<UnMappedRawStock, 'status'>,
    'status' | 'confidence' | 'rationale' | 'aiSummary' | 'shortTermOutlook' | 'longTermOutlook'
  >;
  ```
- **WHY**: DB returns `null` for the new columns on old rows. Without this, TypeScript treats them as `string`, masking null-safety issues.
- **VALIDATE**: `npx tsc --noEmit -p apps/backend-api/tsconfig.json`

### Task 8: UPDATE `apps/backend-api/src/stock/stock.service.ts`

- **ADD** 3 new SELECT columns to BOTH `getStocksBySymbols` and `getAllStocks` query builders (in the `.select([...])` array, after `'recommendation.rationale as "rationale"'`):
  ```typescript
  'recommendation.aiSummary AS "aiSummary"',
  'recommendation.shortTermOutlook AS "shortTermOutlook"',
  'recommendation.longTermOutlook AS "longTermOutlook"',
  ```
- **UPDATE** `mapRawStock` to include the 3 new fields inside the `aiRecommendation` object (after `rationale`):
  ```typescript
  aiSummary: rawStock.aiSummary ?? undefined,
  shortTermOutlook: rawStock.shortTermOutlook ?? undefined,
  longTermOutlook: rawStock.longTermOutlook ?? undefined,
  ```
- **GOTCHA**: `null ?? undefined` yields `undefined`, which matches the `string | undefined` type of the optional Zod fields. Do NOT use `rawStock.aiSummary ?? ''` — empty string is misleading; undefined correctly triggers the hide-if-null UI logic.
- **PATTERN**: existing `rationale: rawStock.rationale ?? ''` line — note we use `?? undefined` not `?? ''` for the new nullable fields.
- **VALIDATE**: `npx tsc --noEmit -p apps/backend-api/tsconfig.json`

### Task 9: UPDATE `apps/frontend/src/components/elements/stockCard.tsx`

- **REPLACE** lines 84-86 (the `rationale` preview paragraph):
  ```tsx
  // Remove:
  <p className="text-sm text-muted-foreground leading-relaxed">
    {stock.aiRecommendation.rationale}
  </p>

  // Replace with:
  {stock.aiRecommendation.aiSummary && (
    <p className="text-sm text-muted-foreground leading-relaxed">
      {stock.aiRecommendation.aiSummary}
    </p>
  )}
  ```
- **GOTCHA**: The conditional `&&` replaces the always-rendered rationale. For old stocks (no `aiSummary`), the bottom text is hidden. The `View full analysis →` link remains below regardless.
- **NO NEW IMPORTS**: no new imports needed
- **VALIDATE**: `npx tsc --noEmit -p apps/frontend/tsconfig.app.json`

### Task 10: UPDATE `apps/frontend/src/components/views/stockDetails/stockDetails.tsx`

- **ADD** `Clock` and `Target` to the existing `lucide-react` import (line 1):
  ```typescript
  import { ArrowDownRight, ArrowLeft, ArrowUpRight, Brain, Clock, LineChart, Target } from 'lucide-react';
  ```
- **ADD** the Short-Term/Long-Term grid section after the AI Analysis card (after the closing `</div>` of the `stagger-3` card, before the closing `</div>` of the outer `pt-8` container):
  ```tsx
  {(stock.aiRecommendation.shortTermOutlook || stock.aiRecommendation.longTermOutlook) && (
    <div className="grid md:grid-cols-2 gap-6 mb-6 animate-fade-in stagger-4">
      {stock.aiRecommendation.shortTermOutlook && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <h3 className="font-semibold text-foreground">Short-Term Outlook</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {stock.aiRecommendation.shortTermOutlook}
          </p>
        </div>
      )}
      {stock.aiRecommendation.longTermOutlook && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-success" />
            </div>
            <h3 className="font-semibold text-foreground">Long-Term Outlook</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {stock.aiRecommendation.longTermOutlook}
          </p>
        </div>
      )}
    </div>
  )}
  ```
- **PATTERN**: mirror existing `glass-card p-6` structure used for the AI Analysis card above (line 132 of stockDetails.tsx). Use `h3` (not `h2`) to match the reference implementation hierarchy.
- **GOTCHA**: The outer wrapper uses `&&` on the OR of both fields — this means the grid only renders if at least one field exists. Each inner card has its own guard. If only one field is populated, a single card renders in the grid (left-aligned).
- **GOTCHA**: `stagger-4` follows the existing stagger-1 through stagger-3 pattern; no CSS change needed.
- **VALIDATE**: `npx tsc --noEmit -p apps/frontend/tsconfig.app.json`

---

## TESTING STRATEGY

### Unit Tests

The existing test for `ResponseParserService` (`response-parser.service.spec.ts`) should be extended to cover:
- Parsing a valid response that includes all 6 fields (the happy path after the prompt change)
- Parsing a response that omits the 3 new optional fields (backward compat — should still succeed)
- Parsing a response where `aiSummary` is an empty string (valid but edge case)

The existing test for `AiService` (`ai.service.spec.ts`) mocks `PromptBuilderService` and `ResponseParserService` — no changes needed there.

### Integration Tests

No new integration tests needed. The pipeline tests cover the flow end-to-end. After migration, a manual smoke test (see Level 4 below) verifies the DB round-trip.

### Edge Cases

- `aiSummary` is null/undefined → StockCard shows nothing below the price row (no crash)
- `shortTermOutlook` is populated but `longTermOutlook` is null → only the short-term card renders in the grid
- Both outlooks null → the `grid` wrapper div is not rendered at all
- Gemini returns the new fields as empty strings → falsy check (`&&`) in JSX correctly hides them

---

## VALIDATION COMMANDS

### Level 1: Type Check Everything

```bash
# From repo root:
npx tsc --noEmit -p libs/common/tsconfig.json
npx tsc --noEmit -p libs/database/tsconfig.json
npx tsc --noEmit -p apps/backend-api/tsconfig.json
npx tsc --noEmit -p apps/frontend/tsconfig.app.json
```

### Level 2: Unit Tests

```bash
# Run all backend tests (includes response-parser, ai.service, pipeline, processing):
npx nx test backend-api
```

### Level 3: DB Migration (requires DB connection)

```bash
# Show pending migrations (should list AddOutlookFields1777500000000):
npm run db:migration:show -w @market-mind/database

# Run the migration:
npm run db:migrate -w @market-mind/database
```

### Level 4: Manual Validation

1. Start the backend: `npm run start:api`
2. Wait for the market poll cron to fire (every 1 minute)
3. Call `GET /stocks` — verify the response shape includes `aiSummary`, `shortTermOutlook`, `longTermOutlook` (may be null for old rows until the next pipeline run)
4. Once the pipeline runs for a tracked symbol, verify those fields are non-null in `GET /stocks?symbols=AAPL`
5. Start the frontend: `npm run start:frontend`
6. Navigate to the dashboard — verify `aiSummary` appears on StockCards (for newly processed stocks)
7. Click a stock — verify Short-Term and Long-Term Outlook cards appear on the detail page

---

## ACCEPTANCE CRITERIA

- [ ] `aiResponseSchema` includes `aiSummary`, `shortTermOutlook`, `longTermOutlook` as optional string fields
- [ ] `RecommendationEntity` has 3 new nullable `text` columns
- [ ] Migration `1777500000000-add-outlook-fields.ts` is created and exported from the index
- [ ] Gemini prompt requests all 6 JSON fields with clear descriptions
- [ ] `ProcessingService` persists all 3 new fields
- [ ] `StockService` SELECTs and maps all 3 new fields (`null` → `undefined`)
- [ ] `StockCard` renders `aiSummary` conditionally (hidden when null/undefined)
- [ ] `StockCard` no longer always renders `rationale` as the card preview
- [ ] `StockDetails` renders Short-Term Outlook (amber `Clock` icon) conditionally
- [ ] `StockDetails` renders Long-Term Outlook (green `Target` icon) conditionally
- [ ] Both outlook cards use a 2-column grid, each independently guarded
- [ ] All `npx tsc --noEmit` commands pass with zero errors
- [ ] `npx nx test backend-api` passes
- [ ] No regressions in existing stock card or detail page rendering for stocks with null new fields

---

## COMPLETION CHECKLIST

- [ ] All 10 tasks completed in order
- [ ] Type checks pass after each task
- [ ] Unit tests pass
- [ ] Migration runs cleanly against the DB
- [ ] Manual smoke test confirms new fields appear in API response after a pipeline run
- [ ] StockCard hides correctly when `aiSummary` is null
- [ ] StockDetails outlook section hides correctly when both fields are null
- [ ] No existing test regressions

---

## NOTES

**Why optional in Zod, not required?**
Making the new fields `.optional()` in `aiResponseSchema` means the entire recommendation pipeline degrades gracefully if Gemini occasionally omits them (network hiccup, token limit, model quirk). A hard `.min(1)` would cause `ResponseParserService` to throw and discard the entire recommendation. The downside is that we can't statically guarantee Gemini always returns them — but the prompt instructs it to, and the frontend hides nulls rather than crashing.

**Why `?? undefined` not `?? ''` in `mapRawStock`?**
An empty string would pass the `&&` truthy check in JSX and render an empty paragraph. `undefined` correctly signals "not available" and triggers the hide-if-null UI behaviour.

**StockCard rationale replacement**
The current `StockCard` always renders `rationale` as a card-preview blurb. After this change, existing stocks (no `aiSummary`) will show nothing in that slot until their next pipeline run. This is acceptable — the rationale was the wrong text for a card preview (too long), and the card is still fully functional without it.

**Migration timestamp**
`1777500000000` is the next round number after `1777400000000-add-initial-stocks`. The datasource uses a glob pattern `./src/migrations/[0-9]*-*.ts` so the file is auto-discovered. The index export is added for consistency.
