# MarketMind Portfolio Feature Plan

## Scope

Build the `My Portfolio` feature end-to-end (client + server) with DB persistence, using a temporary hardcoded user identity and no external market data source.

## Locked Decisions

1. Workspace: `C:\Users\מחשב\MarketMind`
2. Persistence: database-backed
3. User identity: temporary hardcoded user
4. Duplicate stock behavior: merge into existing holding
5. Portfolio table columns:
   - `Stock`
   - `Shares`
   - `Avg Cost`
   - `Current`
   - `Gain/Loss`
6. Add stock form fields:
   - `Shares`
   - `Avg Price ($)`
7. UI target: match provided images exactly in images folder
8. `Current` and `Gain/Loss`: hardcoded for now
9. Avg cost on merge: weighted average
10. Stock search source: static local list for now (future DB)

## Shared API Contract

### 1) Get Portfolio

- `GET /api/portfolios/me`
- Response shape:

```json
{
  "id": "portfolio-id",
  "userId": "hardcoded-user-id",
  "holdings": [
    {
      "id": "holding-id",
      "symbol": "AAPL",
      "companyName": "Apple Inc.",
      "shares": 12,
      "avgCost": 187.45,
      "current": 193.2,
      "gainLoss": 69.0,
      "updatedAt": "2026-02-24T10:00:00.000Z"
    }
  ]
}
```

### 2) Add Holding

- `POST /api/portfolios/me/holdings`
- Request body:

```json
{
  "symbol": "AAPL",
  "companyName": "Apple Inc.",
  "shares": 5,
  "avgPrice": 190
}
```

- Behavior:
  - If symbol does not exist in portfolio: create new holding
  - If symbol exists: merge and recalculate avg cost

### 3) Update Holding

- `PATCH /api/portfolios/me/holdings/:holdingId`
- Update editable fields (`shares`, `avgPrice`, optional `companyName`)

### 4) Delete Holding

- `DELETE /api/portfolios/me/holdings/:holdingId`
- Removes a holding from current user's portfolio

## Data Model

### `portfolios`

- `id` (uuid pk)
- `userId` (string)
- `createdAt`
- `updatedAt`

### `portfolio_holdings`

- `id` (uuid pk)
- `portfolioId` (fk -> portfolios.id)
- `symbol` (string)
- `companyName` (string)
- `shares` (numeric)
- `avgCost` (numeric)
- `createdAt`
- `updatedAt`

Constraints:
- Unique index: (`portfolioId`, `symbol`)

Derived response fields:
- `current` from hardcoded price map
- `gainLoss = (current - avgCost) * shares`

## Merge Formula

When adding an existing symbol:

`newAvg = ((oldShares * oldAvg) + (newShares * newAvgPrice)) / (oldShares + newShares)`

`newShares = oldShares + newShares`

## Parallel Agent Plan

### Agent A: Server Track

Ownership:
- `apps/backend-api/**`
- `packages/database/**`

Tasks:
1. Add entities for portfolio and holdings
2. Add migration(s) with unique `(portfolioId, symbol)`
3. Implement Nest module/controller/service for `/api/portfolios/me/*`
4. Add hardcoded user resolver/stub
5. Implement merge-on-duplicate logic
6. Add hardcoded current price source for response calculation
7. Add DTO validation
8. Add endpoint tests (create, merge, patch, delete, validation)

### Agent B: Client Track

Ownership:
- `apps/frontend/**`

Tasks:
1. Replace scaffold routing and make Portfolio the main route
2. Rebuild Portfolio screen to match images exactly
3. Implement table with required five columns
4. Implement add-stock flow with static local stock search list
5. Submit form with `Shares` + `Avg Price ($)`
6. Wire to backend endpoints
7. Add loading, empty, and error states
8. Refactor into clean React structure (components/hooks/types)

## Acceptance Criteria

1. Portfolio UI visually matches provided image files
2. User can search static stock list and add a stock
3. Adding same symbol merges holding and recalculates weighted avg cost
4. Table always renders required columns
5. Data persists in DB
6. Server uses temporary hardcoded user
7. `Current`/`Gain/Loss` returned using hardcoded values (no external API)
8. Endpoints are validated and covered by tests
9. Frontend handles loading/empty/error states cleanly

## Out of Scope (Current Iteration)

1. Real authentication/authorization
2. External market data providers
3. AI recommendation notifications (`buy/hold/sell`) implementation
4. DB-backed stock search catalog
