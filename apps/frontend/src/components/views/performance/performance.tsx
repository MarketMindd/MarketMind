import { Size } from '@/enums/recommendationBadge';
import { useClientQueries } from '@/hooks/useClientQueries';
import { formatDate } from '@/utils/dateUtils';
import { cn } from '@/utils/tailwindUtils';
import { StockRecommendation } from '@market-mind/common';
import { Award, CheckCircle, Loader2, Target, TrendingUp, XCircle } from 'lucide-react';
import { Term } from '../../elements/term';
import { RecommendationBadge } from '../../elements/recommendationBadge';

export const Performance = () => {
  const {
    performance: { useGetPerformance },
  } = useClientQueries();

  const { data: performanceData, isLoading } = useGetPerformance();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Failed to load performance data.
      </div>
    );
  }

  const { successRate, avgReturn, totalCalls, successCount, directionalCount, since } = performanceData.stats;
  const recommendations = performanceData.recommendations;

  const avgReturnDisplay = avgReturn.toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-28 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Performance Transparency</h1>
          <p className="text-muted-foreground">Track record of our AI recommendations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-6 animate-fade-in stagger-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-success" />
              </div>
              <span className="text-muted-foreground">Success Rate</span>
            </div>
            <div
              className={cn(
                'text-4xl font-bold',
                directionalCount > 0 ? 'text-success' : 'text-center text-muted-foreground',
              )}
            >
              {directionalCount > 0 ? `${successRate.toFixed(1)}%` : '—'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {directionalCount > 0
                ? `${successCount} of ${directionalCount} graded calls`
                : 'No graded calls yet'}
            </div>
          </div>

          <div className="glass-card p-6 animate-fade-in stagger-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span className="text-muted-foreground">Avg Return</span>
            </div>
            <div
              className={cn(
                'text-4xl font-bold',
                directionalCount === 0
                  ? 'text-center text-muted-foreground'
                  : avgReturn > 0
                    ? 'text-success'
                    : avgReturn < 0
                      ? 'text-destructive'
                      : 'text-foreground',
              )}
            >
              {directionalCount === 0 ? '—' : `${avgReturn > 0 ? '+' : ''}${avgReturnDisplay}%`}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {directionalCount === 0 ? 'No graded calls yet' : 'Per graded recommendation'}
            </div>
          </div>

          <div className="glass-card p-6 animate-fade-in stagger-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-warning" />
              </div>
              <span className="text-muted-foreground">Total Calls</span>
            </div>
            <div className="text-4xl font-bold text-foreground">{totalCalls}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {totalCalls === 0 ? 'No calls yet' : `Since ${formatDate(since)}`}
            </div>
          </div>
        </div>

        {/* Recommendations Table */}
        <div className="glass-card overflow-hidden animate-fade-in stagger-4">
          <div className="p-4 border-b border-border/50">
            <h2 className="font-semibold text-foreground">Past Recommendations</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 text-left">
                  <th className="p-4 text-sm font-medium text-muted-foreground">Stock</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Call</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Entry Price</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Current</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Return</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                      No recommendations yet. Check back once the AI has made some calls.
                    </td>
                  </tr>
                )}
                {recommendations.map((rec, i) => (
                  <tr
                    key={rec.id}
                    className="border-b border-border/30 hover:bg-secondary/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${0.4 + i * 0.05}s` }}
                  >
                    <td className="p-4">
                      <div>
                        <span className="font-mono text-primary font-medium">
                          {rec.stockSymbol}
                        </span>
                        <div className="text-sm text-muted-foreground">{rec.companyName}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <RecommendationBadge
                        recommendation={rec.status as unknown as StockRecommendation}
                        size={Size.SM}
                      />
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(rec.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-mono text-foreground">${rec.entryPrice.toFixed(2)}</td>
                    <td className="p-4 font-mono text-foreground">
                      ${rec.currentPrice.toFixed(2)}
                    </td>
                    <td
                      className={cn(
                        'p-4 font-mono font-medium',
                        rec.outcome === 'N/A'
                          ? 'text-muted-foreground'
                          : rec.returnPct > 0
                            ? 'text-success'
                            : 'text-destructive',
                      )}
                    >
                      {rec.outcome === 'N/A'
                        ? '—'
                        : `${rec.returnPct > 0 ? '+' : ''}${rec.returnPct.toFixed(1)}%`}
                    </td>
                    <td className="p-4">
                      {rec.outcome === 'Success' ? (
                        <div className="flex items-center gap-2 text-success">
                          <CheckCircle size={18} />
                          <span className="text-sm font-medium">Success</span>
                        </div>
                      ) : rec.outcome === 'Miss' ? (
                        <div className="flex items-center gap-2 text-destructive">
                          <XCircle size={18} />
                          <span className="text-sm font-medium">Miss</span>
                        </div>
                      ) : (
                        <Term
                          term="Pending"
                          explanation="No price movement yet since this call was made (markets may be closed), so it can't be graded as a win or a loss yet."
                          hideIcon
                          className="text-sm text-muted-foreground no-underline"
                        >
                          Pending
                        </Term>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center mt-8 max-w-2xl mx-auto">
          Past performance is not indicative of future results. All recommendations are for
          educational purposes only and do not constitute financial advice. Always do your own
          research before making investment decisions.
        </p>
      </main>
    </div>
  );
};
