import { ChevronRight, Eye, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MarketSummaryResult } from '@market-mind/common';
import { AskAiButton } from '@/components/elements/askAiButton';
import { highlightText } from '@/utils/textUtils';

interface DailyBriefProps {
  marketSummary?: MarketSummaryResult;
  isLoading: boolean;
}

export const DailyBrief = ({ marketSummary, isLoading }: DailyBriefProps) => {
  const navigate = useNavigate();

  return (
    <div className="glass-card p-6 mb-6 animate-fade-in stagger-1 border-l-4 border-l-primary">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 w-full">
          <h2 className="font-semibold text-foreground mb-3">Your daily brief</h2>
          {isLoading ? (
            <div className="animate-pulse space-y-2 mt-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          ) : (
            <div className="space-y-3 text-foreground/90 leading-relaxed">
              <p className="whitespace-pre-wrap">
                {marketSummary
                  ? highlightText(
                      marketSummary.summary,
                      marketSummary.riskTolerance,
                      marketSummary.interests,
                    )
                  : 'No summary available.'}
              </p>
              {marketSummary?.suggestedStocks && marketSummary.suggestedStocks.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border/50 flex flex-col flex-wrap gap-x-4 gap-y-2">
                  <div className="flex items-center gap-2">
                    <Eye size={18} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">Stocks to Watch</span>
                  </div>
                  <div className="flex gap-2 flex-wrap items-center">
                    {marketSummary.suggestedStocks.map((ticker: string) => (
                      <div
                        key={ticker}
                        className="inline-flex items-stretch rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors duration-200 border border-primary/10 overflow-hidden group"
                      >
                        <button
                          onClick={() => navigate(`/stock/${ticker}`)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-primary text-xs text-center font-medium hover:bg-primary/30 transition-colors duration-200"
                        >
                          {ticker}
                          <ChevronRight size={14} />
                        </button>
                        <div className="w-px bg-primary/20 group-hover:bg-primary/30 transition-colors duration-200" />
                        <AskAiButton
                          symbol={ticker}
                          prompt={`Tell me about ${ticker} and why it might be worth watching.`}
                          label=""
                          className="px-2 rounded-none hover:bg-primary/30 m-0 h-auto"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
