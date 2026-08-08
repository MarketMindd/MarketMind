import { Activity, TrendingDown, TrendingUp } from 'lucide-react';
import { RecommendationStatus, StockRecommendation } from '@market-mind/common';
import { cn } from '@/utils/tailwindUtils';

export const recommendationDisplayLabel = {
  [StockRecommendation.INVEST]: 'Good to buy',
  [StockRecommendation.HOLD]: 'Keep watching',
  [StockRecommendation.EXIT]: 'Better to sell',
};

interface RecommendationSummaryProps {
  investCount: number;
  holdCount: number;
  exitCount: number;
  currentFilter: typeof ALL_FILTERS | RecommendationStatus;
  onFilterChange: (filter: typeof ALL_FILTERS | RecommendationStatus) => void;
}

export const ALL_FILTERS = 'All';

export const RecommendationSummary = ({
  investCount,
  holdCount,
  exitCount,
  currentFilter,
  onFilterChange,
}: RecommendationSummaryProps) => {
  const summaryCards = [
    {
      label: StockRecommendation.INVEST,
      displayLabel: recommendationDisplayLabel[StockRecommendation.INVEST],
      count: investCount,
      icon: TrendingUp,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: StockRecommendation.HOLD,
      displayLabel: recommendationDisplayLabel[StockRecommendation.HOLD],
      count: holdCount,
      icon: Activity,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: StockRecommendation.EXIT,
      displayLabel: recommendationDisplayLabel[StockRecommendation.EXIT],
      count: exitCount,
      icon: TrendingDown,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
      {summaryCards.map((card, i) => (
        <button
          key={card.label}
          onClick={() =>
            onFilterChange(
              currentFilter === (card.label as typeof currentFilter)
                ? ALL_FILTERS
                : (card.label as typeof currentFilter),
            )
          }
          className={cn(
            'glass-card p-4 text-left hover-lift animate-fade-in transition-all duration-200 h-full flex flex-col',
            currentFilter === card.label && 'ring-2 ring-primary',
          )}
          style={{ animationDelay: `${0.1 + i * 0.1}s` }}
        >
          <div
            className={cn(
              'w-9 h-9 rounded-lg mb-3 flex items-center justify-center shrink-0',
              card.bg,
            )}
          >
            <card.icon className={cn('w-5 h-5', card.color)} />
          </div>
          <div className={cn('text-2xl font-bold mt-auto', card.color)}>{card.count}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{card.displayLabel}</div>
        </button>
      ))}
    </div>
  );
};
