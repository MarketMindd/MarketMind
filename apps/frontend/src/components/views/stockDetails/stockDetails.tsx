import { Button } from '@/components/elements/button';
import RecommendationBadge from '@/components/elements/recommendationBadge';
import StockChart from '@/components/elements/stockChart';
import { mockStocks } from '@/data/mockData';
import { cn } from '@/utils/tailwindUtils';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Brain,
  LineChart,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const StockDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const stock = mockStocks.find((s) => s.id === id);

  if (!stock) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Stock not found
          </h2>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isPositive = stock.change >= 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-28 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Back button */}
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6 animate-fade-in">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="glass-card p-6 mb-6 animate-fade-in stagger-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-2xl text-primary font-bold">
                  {stock.ticker}
                </span>
                <span className="text-sm text-muted-foreground px-3 py-1 bg-secondary rounded-full">
                  {stock.sector}
                </span>
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                {stock.name}
              </h1>
            </div>
            <RecommendationBadge
              recommendation={stock.recommendation}
              confidence={stock.confidence}
              size="lg"
              showConfidence
            />
          </div>

          <div className="flex items-end gap-6">
            <div>
              <span className="text-4xl font-bold text-foreground">
                ${stock.price.toFixed(2)}
              </span>
              <div
                className={cn(
                  'flex items-center gap-1 text-lg mt-1',
                  isPositive ? 'text-success' : 'text-destructive',
                )}
              >
                {isPositive ? (
                  <ArrowUpRight size={20} />
                ) : (
                  <ArrowDownRight size={20} />
                )}
                <span>
                  {isPositive ? '+' : ''}
                  {stock.change.toFixed(2)} ({isPositive ? '+' : ''}
                  {stock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="ml-auto">
              <span className="text-sm text-muted-foreground block mb-2">
                AI Confidence
              </span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      stock.confidence >= 80
                        ? 'bg-success'
                        : stock.confidence >= 60
                          ? 'bg-warning'
                          : 'bg-destructive',
                    )}
                    style={{ width: `${stock.confidence}%` }}
                  />
                </div>
                <span className="text-lg font-mono font-semibold">
                  {stock.confidence}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 mb-6 animate-fade-in stagger-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <LineChart className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Price History (30 Days)
            </h2>
          </div>
          <StockChart stock={stock} />
        </div>

        <div className="glass-card p-6 mb-6 animate-fade-in stagger-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              AI Analysis
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {stock.longExplanation}
          </p>
        </div>
      </main>
    </div>
  );
};

export default StockDetails;
