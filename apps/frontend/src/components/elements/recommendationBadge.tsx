import { Eye, ThumbsDown, ThumbsUp } from 'lucide-react';
import { StockRecommendation } from '@market-mind/common';
import { cn } from '@/utils/tailwindUtils';
import { Term } from './term';

interface RecommendationBadgeProps {
  recommendation: StockRecommendation;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
  showConfidence?: boolean;
}

const getConfidenceLabel = (confidence: number) => {
  if (confidence >= 80)
    return {
      word: 'strongly sure',
      explain: 'The AI is very confident in this recommendation based on historical patterns.',
    };
  if (confidence >= 60)
    return {
      word: 'fairly sure',
      explain: 'The AI is moderately confident, but there is some market uncertainty.',
    };
  return { word: 'somewhat sure', explain: 'The AI sees mixed signals. Proceed with caution.' };
};

export const RecommendationBadge = ({
  recommendation,
  confidence,
  size = 'md',
  showConfidence = false,
}: RecommendationBadgeProps) => {
  const normalizedRec = recommendation || StockRecommendation.NOT_ANALYZED;

  // If not analyzed yet, show a subtle loading/waiting badge
  if (normalizedRec === StockRecommendation.NOT_ANALYZED) {
    return (
      <div className="inline-flex items-center gap-2">
        <div className="inline-flex items-center rounded-full border font-medium text-xs px-2.5 py-1 gap-1.5 bg-muted/50 text-muted-foreground border-border/50">
          <Eye size={12} />
          <span>Analyzing...</span>
        </div>
      </div>
    );
  }

  const config = {
    [StockRecommendation.INVEST]: {
      icon: ThumbsUp,
      className: 'bg-success/15 text-success border-success/30',
      term: 'Buy / Invest',
      label: 'Good to buy',
      explain: 'The AI thinks this stock is likely to grow in value from here.',
    },
    [StockRecommendation.HOLD]: {
      icon: Eye,
      className: 'bg-warning/15 text-warning border-warning/30',
      term: 'Hold',
      label: 'Keep watching',
      explain: "Don't buy more, but don't sell either — wait and watch.",
    },
    [StockRecommendation.EXIT]: {
      icon: ThumbsDown,
      className: 'bg-destructive/15 text-destructive border-destructive/30',
      term: 'Sell / Exit',
      label: 'Better to sell',
      explain: 'The AI thinks the risks outweigh the upside right now.',
    },
  };

  const recConfig = config[normalizedRec];
  const { icon: Icon, className, term, label, explain } = recConfig;

  const sizeClasses: Record<typeof size, string> = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  };
  const iconSizes: Record<typeof size, number> = { sm: 12, md: 14, lg: 16 };

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={cn(
          'inline-flex items-center rounded-full border font-medium',
          className,
          sizeClasses[size],
        )}
      >
        <Icon size={iconSizes[size]} />
        <Term term={term} explanation={explain} hideIcon className="no-underline cursor-help">
          {label}
        </Term>
      </div>
      {showConfidence &&
        confidence !== undefined &&
        (() => {
          const c = getConfidenceLabel(confidence);
          return (
            <Term
              term={`Confidence: ${confidence}%`}
              explanation={c.explain}
              hideIcon
              className="text-xs text-muted-foreground no-underline"
            >
              <span className="opacity-80">· {c.word}</span>
            </Term>
          );
        })()}
    </div>
  );
};
