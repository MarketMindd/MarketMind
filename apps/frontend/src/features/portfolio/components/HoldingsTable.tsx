import { PortfolioHolding } from '../types';

interface HoldingsTableProps {
  holdings: PortfolioHolding[];
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const sharesFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

export const HoldingsTable = ({ holdings }: HoldingsTableProps) => {
  return (
    <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-[#121c34] to-[#0b162d] p-5">
      <h2 className="text-[30px] font-bold text-slate-100">Holdings Summary</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-lg font-semibold text-slate-500">
                Stock
              </th>
              <th className="px-3 py-3 text-right text-lg font-semibold text-slate-500">
                Shares
              </th>
              <th className="px-3 py-3 text-right text-lg font-semibold text-slate-500">
                Avg Cost
              </th>
              <th className="px-3 py-3 text-right text-lg font-semibold text-slate-500">
                Current
              </th>
              <th className="px-3 py-3 text-right text-lg font-semibold text-slate-500">
                Gain/Loss
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {holdings.map((holding) => (
              <tr key={holding.id}>
                <td className="px-3 py-3">
                  <p className="text-lg font-bold text-cyan-400">{holding.symbol}</p>
                  <p className="text-sm text-slate-500">{holding.companyName}</p>
                </td>
                <td className="px-3 py-3 text-right text-2xl font-semibold text-slate-200">
                  {sharesFormatter.format(holding.shares)}
                </td>
                <td className="px-3 py-3 text-right text-2xl font-semibold text-slate-200">
                  {currencyFormatter.format(holding.avgCost)}
                </td>
                <td className="px-3 py-3 text-right text-2xl font-semibold text-slate-200">
                  {currencyFormatter.format(holding.current)}
                </td>
                <td
                  className={`px-3 py-3 text-right text-2xl font-semibold ${
                    holding.gainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {currencyFormatter.format(holding.gainLoss)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
