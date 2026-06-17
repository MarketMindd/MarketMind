import { PortfolioItemWithStock } from '@market-mind/common';
import { AskAiButton } from '@/components/elements/askAiButton';
import { cn } from '@/utils/tailwindUtils';

interface PortfolioStockRowProps {
  stock: PortfolioItemWithStock;
  currentPrice: number;
}

export const PortfolioStockRow = ({ stock, currentPrice }: PortfolioStockRowProps) => {
  const gainLoss = (currentPrice - stock.avgPrice) * stock.shares;
  const gainLossPercent =
    stock.avgPrice > 0 ? ((currentPrice - stock.avgPrice) / stock.avgPrice) * 100 : 0;

  return (
    <tr className="border-b border-border/50">
      <td className="py-3 px-2">
        <div>
          <span className="font-mono text-primary font-medium">{stock.ticker}</span>
          <p className="text-xs text-muted-foreground">{stock.stock?.name}</p>
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
      <td className="text-right py-3 px-2">
        <AskAiButton
          symbol={stock.ticker}
          prompt={`How is my ${stock.ticker} holding performing, and should I hold, add, or exit?`}
        />
      </td>
    </tr>
  );
};
