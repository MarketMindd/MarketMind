import { Filter, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RecommendationStatus, Stock, StockRecommendation } from '@market-mind/common';
import { Button } from '@/components/elements/button';
import { StockCard } from '@/components/elements/stockCard';
import { ALL_FILTERS, recommendationDisplayLabel } from './recommendationSummary';

interface RecommendedStocksListProps {
  filteredRecommendedStocks: Stock[];
  filter: typeof ALL_FILTERS | RecommendationStatus;
  setFilter: (filter: typeof ALL_FILTERS | RecommendationStatus) => void;
  portfolioStocksCount: number;
}

export const RecommendedStocksList = ({
  filteredRecommendedStocks,
  filter,
  setFilter,
  portfolioStocksCount,
}: RecommendedStocksListProps) => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in stagger-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            {portfolioStocksCount > 0 ? 'Picks for you' : 'Stocks the AI likes for you'}
          </h2>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Tap any card to see why — in plain English, with no jargon.
      </p>

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <Filter size={18} className="text-muted-foreground" />
        <div className="flex gap-2 flex-wrap">
          {(
            [
              ALL_FILTERS,
              StockRecommendation.INVEST,
              StockRecommendation.HOLD,
              StockRecommendation.EXIT,
            ] as const
          ).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(f as typeof filter)}
            >
              {f === ALL_FILTERS ? ALL_FILTERS : recommendationDisplayLabel[f]}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRecommendedStocks.map((stock, i) => (
          <div
            key={stock.symbol}
            className="animate-fade-in"
            style={{ animationDelay: `${0.2 + i * 0.1}s` }}
          >
            <StockCard stock={stock} onClick={() => navigate(`/stock/${stock.symbol}`)} />
          </div>
        ))}
      </div>

      {filteredRecommendedStocks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No stocks here right now — try another filter.
          </p>
        </div>
      )}
    </div>
  );
};
