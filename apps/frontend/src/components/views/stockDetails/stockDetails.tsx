import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Brain,
  Clock,
  LineChart,
  Target,
  Zap,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import { StockRecommendation } from '@market-mind/common';
import { Button } from '@/components/elements/button';
import { RecommendationBadge } from '@/components/elements/recommendationBadge';
import { buildAskAiHref } from '@/consts/routes';
import { useClientQueries } from '@/hooks/useClientQueries';
import { cn } from '@/utils/tailwindUtils';

export const StockDetails = () => {
  const { stockSymbol } = useParams<{ stockSymbol: string }>();
  const navigate = useNavigate();

  const {
    stocks: { useGetStock },
  } = useClientQueries();
  const { data: stock, isLoading } = useGetStock(stockSymbol!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-pulse">
          <h2 className="text-xl font-semibold text-foreground mb-2">Analyzing Stock Data...</h2>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Stock not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const isPositive = stock.marketData.priceChange >= 0;
  const isAnalyzed = stock.aiRecommendation.status !== StockRecommendation.NOT_ANALYZED;

  return (
    <div className="flex-1 flex flex-col bg-background w-full">
      <main className="pt-8 sm:pt-6 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6 animate-fade-in"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Button>

        {/* Header — name + plain recommendation */}
        <div className="glass-card p-6 mb-6 animate-fade-in stagger-1">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">{stock.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono">{stock.symbol}</span>
                <span>·</span>
                <span>{stock.sector}</span>
              </div>
            </div>
            {isAnalyzed && (
              <RecommendationBadge
                recommendation={stock.aiRecommendation.status}
                confidence={stock.aiRecommendation.confidence}
                size="lg"
                showConfidence
              />
            )}
          </div>

          <div className="flex items-end gap-6 flex-wrap">
            <div>
              <span className="text-4xl font-bold text-foreground">
                ${stock.marketData.price.toFixed(2)}
              </span>
              <div
                className={cn(
                  'flex items-center gap-1 text-base mt-1',
                  isPositive ? 'text-success' : 'text-destructive',
                )}
              >
                {isPositive ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                <span>
                  {isPositive ? 'up' : 'down'} {Math.abs(stock.marketData.priceChange).toFixed(2)}%
                  today
                  <span className="text-muted-foreground ml-2 text-sm">
                    ({isPositive ? '+' : ''}$
                    {Math.abs(
                      (stock.marketData.price * stock.marketData.priceChange) / 100,
                    ).toFixed(2)}
                    )
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Plain-English explanation — the main thing */}
        <div className="glass-card p-6 mb-6 animate-fade-in stagger-2 border-l-4 border-l-primary">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Why the AI thinks this</h2>
            </div>
            <Button
              size="sm"
              className="flex items-center gap-2"
              onClick={() =>
                navigate(
                  buildAskAiHref({
                    symbol: stock.symbol,
                    prompt: `Give me your analysis of ${stock.symbol}.`,
                  }),
                )
              }
            >
              <Brain size={16} />
              Ask AI Assistant
            </Button>
          </div>
          {stock.aiRecommendation.aiSummary && (
            <p className="text-foreground/90 leading-relaxed mb-3">
              {stock.aiRecommendation.aiSummary}
            </p>
          )}
          <p className="text-muted-foreground text-sm leading-relaxed">
            {stock.aiRecommendation.rationale ||
              'This stock has not been analyzed yet. Add it to your portfolio to receive AI recommendations.'}
          </p>
        </div>

        {/* Insights */}
        {stock.aiRecommendation.status !== StockRecommendation.NOT_ANALYZED && (
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
        )}

        {/* Price chart — moved below, optional context */}
        <div className="glass-card p-6 mb-6 animate-fade-in stagger-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <LineChart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Price over the last 30 days</h2>
              <p className="text-xs text-muted-foreground">
                Just for reference — short-term swings don't usually matter much.
              </p>
            </div>
          </div>
          <div style={{ height: '400px', width: '100%' }}>
            <AdvancedRealTimeChart
              symbol={stock.symbol}
              range="1M"
              interval="D"
              theme="dark"
              autosize
            />
          </div>
        </div>
      </main>
    </div>
  );
};
