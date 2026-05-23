import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Brain,
  Clock,
  LineChart,
  Target,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import { calculatePriceChange, StockRecommendation } from '@market-mind/common';
import { Button } from '@/components/elements/button';
import RecommendationBadge from '@/components/elements/recommendationBadge';
import { Size } from '@/enums/recommendationBadge';
import { useClientQueries } from '@/hooks/useClientQueries';
import { cn } from '@/utils/tailwindUtils';

export const StockDetails = () => {
  const { stockSymbol } = useParams();
  const { stocks } = useClientQueries();

  const {
    data: stock,
    isLoading,
    error,
  } = stocks.useGetStock(stockSymbol ?? '', {
    enabled: !!stockSymbol,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-xl font-semibold text-foreground">Loading...</span>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Stock not found</h2>
          <Link to="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPositive = stock.marketData.priceChange >= 0;
  const isAnalyzed = stock.aiRecommendation.status !== StockRecommendation.NOT_ANALYZED;

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="pt-8 sm:pt-6 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6 animate-fade-in">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Button>
        </Link>

        <div className="glass-card p-6 mb-6 animate-fade-in stagger-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="font-mono text-2xl text-primary font-bold">{stock.symbol}</span>
                <span className="text-sm text-muted-foreground px-3 py-1 bg-secondary rounded-full whitespace-nowrap">
                  {stock.sector}
                </span>
              </div>
              <h1 className="text-xl font-semibold text-foreground">{stock.name}</h1>
            </div>
            <RecommendationBadge
              recommendation={stock.aiRecommendation.status}
              confidence={stock.aiRecommendation.confidence}
              size={Size.LG}
              showConfidence
            />
          </div>

          <div className="flex items-end gap-6">
            <div>
              <span className="text-4xl font-bold text-foreground">
                ${stock.marketData.price.toFixed(2)}
              </span>
              <div
                className={cn(
                  'flex items-center gap-1 text-lg mt-1',
                  isPositive ? 'text-success' : 'text-destructive',
                )}
              >
                {isPositive ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                <span>
                  {isPositive ? '+' : ''}
                  {calculatePriceChange(stock.marketData.price, stock.marketData.priceChange)} (
                  {isPositive ? '+' : ''}
                  {stock.marketData.priceChange.toFixed(2)}%)
                </span>
              </div>
            </div>

            {isAnalyzed && (
              <div className="ml-auto">
                <span className="text-sm text-muted-foreground block mb-2">AI Confidence</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        stock.aiRecommendation.confidence >= 80
                          ? 'bg-success'
                          : stock.aiRecommendation.confidence >= 60
                            ? 'bg-warning'
                            : 'bg-destructive',
                      )}
                      style={{ width: `${stock.aiRecommendation.confidence}%` }}
                    />
                  </div>
                  <span className="text-lg font-mono font-semibold">
                    {stock.aiRecommendation.confidence}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-6 mb-6 animate-fade-in stagger-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <LineChart className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Price History (30 Days)</h2>
          </div>
          <div style={{ height: '500px', width: '100%' }}>
            <AdvancedRealTimeChart
              symbol={stock.symbol}
              range="1M"
              interval="D"
              theme="dark"
              autosize
            />
          </div>
        </div>

        <div className="glass-card p-6 mb-6 animate-fade-in stagger-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">AI Analysis</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {stock.aiRecommendation.rationale}
          </p>
        </div>

        {(stock.aiRecommendation.shortTermOutlook || stock.aiRecommendation.longTermOutlook) && (
          <div className="grid md:grid-cols-2 gap-6 mb-6 animate-fade-in stagger-4">
            {stock.aiRecommendation.shortTermOutlook && (
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                  <h3 className="font-semibold text-foreground">Short-Term Outlook</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {stock.aiRecommendation.shortTermOutlook}
                </p>
              </div>
            )}
            {stock.aiRecommendation.longTermOutlook && (
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-success" />
                  </div>
                  <h3 className="font-semibold text-foreground">Long-Term Outlook</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {stock.aiRecommendation.longTermOutlook}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
