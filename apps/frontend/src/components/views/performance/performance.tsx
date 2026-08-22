import { ArrowLeft, Award, CheckCircle, Loader2, Target, TrendingUp, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RecommendationOutcome, StockRecommendation } from '@market-mind/common';
import { APP_ROUTES } from '@/consts/routes';
import { Size } from '@/enums/recommendationBadge';
import { useClientQueries } from '@/hooks/useClientQueries';
import { useIsAuthenticated } from '@/hooks/useIsAuthenticated';
import { formatDate } from '@/utils/dateUtils';
import { cn } from '@/utils/tailwindUtils';
import { RecommendationBadge } from '../../elements/recommendationBadge';
import { Term } from '../../elements/term';

export const Performance = () => {
  const isAuthenticated = useIsAuthenticated();
  const {
    performance: { useGetPerformance },
    profile: { useGetProfile },
  } = useClientQueries();

  const { data: profileData, isLoading: isProfileLoading } = useGetProfile({
    enabled: isAuthenticated,
  });
  const riskTolerance = isAuthenticated ? profileData?.riskTolerance : undefined;
  const performanceReady = !isAuthenticated || riskTolerance !== undefined;

  const { data: performanceData, isLoading: isPerfLoading } = useGetPerformance(riskTolerance, {
    enabled: performanceReady,
  });

  const isLoading = isProfileLoading || isPerfLoading;

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

  const {
    successRate,
    avgReturn,
    totalCalls,
    successCount,
    directionalCount,
    holdSuccessCount,
    holdGradedCount,
    since,
  } = performanceData.stats;
  const recommendations = performanceData.recommendations;

  const avgReturnDisplay = avgReturn.toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-28 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link
            to={APP_ROUTES.DASHBOARD}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl font-bold text-foreground">Performance Transparency</h1>
            {riskTolerance && (
              <span className="px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-sm font-medium">
                {riskTolerance} risk
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            {riskTolerance
              ? `Track record of our AI recommendations for ${riskTolerance.toLowerCase()}-risk portfolios like yours`
              : 'Track record of our AI recommendations across all risk levels'}
          </p>
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
                ? `${successCount} of ${directionalCount} Invest/Exit calls`
                : 'No graded calls yet'}
            </div>
            {holdGradedCount > 0 && (
              <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                <Term
                  term="Hold calls are scored separately"
                  explanation="Hold means the AI expected the stock to stay put, so it isn't a bet on direction. Counting Hold calls in the hit rate would let an AI look accurate by never committing to anything."
                  hideIcon
                  className="no-underline cursor-help"
                >
                  {holdSuccessCount} of {holdGradedCount} Hold calls stayed stable
                </Term>
              </div>
            )}
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
            <h2 className="font-semibold text-foreground">Recommendation History</h2>
            {recommendations.length < totalCalls && (
              <p className="text-xs text-muted-foreground mt-1">
                Showing the {recommendations.length} most recent of {totalCalls} calls.
              </p>
            )}
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
                        rec.outcome === RecommendationOutcome.NOT_APPLICABLE
                          ? 'text-muted-foreground'
                          : rec.returnPct > 0
                            ? 'text-success'
                            : 'text-destructive',
                      )}
                    >
                      {rec.outcome === RecommendationOutcome.NOT_APPLICABLE
                        ? '—'
                        : `${rec.returnPct > 0 ? '+' : ''}${rec.returnPct.toFixed(1)}%`}
                    </td>
                    <td className="p-4">
                      {rec.outcome === RecommendationOutcome.SUCCESS ? (
                        <div className="flex items-center gap-2 text-success">
                          <CheckCircle size={18} />
                          <span className="text-sm font-medium">Success</span>
                          {rec.status === StockRecommendation.HOLD && (
                            <span className="text-xs text-muted-foreground">(not counted)</span>
                          )}
                        </div>
                      ) : rec.outcome === RecommendationOutcome.MISS ? (
                        <div className="flex items-center gap-2 text-destructive">
                          <XCircle size={18} />
                          <span className="text-sm font-medium">Miss</span>
                          {rec.status === StockRecommendation.HOLD && (
                            <span className="text-xs text-muted-foreground">(not counted)</span>
                          )}
                        </div>
                      ) : (
                        <Term
                          term="Pending"
                          explanation="The price hasn't moved more than 1% since this call was made, so it's still within day-to-day noise and can't fairly be graded a win or a loss."
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
