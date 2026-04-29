import { Award, ChevronRight, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

import { mockPastRecommendations } from '@/data/mockData';
import { cn } from '@/utils/tailwindUtils';

const PerformanceSummary = () => {
  const successCount = mockPastRecommendations.filter((r) => r.outcome === 'success').length;
  const totalCount = mockPastRecommendations.length;
  const successRate = Math.round((successCount / totalCount) * 100);

  const totalReturn = mockPastRecommendations.reduce((acc, r) => {
    return acc + (r.outcome === 'success' ? r.returnPercent : -Math.abs(r.returnPercent));
  }, 0);
  const avgReturn = (totalReturn / totalCount).toFixed(1);

  return (
    <div className="glass-card p-5 animate-fade-in h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Award className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">AI Performance</h2>
        </div>
        <Link
          to="/performance"
          className="flex items-center gap-0.5 text-xs text-primary hover:underline"
        >
          Details
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-success" />
            <span className="text-xs text-muted-foreground">Success Rate</span>
          </div>
          <span className="text-sm font-bold text-success">{successRate}%</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground">Avg Return</span>
          </div>
          <span
            className={cn(
              'text-sm font-bold',
              Number(avgReturn) > 0 ? 'text-success' : 'text-destructive',
            )}
          >
            +{avgReturn}%
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-2">
            <Award size={14} className="text-warning" />
            <span className="text-xs text-muted-foreground">Total Calls</span>
          </div>
          <span className="text-sm font-bold text-foreground">{totalCount}</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceSummary;
