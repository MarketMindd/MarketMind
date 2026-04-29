import { ArrowDownRight, ArrowUpRight, Briefcase } from 'lucide-react';
import { PortfolioStock, Stock } from '@market-mind/common';
import { cn } from '@/utils/tailwindUtils';
import RecommendationBadge from '@/components/elements/recommendationBadge';

interface StockCardProps {
  stock: Stock;
  onClick?: () => void;
  className?: string;
  portfolioData?: PortfolioStock;
}

const StockCard = ({ stock, onClick, className, portfolioData }: StockCardProps) => {
  const isPositive = stock.change >= 0;

  return (
    <div
      onClick={onClick}
      className={cn('glass-card p-5 hover-lift cursor-pointer group', className)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-primary font-semibold">{stock.ticker}</span>
            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-secondary rounded-full">
              {stock.sector}
            </span>
          </div>
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
            {stock.name}
          </h3>
        </div>
        <RecommendationBadge
          recommendation={stock.recommendation}
          confidence={stock.confidence}
          showConfidence
        />
      </div>

      <div className="flex items-end justify-between mb-4">
        <div>
          <span className="text-2xl font-semibold text-foreground">${stock.price.toFixed(2)}</span>
          <div
            className={cn(
              'flex items-center gap-1 text-sm mt-1',
              isPositive ? 'text-success' : 'text-destructive',
            )}
          >
            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span>
              {isPositive ? '+' : ''}
              {stock.change.toFixed(2)} ({isPositive ? '+' : ''}
              {stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground">Confidence</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  stock.confidence >= 80
                    ? 'bg-success'
                    : stock.confidence >= 60
                      ? 'bg-warning'
                      : 'bg-destructive',
                )}
                style={{ width: `${stock.confidence}%` }}
              />
            </div>
            <span className="text-sm font-mono text-muted-foreground">{stock.confidence}%</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{stock.explanation}</p>

      {portfolioData && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Briefcase size={12} className="text-primary" />
            <span>Your holding</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {portfolioData.shares} shares @ ${portfolioData.avgPrice.toFixed(2)}
            </span>
            <span
              className={cn(
                'font-medium',
                stock.price > portfolioData.avgPrice ? 'text-success' : 'text-destructive',
              )}
            >
              {stock.price > portfolioData.avgPrice ? '+' : ''}
              {(((stock.price - portfolioData.avgPrice) / portfolioData.avgPrice) * 100).toFixed(1)}
              %
            </span>
          </div>
        </div>
      )}

      <div className={cn('mt-4 pt-4 border-t border-border/50', portfolioData && 'mt-3 pt-3')}>
        <span className="text-xs text-primary font-medium group-hover:underline">
          View full analysis →
        </span>
      </div>
    </div>
  );
};

export default StockCard;
