import { useState, useEffect } from 'react';

import PortfolioInput from './portfolioInput';
import { mockStocks } from '@/data/mockStocks';
import { Button } from '@/components/elements/button';
import { Briefcase, TrendingUp, TrendingDown, DollarSign, Save } from 'lucide-react';
import { useClientQueries } from '@/hooks/useClientQueries';
import { PortfolioItem } from '@market-mind/common';
import { cn } from '@/utils/tailwindUtils';
import { availableStocksForPortfolio } from '@/data/mockStocks';

export const Portfolio = () => {
  const { portfolio: { usePortfolio, useSavePortfolio } } = useClientQueries();
  const { data: portfolio = [], refetch } = usePortfolio();
  const { mutate: savePortfolio, isPending } = useSavePortfolio({
    onSuccess: () => {
      setHasChanges(false);
      refetch();
    }
  });

  const [localPortfolio, setLocalPortfolio] = useState<PortfolioItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalPortfolio(portfolio);
  }, [portfolio]);

  useEffect(() => {
    // Simple deep comparison for changes
    const changed = JSON.stringify(localPortfolio) !== JSON.stringify(portfolio);
    setHasChanges(changed);
  }, [localPortfolio, portfolio]);

  const handleSave = () => {
    savePortfolio({ items: localPortfolio });
  };

  // Calculate portfolio metrics
  const portfolioValue = localPortfolio.reduce((sum, stock) => {
    const currentStock = mockStocks.find(s => s.ticker === stock.ticker);
    const currentPrice = currentStock?.price || stock.avgPrice;
    return sum + (stock.shares * currentPrice);
  }, 0);

  const totalCost = localPortfolio.reduce((sum, stock) => sum + (stock.shares * stock.avgPrice), 0);
  const totalGainLoss = portfolioValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="pt-8 sm:pt-6 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-primary" />
              My Portfolio
            </h1>
            <p className="text-muted-foreground">
              Manage your current stock holdings
            </p>
          </div>
          {hasChanges && (
            <Button variant="glow" onClick={handleSave} className="animate-fade-in" disabled={isPending}>
              <Save size={18} />
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>

        {localPortfolio.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in stagger-1">
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-xl font-bold text-foreground">${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  totalGainLoss >= 0 ? 'bg-success/20' : 'bg-destructive/20'
                )}>
                  {totalGainLoss >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-success" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
                  <p className={cn(
                    'text-xl font-bold',
                    totalGainLoss >= 0 ? 'text-success' : 'text-destructive'
                  )}>
                    {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  totalGainLossPercent >= 0 ? 'bg-success/20' : 'bg-destructive/20'
                )}>
                  {totalGainLossPercent >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-success" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Return %</p>
                  <p className={cn(
                    'text-xl font-bold',
                    totalGainLossPercent >= 0 ? 'text-success' : 'text-destructive'
                  )}>
                    {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="glass-card p-6 animate-fade-in stagger-2">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Holdings</h2>
          <PortfolioInput
            portfolio={localPortfolio}
            onChange={setLocalPortfolio}
          />
        </div>

        {localPortfolio.length > 0 && (
          <div className="glass-card p-6 mt-6 animate-fade-in stagger-3">
            <h2 className="text-lg font-semibold text-foreground mb-4">Holdings Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Stock</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Shares</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Avg Cost</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Current</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Gain/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {localPortfolio.map(stock => {
                    const currentStock = mockStocks.find(s => s.ticker === stock.ticker);
                    const currentPrice = currentStock?.price || stock.avgPrice;
                    const gainLoss = (currentPrice - stock.avgPrice) * stock.shares;
                    const gainLossPercent = stock.avgPrice > 0 ? ((currentPrice - stock.avgPrice) / stock.avgPrice) * 100 : 0;
                    const stockInfo = availableStocksForPortfolio.find(s => s.ticker === stock.ticker);

                    return (
                      <tr key={stock.ticker} className="border-b border-border/50">
                        <td className="py-3 px-2">
                          <div>
                            <span className="font-mono text-primary font-medium">{stock.ticker}</span>
                            <p className="text-xs text-muted-foreground">{stockInfo?.name}</p>
                          </div>
                        </td>
                        <td className="text-right py-3 px-2 font-medium">{stock.shares}</td>
                        <td className="text-right py-3 px-2">${stock.avgPrice.toFixed(2)}</td>
                        <td className="text-right py-3 px-2">${currentPrice.toFixed(2)}</td>
                        <td className={cn(
                          'text-right py-3 px-2 font-medium',
                          gainLoss >= 0 ? 'text-success' : 'text-destructive'
                        )}>
                          {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}
                          <span className="text-xs ml-1">({gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(1)}%)</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
