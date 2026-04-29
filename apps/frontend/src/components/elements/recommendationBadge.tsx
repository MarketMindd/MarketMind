import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { AiResponse, StockRecommendation } from '@market-mind/common';
import { iconSizes, sizeClasses } from '@/consts/recommendationBadge';
import { Size } from '@/enums/recommendationBadge';
import { RecommendationBadgeConfig } from '@/types/recommendationBadge';
import { cn } from '@/utils/tailwindUtils';

interface RecommendationBadgeProps {
  recommendation: AiResponse['status'];
  confidence?: AiResponse['confidence'];
  size?: Size;
  showConfidence?: boolean;
}

const config: Record<StockRecommendation, RecommendationBadgeConfig> = {
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

const RecommendationBadge = ({
  recommendation,
  confidence,
  size = Size.MD,
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
      {showConfidence && confidence && <span className="opacity-70 ml-1">({confidence}%)</span>}
    </div>
  );
};

export default RecommendationBadge;
