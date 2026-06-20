import { Target, TrendingUp, Users, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/utils/tailwindUtils';

export const mockPastRecommendations = [
  {
    id: '1',
    ticker: 'NVDA',
    recommendation: 'invest',
    returnPercent: 45.2,
    outcome: 'success',
  },
  {
    id: '2',
    ticker: 'AAPL',
    recommendation: 'invest',
    returnPercent: 12.4,
    outcome: 'success',
  },
  {
    id: '3',
    ticker: 'TSLA',
    recommendation: 'exit',
    returnPercent: -15.2,
    outcome: 'success', // Successfully avoided loss
  },
  {
    id: '4',
    ticker: 'MSFT',
    recommendation: 'invest',
    returnPercent: 8.7,
    outcome: 'success',
  },
  {
    id: '5',
    ticker: 'SNOW',
    recommendation: 'invest',
    returnPercent: -5.4,
    outcome: 'failure',
  },
];

export const PerformanceStats = () => {
  const successCount = mockPastRecommendations.filter((r) => r.outcome === 'success').length;
  const totalCount = mockPastRecommendations.length;
  const successRate = Math.round((successCount / totalCount) * 100);

  const totalReturn = mockPastRecommendations.reduce((acc, r) => {
    return acc + (r.outcome === 'success' ? r.returnPercent : -Math.abs(r.returnPercent));
  }, 0);
  const avgReturn = (totalReturn / totalCount).toFixed(1);

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
            <div className="text-5xl font-bold text-success mb-2">{successRate}%</div>
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
            <div className="text-sm text-muted-foreground mt-1">Since September 2024</div>
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
                {mockPastRecommendations.slice(0, 5).map((rec, i) => (
                  <tr
                    key={rec.id}
                    className="border-b border-border/30 animate-fade-in"
                    style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                  >
                    <td className="p-4">
                      <span className="font-mono text-primary font-medium">{rec.ticker}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium capitalize',
                          rec.recommendation === 'invest' && 'bg-success/20 text-success',
                          rec.recommendation === 'hold' && 'bg-warning/20 text-warning',
                          rec.recommendation === 'exit' && 'bg-destructive/20 text-destructive',
                        )}
                      >
                        {rec.recommendation}
                      </span>
                    </td>
                    <td
                      className={cn(
                        'p-4 font-mono font-medium',
                        rec.returnPercent > 0 ? 'text-success' : 'text-destructive',
                      )}
                    >
                      {rec.returnPercent > 0 ? '+' : ''}
                      {rec.returnPercent.toFixed(1)}%
                    </td>
                    <td className="p-4">
                      {rec.outcome === 'success' ? (
                        <CheckCircle size={18} className="text-success" />
                      ) : (
                        <XCircle size={18} className="text-destructive" />
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
