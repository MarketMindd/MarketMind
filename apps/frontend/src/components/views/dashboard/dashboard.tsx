import {
  Activity,
  Briefcase,
  ChevronRight,
  Eye,
  Filter,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RecommendationStatus, StockRecommendation } from '@market-mind/common';
import { Button } from '@/components/elements/button';
import { StockCard } from '@/components/elements/stockCard';
import { useClientQueries } from '@/hooks/useClientQueries';
import { cn } from '@/utils/tailwindUtils';

const highlightText = (text: string, riskTolerance: string, interests: string[]) => {
  if (!text) return text;

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const terms = [riskTolerance, ...interests].filter(Boolean);
  if (terms.length === 0) return text;

  const searchTerms: string[] = [];
  for (const term of terms) {
    searchTerms.push(escapeRegExp(term));
    const splitTerm = term.replace(/([A-Z])/g, ' $1').trim();
    if (splitTerm !== term) {
      searchTerms.push(escapeRegExp(splitTerm));
    }
  }

  const pattern = new RegExp(`\\b(${searchTerms.join('|')})\\b`, 'gi');
  const parts = text.split(pattern);

  if (parts.length === 1) return text;

  return (
    <>
      {parts.map((part, i) => {
        const lowercasePart = part.toLowerCase();
        const matchesAnyTerm = searchTerms.some(
          (st) => lowercasePart === st.toLowerCase().replace(/\\/g, ''),
        );

        if (matchesAnyTerm) {
          return (
            <span key={i} className="text-primary font-semibold">
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    portfolio: { usePortfolio, useAiMarketSummary },
    stocks: { useGetAllStocks },
  } = useClientQueries();
  const [filter, setFilter] = useState<'All' | RecommendationStatus>('All');
  const { data: portfolio = [] } = usePortfolio();
  const { data: marketSummary, isLoading: isSummaryLoading } = useAiMarketSummary();
  const portfolioTickers = portfolio.map((p) => p.ticker);
  const { data: stocks = [] } = useGetAllStocks();
  const portfolioStocks = stocks.filter((stock) => portfolioTickers.includes(stock.symbol));
  const recommendedStocks = stocks.filter((stock) => !portfolioTickers.includes(stock.symbol));

  const filteredRecommendedStocks = recommendedStocks.filter((stock) =>
    filter === 'All' ? true : stock.aiRecommendation.status === filter,
  );

  const investCount = stocks.filter(
    (s) => s.aiRecommendation.status === StockRecommendation.INVEST,
  ).length;
  const holdCount = stocks.filter(
    (s) => s.aiRecommendation.status === StockRecommendation.HOLD,
  ).length;
  const exitCount = stocks.filter(
    (s) => s.aiRecommendation.status === StockRecommendation.EXIT,
  ).length;

  const recommendationDisplayLabel = {
    [StockRecommendation.INVEST]: 'Buy',
    [StockRecommendation.HOLD]: 'Watch/Wait',
    [StockRecommendation.EXIT]: 'Avoid/Sell',
  };

  const summaryCards = [
    {
      label: StockRecommendation.INVEST,
      displayLabel: recommendationDisplayLabel[StockRecommendation.INVEST],
      count: investCount,
      icon: TrendingUp,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: StockRecommendation.HOLD,
      displayLabel: recommendationDisplayLabel[StockRecommendation.HOLD],
      count: holdCount,
      icon: Activity,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: StockRecommendation.EXIT,
      displayLabel: recommendationDisplayLabel[StockRecommendation.EXIT],
      count: exitCount,
      icon: TrendingDown,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-28 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Good morning, Investor</h1>
          <p className="text-muted-foreground">
            Here's your personalized market overview for today
          </p>
        </div>

        <div className="glass-card p-6 mb-8 animate-fade-in stagger-1">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 w-full">
              <h2 className="font-semibold text-foreground mb-2">AI Market Summary</h2>
              {isSummaryLoading ? (
                <div className="animate-pulse space-y-2 mt-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap mb-3">
                    {marketSummary
                      ? highlightText(
                        marketSummary.summary,
                        marketSummary.riskTolerance,
                        marketSummary.interests,
                      )
                      : 'No summary available.'}
                  </p>
                  {marketSummary?.suggestedStocks && marketSummary.suggestedStocks.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Stocks to Watch</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {marketSummary.suggestedStocks.map((ticker) => (
                          <button
                            key={ticker}
                            onClick={() => navigate(`/stock/${ticker}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors duration-200"
                          >
                            {ticker}
                            <ChevronRight size={14} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-3 grid grid-cols-3 gap-4">
            {summaryCards.map((card, i) => (
              <button
                key={card.label}
                onClick={() =>
                  setFilter(
                    filter === (card.label as typeof filter)
                      ? 'All'
                      : (card.label as typeof filter),
                  )
                }
                className={cn(
                  'glass-card p-4 text-center hover-lift animate-fade-in transition-all duration-200',
                  filter === card.label && 'ring-2 ring-primary',
                )}
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center',
                    card.bg,
                  )}
                >
                  <card.icon className={cn('w-5 h-5', card.color)} />
                </div>
                <div className={cn('text-2xl font-bold', card.color)}>{card.count}</div>
                <div className="text-sm text-muted-foreground">{card.displayLabel}</div>
              </button>
            ))}
          </div>
        </div>

        {portfolioStocks.length > 0 && (
          <div className="mb-8 animate-fade-in stagger-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Your Portfolio</h2>
                <span className="text-sm text-muted-foreground">
                  ({portfolioStocks.length} stocks)
                </span>
              </div>
              <Link
                to="/portfolio"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Manage
                <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {portfolioStocks.map((stock, i) => {
                const portfolioData = portfolio.find((p) => p.ticker === stock.symbol);
                return (
                  <div
                    key={stock.symbol}
                    className="animate-fade-in"
                    style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                  >
                    <StockCard
                      stock={stock}
                      onClick={() => navigate(`/stock/${stock.symbol}`)}
                      portfolioData={portfolioData}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="animate-fade-in stagger-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                {portfolioStocks.length > 0
                  ? 'AI Recommendations For You'
                  : 'Stock Recommendations'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <Filter size={18} className="text-muted-foreground" />
            <div className="flex gap-2">
              {([
                'All',
                StockRecommendation.INVEST,
                StockRecommendation.HOLD,
                StockRecommendation.EXIT,
              ] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(f as typeof filter)}
                  className="capitalize"
                >
                  {f === 'All' ? 'All' : recommendationDisplayLabel[f]}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecommendedStocks.map((stock, i) => (
              <div
                key={stock.symbol}
                className="animate-fade-in"
                style={{ animationDelay: `${0.2 + i * 0.1}s` }}
              >
                <StockCard stock={stock} onClick={() => navigate(`/stock/${stock.symbol}`)} />
              </div>
            ))}
          </div>

          {filteredRecommendedStocks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No stocks match this filter</p>
            </div>
          )}
        </div>

        {portfolio.length === 0 && (
          <div className="glass-card p-6 mt-8 text-center animate-fade-in">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Start Building Your Portfolio</h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
              Add stocks you own, or create a mock portfolio to practice and get personalized AI recommendations.
            </p>
            <Button variant="outline" onClick={() => navigate('/portfolio')}>
              <Briefcase size={18} />
              Add Your First Stock
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};
