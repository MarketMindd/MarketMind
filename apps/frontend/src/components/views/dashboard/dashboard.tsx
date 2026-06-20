import { useState } from 'react';
import { RecommendationStatus, StockRecommendation } from '@market-mind/common';
import { DailyBrief } from './dailyBrief';
import { RecommendationSummary, ALL_FILTERS } from './recommendationSummary';
import { RecommendedStocksList } from './recommendedStocksList';
import { PortfolioSection } from './portfolioSection';
import { useClientQueries } from '@/hooks/useClientQueries';

export const Dashboard = () => {
  const {
    portfolio: { usePortfolio, useAiMarketSummary },
    stocks: { useGetAllStocks },
  } = useClientQueries();
  const [filter, setFilter] = useState<typeof ALL_FILTERS | RecommendationStatus>(ALL_FILTERS);

  const { data: portfolio = [] } = usePortfolio();
  const { data: marketSummary, isLoading: isSummaryLoading } = useAiMarketSummary();
  const portfolioTickers = portfolio.map((p) => p.ticker);

  const { data: stocks = [] } = useGetAllStocks();
  const portfolioStocks = stocks.filter((stock) => portfolioTickers.includes(stock.symbol));
  const recommendedStocks = stocks.filter((stock) => !portfolioTickers.includes(stock.symbol));

  const filteredRecommendedStocks = recommendedStocks.filter((stock) =>
    filter === ALL_FILTERS ? true : stock.aiRecommendation.status === filter,
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



  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-28 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6 animate-fade-in">
          <p className="text-sm text-muted-foreground mb-1">{today}</p>
          <h1 className="text-3xl font-bold text-foreground">
            Hi there 👋 Here's what's worth knowing today
          </h1>
        </div>

        <DailyBrief marketSummary={marketSummary} isLoading={isSummaryLoading} />

        <RecommendationSummary
          investCount={investCount}
          holdCount={holdCount}
          exitCount={exitCount}
          currentFilter={filter}
          onFilterChange={setFilter}
        />

        <RecommendedStocksList
          filteredRecommendedStocks={filteredRecommendedStocks}
          filter={filter}
          setFilter={setFilter}
          portfolioStocksCount={portfolioStocks.length}
        />

        <PortfolioSection
          portfolio={portfolio}
          portfolioStocks={portfolioStocks}
        />
      </main>
    </div>
  );
};
