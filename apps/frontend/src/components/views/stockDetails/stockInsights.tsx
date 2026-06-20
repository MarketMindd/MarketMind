import { Clock, Target } from 'lucide-react';
import { Stock, StockRecommendation } from '@market-mind/common';

interface StockInsightsProps {
  stock: Stock;
}

export const StockInsights = ({ stock }: StockInsightsProps) => {
  if (stock.aiRecommendation.status === StockRecommendation.NOT_ANALYZED) {
    return null;
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      <div className="glass-card p-6 animate-fade-in stagger-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-warning" />
          </div>
          <h3 className="font-semibold text-foreground">In the next few months</h3>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {stock.aiRecommendation.shortTermOutlook || 'No short-term outlook available.'}
        </p>
      </div>

      <div className="glass-card p-6 animate-fade-in stagger-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-success" />
          </div>
          <h3 className="font-semibold text-foreground">A year or two out</h3>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {stock.aiRecommendation.longTermOutlook || 'No long-term outlook available.'}
        </p>
      </div>
    </div>
  );
};
