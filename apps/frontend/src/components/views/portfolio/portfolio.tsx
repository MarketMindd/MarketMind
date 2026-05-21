import { Briefcase, DollarSign, Save, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PortfolioItemWithStock } from '@market-mind/common';
import { Button } from '@/components/elements/button';
import { useClientQueries } from '@/hooks/useClientQueries';
import { cn } from '@/utils/tailwindUtils';
import PortfolioInput from './portfolioInput';
import { PortfolioStockRow } from './portfolioStockRow';

const EMPTY_PORTFOLIO: PortfolioItemWithStock[] = [];

export const Portfolio = () => {
  const {
    portfolio: { usePortfolio, useSavePortfolio },
  } = useClientQueries();
  const { data: portfolio = EMPTY_PORTFOLIO, refetch } = usePortfolio();
  const { mutate: savePortfolio, isPending } = useSavePortfolio({
    onSuccess: () => {
      setHasChanges(false);
      refetch();
    },
  });

  const [localPortfolio, setLocalPortfolio] = useState<PortfolioItemWithStock[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalPortfolio(portfolio);
  }, [portfolio]);

  useEffect(() => {
    const changed = JSON.stringify(localPortfolio) !== JSON.stringify(portfolio);
    setHasChanges(changed);
  }, [localPortfolio, portfolio]);

  const handleSave = () => {
    savePortfolio({ items: localPortfolio });
  };

  const getStockPrice = (stock: PortfolioItemWithStock) => {
    return stock.stock?.marketData?.price || stock.avgPrice;
  };

  // Calculate portfolio metrics
  const portfolioValue = localPortfolio.reduce((sum, stock) => {
    const currentPrice = getStockPrice(stock);
    return sum + stock.shares * currentPrice;
  }, 0);

  const totalCost = localPortfolio.reduce((sum, stock) => sum + stock.shares * stock.avgPrice, 0);
  const totalGainLoss = portfolioValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="pt-8 sm:pt-6 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-primary" />
              My Portfolio
            </h1>
            <p className="text-muted-foreground">Manage your current stock holdings</p>
          </div>
          {hasChanges && (
            <Button
              variant="glow"
              onClick={handleSave}
              className="animate-fade-in"
              disabled={isPending}
            >
              <Save size={18} />
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>

        {localPortfolio.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-xl font-bold text-foreground break-all">
                    $
                    {portfolioValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    totalGainLoss >= 0 ? 'bg-success/20' : 'bg-destructive/20',
                  )}
                >
                  {totalGainLoss >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-success" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
                  <p
                    className={cn(
                      'text-xl font-bold break-all',
                      totalGainLoss >= 0 ? 'text-success' : 'text-destructive',
                    )}
                  >
                    {totalGainLoss >= 0 ? '+' : ''}$
                    {totalGainLoss.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    totalGainLossPercent >= 0 ? 'bg-success/20' : 'bg-destructive/20',
                  )}
                >
                  {totalGainLossPercent >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-success" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">Return %</p>
                  <p
                    className={cn(
                      'text-xl font-bold break-all',
                      totalGainLossPercent >= 0 ? 'text-success' : 'text-destructive',
                    )}
                  >
                    {totalGainLossPercent >= 0 ? '+' : ''}
                    {totalGainLossPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Holdings</h2>
          <PortfolioInput portfolio={localPortfolio} onChange={setLocalPortfolio} />
        </div>

        {localPortfolio.length > 0 && (
          <div className="glass-card p-6 mt-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Holdings Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      Stock
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                      Shares
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                      Avg Cost
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                      Current
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                      Gain/Loss
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {localPortfolio.map((stock) => (
                    <PortfolioStockRow
                      key={stock.ticker}
                      stock={stock}
                      currentPrice={getStockPrice(stock)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
