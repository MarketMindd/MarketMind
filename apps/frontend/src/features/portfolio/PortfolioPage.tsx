import { useCallback, useState } from 'react';
import { AddHoldingForm } from './components/AddHoldingForm';
import { HoldingsTable } from './components/HoldingsTable';
import { PortfolioState } from './components/PortfolioState';
import { STOCK_OPTIONS } from './data/stocks';
import { usePortfolio } from './hooks/usePortfolio';
import { AddHoldingRequest } from './types';

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percent = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const PortfolioPage = () => {
  const { portfolio, isLoading, isSubmitting, error, refresh, addHolding } =
    usePortfolio();
  const [draftPayload, setDraftPayload] = useState<AddHoldingRequest | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [resetCounter, setResetCounter] = useState(0);

  const holdings = portfolio?.holdings ?? [];
  const totalValue = holdings.reduce(
    (sum, holding) => sum + holding.current * holding.shares,
    0,
  );
  const totalGainLoss = holdings.reduce((sum, holding) => sum + holding.gainLoss, 0);
  const totalCost = holdings.reduce(
    (sum, holding) => sum + holding.avgCost * holding.shares,
    0,
  );
  const totalReturnPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  const handleSaveChanges = useCallback(async () => {
    if (!draftPayload || draftError) {
      return;
    }

    await addHolding(draftPayload);
    setResetCounter((value) => value + 1);
  }, [addHolding, draftError, draftPayload]);

  const handleDraftChange = useCallback(
    (payload: AddHoldingRequest | null, nextError: string | null) => {
      setDraftPayload(payload);
      setDraftError(nextError);
    },
    [],
  );

  return (
    <main className="min-h-screen bg-[#020b26] text-slate-100">
      <div className="h-1 w-full bg-slate-800/80" />
      <div className="mx-auto flex w-full max-w-[700px] flex-col gap-5 px-4 py-8 md:px-0">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[42px] font-black leading-none text-slate-100 md:text-[46px]">
              My Portfolio
            </h1>
            <p className="mt-2 text-[28px] font-semibold text-slate-400 md:text-[30px]">
              Manage your current stock holdings
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleSaveChanges()}
            disabled={!draftPayload || Boolean(draftError) || isSubmitting}
            className="rounded-xl bg-cyan-400 px-6 py-3 text-base font-semibold text-[#06202b] shadow-[0_0_20px_rgba(34,211,238,0.45)] transition hover:bg-cyan-300"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </header>

        {holdings.length > 0 ? (
          <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-800 bg-gradient-to-br from-[#121c34] to-[#0b162d] p-4">
              <p className="text-sm text-slate-400">Total Value</p>
              <p className="mt-1 text-3xl font-bold text-slate-100">
                {money.format(totalValue)}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-800 bg-gradient-to-br from-[#121c34] to-[#0b162d] p-4">
              <p className="text-sm text-slate-400">Total Gain/Loss</p>
              <p
                className={`mt-1 text-3xl font-bold ${
                  totalGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {totalGainLoss >= 0 ? '+' : ''}
                {money.format(totalGainLoss)}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-800 bg-gradient-to-br from-[#121c34] to-[#0b162d] p-4">
              <p className="text-sm text-slate-400">Return %</p>
              <p
                className={`mt-1 text-3xl font-bold ${
                  totalReturnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {totalReturnPercent >= 0 ? '+' : ''}
                {percent.format(totalReturnPercent)}%
              </p>
            </article>
          </section>
        ) : null}

        <AddHoldingForm
          stockOptions={STOCK_OPTIONS}
          onDraftChange={handleDraftChange}
          resetCounter={resetCounter}
          isSubmitting={isSubmitting}
        />

        {error ? (
          <PortfolioState
            title="Unable to load portfolio"
            message={error}
            actionLabel="Retry"
            onAction={() => void refresh()}
          />
        ) : null}

        {isLoading ? (
          <PortfolioState
            title="Loading portfolio"
            message="Fetching your holdings from the portfolio service."
          />
        ) : null}

        {!isLoading && !error && holdings.length > 0 ? (
          <HoldingsTable holdings={holdings} />
        ) : null}
      </div>
    </main>
  );
};

export default PortfolioPage;
