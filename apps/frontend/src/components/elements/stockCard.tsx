import { ArrowDown, ArrowUp, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { PortfolioItem, Stock, StockRecommendation } from '@market-mind/common';
import { AskAiButton } from '@/components/elements/askAiButton';
import { RecommendationBadge } from '@/components/elements/recommendationBadge';
import { Size } from '@/enums/recommendationBadge';
import { cn } from '@/utils/tailwindUtils';
import { Term } from './term';

interface StockCardProps {
  stock: Stock;
  onClick?: () => void;
  className?: string;
  portfolioData?: PortfolioItem;
}

export const StockCard = ({ stock, onClick, className, portfolioData }: StockCardProps) => {
  const [isAskAiHovered, setIsAskAiHovered] = useState(false);
  const isPositive = stock.marketData.priceChange >= 0;
  const directionWord = isPositive ? 'up' : 'down';
  const isAnalyzed = stock.aiRecommendation.status !== StockRecommendation.NOT_ANALYZED;

  // We use aiSummary if available, else rationale, else a generic fallback.
  const shortExplanation =
    stock.aiRecommendation.aiSummary ||
    stock.aiRecommendation.rationale ||
    'The AI is still gathering data on this stock.';

  const askPrompt = !isAnalyzed
    ? undefined
    : portfolioData
      ? `How is my ${stock.symbol} holding doing, and should I hold, add to it, or exit?`
      : `Why is ${stock.symbol} rated ${stock.aiRecommendation.status}? Would it fit my portfolio?`;

  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card p-5 cursor-pointer flex flex-col',
        !isAskAiHovered && 'hover-lift group',
        className,
      )}
    >
      {/* Name first (beginners recognize names, not tickers) */}
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {stock.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Term
              term={`Ticker: ${stock.symbol}`}
              explanation="A short code that uniquely identifies a company on the stock market."
              hideIcon
              className="font-mono no-underline"
            >
              {stock.symbol}
            </Term>
            <span>·</span>
            <span className="truncate">{stock.sector}</span>
          </div>
        </div>
        <RecommendationBadge recommendation={stock.aiRecommendation.status} size={Size.MD} />
      </div>

      {/* Plain summary */}
      <p className="text-sm text-foreground/80 leading-relaxed mb-4 line-clamp-3">
        {shortExplanation}
      </p>

      {/* Price block with plain wording */}
      <div className="mt-auto pt-4 border-t border-border/50">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-semibold text-foreground">
              ${stock.marketData.price.toFixed(2)}
            </div>
            <div
              className={cn(
                'flex items-center gap-1 text-sm mt-1',
                isPositive ? 'text-success' : 'text-destructive',
              )}
            >
              {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              <span>
                {directionWord} {Math.abs(stock.marketData.priceChange).toFixed(2)}% today
              </span>
            </div>
          </div>
          {isAnalyzed && (
            <Term
              term={`AI confidence: ${stock.aiRecommendation.confidence}%`}
              explanation="How sure the AI is about this recommendation, based on its analysis."
              hideIcon
              className="text-xs text-muted-foreground text-right no-underline gap-1.5"
            >
              <span className="block">AI is</span>
              <span className="text-foreground font-medium">
                {stock.aiRecommendation.confidence >= 80
                  ? 'strongly'
                  : stock.aiRecommendation.confidence >= 60
                    ? 'fairly'
                    : 'somewhat'}{' '}
                sure
              </span>
            </Term>
          )}
        </div>
      </div>

      {portfolioData && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Briefcase size={12} className="text-primary" />
            <span>You own this</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {portfolioData.shares} shares · bought at ${portfolioData.avgPrice.toFixed(2)}
            </span>
            <span
              className={cn(
                'font-medium',
                stock.marketData.price > portfolioData.avgPrice
                  ? 'text-success'
                  : 'text-destructive',
              )}
            >
              {stock.marketData.price > portfolioData.avgPrice ? '+' : ''}
              {(
                ((stock.marketData.price - portfolioData.avgPrice) / portfolioData.avgPrice) *
                100
              ).toFixed(1)}
              %
            </span>
          </div>
        </div>
      )}

      <div
        className={cn(
          'mt-4 pt-4 border-t border-border/50 flex items-center justify-between gap-2',
          portfolioData && 'mt-3 pt-3',
        )}
      >
        <span className="text-xs text-primary font-medium group-hover:underline">See why →</span>
        <span
          onMouseEnter={() => setIsAskAiHovered(true)}
          onMouseLeave={() => setIsAskAiHovered(false)}
        >
          <AskAiButton symbol={stock.symbol} prompt={askPrompt} />
        </span>
      </div>
    </div>
  );
};
