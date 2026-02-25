import { useEffect, useMemo, useState } from 'react';
import { AddHoldingRequest, StockOption } from '../types';

interface AddHoldingFormProps {
  stockOptions: StockOption[];
  onDraftChange: (payload: AddHoldingRequest | null, error: string | null) => void;
  resetCounter: number;
  isSubmitting: boolean;
}

const parseStockInput = (
  stockInput: string,
  stockOptions: StockOption[],
): StockOption | undefined => {
  const normalizedInput = stockInput.trim().toLowerCase();

  return stockOptions.find((stock) => {
    const label = `${stock.symbol} - ${stock.companyName}`.toLowerCase();
    return (
      stock.symbol.toLowerCase() === normalizedInput || label === normalizedInput
    );
  });
};

export const AddHoldingForm = ({
  stockOptions,
  onDraftChange,
  resetCounter,
  isSubmitting,
}: AddHoldingFormProps) => {
  const [stockInput, setStockInput] = useState('');
  const [shares, setShares] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockOption | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredStocks = useMemo(() => {
    const query = stockInput.trim().toLowerCase();

    if (!query) {
      return stockOptions;
    }

    return stockOptions.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query) ||
        stock.companyName.toLowerCase().includes(query),
    );
  }, [stockInput, stockOptions]);

  useEffect(() => {
    const normalizedSelection = selectedStock ?? parseStockInput(stockInput, stockOptions);
    const numericShares = Number(shares);
    const numericAvgPrice = Number(avgPrice);
    const hasAnyInput = Boolean(stockInput.trim() || shares.trim() || avgPrice.trim());

    if (!hasAnyInput) {
      setFormError(null);
      onDraftChange(null, null);
      return;
    }

    if (!normalizedSelection) {
      const message = 'Select a stock from the search list.';
      setFormError(message);
      onDraftChange(null, message);
      return;
    }

    if (!Number.isFinite(numericShares) || numericShares <= 0) {
      const message = 'Shares must be a positive number.';
      setFormError(message);
      onDraftChange(null, message);
      return;
    }

    if (!Number.isFinite(numericAvgPrice) || numericAvgPrice <= 0) {
      const message = 'Avg Price ($) must be a positive number.';
      setFormError(message);
      onDraftChange(null, message);
      return;
    }

    setFormError(null);
    onDraftChange(
      {
        symbol: normalizedSelection.symbol,
        companyName: normalizedSelection.companyName,
        shares: numericShares,
        avgPrice: numericAvgPrice,
      },
      null,
    );
  }, [avgPrice, onDraftChange, selectedStock, shares, stockInput, stockOptions]);

  useEffect(() => {
    setStockInput('');
    setShares('');
    setAvgPrice('');
    setSelectedStock(null);
    setFormError(null);
    onDraftChange(null, null);
  }, [onDraftChange, resetCounter]);

  return (
    <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-[#121c34] to-[#0b162d] p-5">
      <h2 className="text-[30px] font-bold text-slate-100">Your Holdings</h2>
      <div className="mt-4 space-y-3">
        <div>
          <input
            id="stock-search"
            className="w-full rounded-xl border border-slate-700 bg-[#050e22] px-4 py-3 text-lg text-slate-200 outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            placeholder="Search stocks to add..."
            value={stockInput}
            onChange={(event) => {
              setStockInput(event.target.value);
              if (selectedStock) {
                setSelectedStock(null);
              }
            }}
            disabled={isSubmitting}
            autoComplete="off"
          />
        </div>

        {!selectedStock && stockInput.trim().length > 0 && filteredStocks.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-800">
            {filteredStocks.slice(0, 5).map((stock) => (
              <button
                key={stock.symbol}
                type="button"
                onClick={() => {
                  setSelectedStock(stock);
                  setStockInput(stock.symbol.toLowerCase());
                }}
                className="flex w-full items-center justify-between border-b border-slate-800 bg-[#101a31] px-4 py-3 text-left last:border-b-0 hover:bg-[#15213e]"
              >
                <span className="text-lg font-bold text-cyan-400">{stock.symbol}</span>
                <span className="text-base text-slate-400">{stock.companyName}</span>
              </button>
            ))}
          </div>
        ) : null}

        {selectedStock ? (
          <div className="rounded-xl border border-slate-800 bg-[#101a31] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-cyan-400">{selectedStock.symbol}</span>
                <span className="ml-2 text-base text-slate-400">{selectedStock.companyName}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedStock(null);
                  setStockInput('');
                  setShares('');
                  setAvgPrice('');
                }}
                className="text-xl text-slate-500 hover:text-slate-300"
              >
                x
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-500"
                  htmlFor="shares-input"
                >
                  Shares
                </label>
                <input
                  id="shares-input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  className="w-full rounded-lg border border-slate-700 bg-[#050e22] px-4 py-2 text-lg text-slate-200 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="0"
                  value={shares}
                  onChange={(event) => setShares(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-500"
                  htmlFor="avg-price-input"
                >
                  Avg Price ($)
                </label>
                <input
                  id="avg-price-input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  className="w-full rounded-lg border border-slate-700 bg-[#050e22] px-4 py-2 text-lg text-slate-200 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="0.00"
                  value={avgPrice}
                  onChange={(event) => setAvgPrice(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-700 bg-[#101a31]/40 p-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 text-2xl text-slate-500">
              &#9638;
            </div>
            <p className="mt-3 text-base text-slate-500">
              No stocks added yet. Search above to add your holdings.
            </p>
          </div>
        )}

        {formError ? (
          <p className="text-sm text-rose-400" role="alert">
            {formError}
          </p>
        ) : null}
      </div>
    </section>
  );
};
