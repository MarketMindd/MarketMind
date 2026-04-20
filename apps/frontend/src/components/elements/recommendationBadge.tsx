import { cn } from '@/utils/tailwindUtils';
import { StockRecommendation } from '@market-mind/common';
import { TrendingUp, Minus, TrendingDown } from 'lucide-react';

interface RecommendationBadgeProps {
  recommendation: StockRecommendation;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
  showConfidence?: boolean;
}

const config: Record<
  StockRecommendation,
  {
    label: string;
    icon: React.ComponentType<{ size?: number }>;
    className: string;
  }
> = {
  [StockRecommendation.INVEST]: {
    label: 'Invest',
    icon: TrendingUp,
    className: 'bg-success/20 text-success border-success/30',
  },
  [StockRecommendation.HOLD]: {
    label: 'Hold',
    icon: Minus,
    className: 'bg-warning/20 text-warning border-warning/30',
  },
  [StockRecommendation.EXIT]: {
    label: 'Exit',
    icon: TrendingDown,
    className: 'bg-destructive/20 text-destructive border-destructive/30',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-1 gap-1',
  md: 'text-sm px-3 py-1.5 gap-1.5',
  lg: 'text-base px-4 py-2 gap-2',
};

const iconSizes = {
  sm: 12,
  md: 14,
  lg: 16,
};

const RecommendationBadge = ({
  recommendation,
  confidence,
  size = 'md',
  showConfidence = false,
}: RecommendationBadgeProps) => {
  const { label, icon: Icon, className } = config[recommendation];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        className,
        sizeClasses[size],
      )}
    >
      <Icon size={iconSizes[size]} />
      <span>{label}</span>
      {showConfidence && confidence && (
        <span className="opacity-70 ml-1">({confidence}%)</span>
      )}
    </div>
  );
};

export default RecommendationBadge;
