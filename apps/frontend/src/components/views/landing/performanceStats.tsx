import { CheckCircle, Target, TrendingUp, Users, XCircle } from 'lucide-react';
import { StockRecommendation } from '@market-mind/common';
import { useClientQueries } from '@/hooks/useClientQueries';
import { cn } from '@/utils/tailwindUtils';

export const PerformanceStats = () => {
  const {
    performance: { useGetPerformance },
  } = useClientQueries();
  const { data: performanceData, isLoading } = useGetPerformance();

  if (isLoading || !performanceData) {
    return (
      <section id="performance" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
          <span className="text-muted-foreground animate-pulse">Loading performance stats...</span>
        </div>
      </section>
    );
  }

  const { stats, recommendations } = performanceData;
  const { successCount, totalCalls: totalCount, successRate } = stats;
  const avgReturn = stats.avgReturn.toFixed(1);

  return (
    <section id="performance" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Proven Track Record</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Transparency is core to our approach. Here's our complete recommendation history.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="glass-card p-8 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-4">
              <Target className="w-7 h-7 text-success" />
            </div>
            <div className="text-5xl font-bold text-success mb-2">
              {Number(successRate.toFixed(1))}%
            </div>
            <div className="text-muted-foreground">Success Rate</div>
            <div className="text-sm text-muted-foreground mt-1">
              {successCount} of {totalCount} calls
            </div>
          </div>

          <div className="glass-card p-8 text-center animate-fade-in stagger-1">
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-7 h-7 text-primary" />
            </div>
            <div
              className={cn(
                'text-5xl font-bold mb-2',
                Number(avgReturn) > 0 ? 'text-success' : 'text-destructive',
              )}
            >
              +{avgReturn}%
            </div>
            <div className="text-muted-foreground">Average Return</div>
            <div className="text-sm text-muted-foreground mt-1">Per recommendation</div>
          </div>

          <div className="glass-card p-8 text-center animate-fade-in stagger-2">
            <div className="w-14 h-14 rounded-xl bg-warning/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-warning" />
            </div>
            <div className="text-5xl font-bold text-foreground mb-2">{totalCount}</div>
            <div className="text-muted-foreground">Total Recommendations</div>
            <div className="text-sm text-muted-foreground mt-1">Since {stats.since}</div>
          </div>
        </div>

        {/* Recent Recommendations */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold text-foreground">Recent Recommendations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 text-left">
                  <th className="p-4 text-sm font-medium text-muted-foreground">Stock</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Call</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Return</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.slice(0, 5).map((rec, i) => (
                  <tr
                    key={rec.id}
                    className="border-b border-border/30 animate-fade-in"
                    style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                  >
                    <td className="p-4">
                      <span className="font-mono text-primary font-medium">{rec.stockSymbol}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium capitalize',
                          rec.status === StockRecommendation.INVEST && 'bg-success/20 text-success',
                          rec.status === StockRecommendation.HOLD && 'bg-warning/20 text-warning',
                          rec.status === StockRecommendation.EXIT &&
                            'bg-destructive/20 text-destructive',
                        )}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td
                      className={cn(
                        'p-4 font-mono font-medium',
                        rec.returnPct > 0 ? 'text-success' : 'text-destructive',
                      )}
                    >
                      {rec.returnPct > 0 ? '+' : ''}
                      {rec.returnPct.toFixed(1)}%
                    </td>
                    <td className="p-4">
                      {rec.outcome === 'Success' ? (
                        <CheckCircle size={18} className="text-success" />
                      ) : rec.outcome === 'Miss' ? (
                        <XCircle size={18} className="text-destructive" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
