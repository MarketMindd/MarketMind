import { PortfolioItem } from '@market-mind/common';
import { availableStocksForPortfolio, mockStocks } from '@/data/mockStocks';
import { cn } from '@/utils/tailwindUtils';

interface PortfolioStockRowProps {
  stock: PortfolioItem;
}

export const PortfolioStockRow = ({ stock }: PortfolioStockRowProps) => {
  const currentStock = mockStocks.find((s) => s.ticker === stock.ticker);
  const currentPrice = currentStock?.price || stock.avgPrice;
  const gainLoss = (currentPrice - stock.avgPrice) * stock.shares;
  const gainLossPercent =
    stock.avgPrice > 0 ? ((currentPrice - stock.avgPrice) / stock.avgPrice) * 100 : 0;
  const stockInfo = availableStocksForPortfolio.find((s) => s.ticker === stock.ticker);

  return (
    <tr className="border-b border-border/50">
      <td className="py-3 px-2">
        <div>
          <span className="font-mono text-primary font-medium">{stock.ticker}</span>
          <p className="text-xs text-muted-foreground">{stockInfo?.name}</p>
        </div>
      </td>
      <td className="text-right py-3 px-2 font-medium">{stock.shares}</td>
      <td className="text-right py-3 px-2">${stock.avgPrice.toFixed(2)}</td>
      <td className="text-right py-3 px-2">${currentPrice.toFixed(2)}</td>
      <td
        className={cn(
          'text-right py-3 px-2 font-medium',
          gainLoss >= 0 ? 'text-success' : 'text-destructive',
        )}
      >
        {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}
        <span className="text-xs ml-1">
          ({gainLossPercent >= 0 ? '+' : ''}
          {gainLossPercent.toFixed(1)}%)
        </span>
      </td>
    </tr>
  );
};
