import { Filter, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecommendationStatus, Stock, StockRecommendation } from '@market-mind/common';
import { Button } from '@/components/elements/button';
import { StockCard } from '@/components/elements/stockCard';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ALL_FILTERS, recommendationDisplayLabel } from './recommendationSummary';

const INITIAL_VISIBLE_STOCKS = 6;
const ANIMATION_DELAY_INCREMENT_SECONDS = 0.1; // 100 ms
const FADE_IN_DURATION_MS = 400;
const BUFFER_MS = 50; // Extra time to ensure the last card's animation completes before removing the glow suppression
const REVEAL_GLOW_SUPPRESSION_MS =
  FADE_IN_DURATION_MS +
  (INITIAL_VISIBLE_STOCKS - 1) * (ANIMATION_DELAY_INCREMENT_SECONDS * 1000) +
  BUFFER_MS;

interface RecommendedStocksListProps {
  filteredRecommendedStocks: Stock[];
  filter: typeof ALL_FILTERS | RecommendationStatus;
  setFilter: (filter: typeof ALL_FILTERS | RecommendationStatus) => void;
  selectedSectors: Stock['sector'][];
  setSelectedSectors: Dispatch<SetStateAction<string[]>>;
  availableSectors: string[];
  portfolioStocksCount: number;
}

export const RecommendedStocksList = ({
  filteredRecommendedStocks,
  filter,
  setFilter,
  selectedSectors,
  setSelectedSectors,
  availableSectors,
  portfolioStocksCount,
}: RecommendedStocksListProps) => {
  const navigate = useNavigate();
  const [visibleStockCount, setVisibleStockCount] = useState(INITIAL_VISIBLE_STOCKS);
  const [isRevealAnimationRunning, setIsRevealAnimationRunning] = useState(false);
  const revealGlowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibleStocks = filteredRecommendedStocks.slice(0, visibleStockCount);
  const remainingStockCount = filteredRecommendedStocks.length - visibleStocks.length;
  const selectedSectorsLabel = selectedSectors.length ? selectedSectors.join(', ') : 'All Sectors';

  useEffect(() => {
    setVisibleStockCount(INITIAL_VISIBLE_STOCKS);
  }, [filter, selectedSectors]);

  useEffect(() => {
    return () => {
      if (revealGlowTimeoutRef.current) {
        clearTimeout(revealGlowTimeoutRef.current);
      }
    };
  }, []);

  const toggleSector = (sector: string) => {
    setSelectedSectors((currentSectors) =>
      currentSectors.includes(sector)
        ? currentSectors.filter((currentSector) => currentSector !== sector)
        : [...currentSectors, sector],
    );
  };

  const handleShowMore = () => {
    setVisibleStockCount((count) => count + INITIAL_VISIBLE_STOCKS);
    setIsRevealAnimationRunning(true);

    if (revealGlowTimeoutRef.current) {
      clearTimeout(revealGlowTimeoutRef.current);
    }

    revealGlowTimeoutRef.current = setTimeout(() => {
      setIsRevealAnimationRunning(false);
    }, REVEAL_GLOW_SUPPRESSION_MS);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            {portfolioStocksCount > 0 ? 'Picks for you' : 'Stocks the AI likes for you'}
          </h2>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Tap any card to see why — in plain English, with no jargon.
      </p>

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <Filter size={18} className="text-muted-foreground" />
        <div className="flex gap-2 flex-wrap">
          {(
            [
              ALL_FILTERS,
              StockRecommendation.INVEST,
              StockRecommendation.HOLD,
              StockRecommendation.EXIT,
            ] as const
          ).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(f as typeof filter)}
            >
              {f === ALL_FILTERS ? ALL_FILTERS : recommendationDisplayLabel[f]}
            </Button>
          ))}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="glass"
              className="w-[340px] justify-between border-border/50 font-normal hover:border-primary/50"
              aria-label={`Filter stocks by sector. Selected: ${selectedSectorsLabel}`}
              title={selectedSectorsLabel}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate">{selectedSectorsLabel}</span>
                {selectedSectors.length > 0 && (
                  <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-xs font-semibold text-primary">
                    {selectedSectors.length}
                  </span>
                )}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="glass-card w-[340px] border-border/50 p-2 shadow-xl shadow-black/20"
          >
            <div className="flex items-center justify-between px-2 py-2">
              <DropdownMenuLabel className="p-0 text-xs uppercase tracking-wide text-muted-foreground">
                Filter by sector
              </DropdownMenuLabel>
              {selectedSectors.length > 0 && (
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-primary hover:bg-primary/10 hover:text-primary"
                  onClick={() => setSelectedSectors([])}
                >
                  Clear all
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            {availableSectors.map((availableSector) => (
              <DropdownMenuCheckboxItem
                key={availableSector}
                checked={selectedSectors.includes(availableSector)}
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={() => toggleSector(availableSector)}
                className="mb-1 rounded-lg py-2.5 pl-9 pr-3 last:mb-0 data-[state=checked]:bg-primary/15 data-[state=checked]:text-primary"
              >
                {availableSector}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${isRevealAnimationRunning ? 'suppress-stock-hover-glow' : ''}`}
      >
        {visibleStocks.map((stock, i) => (
          <div
            key={stock.symbol}
            className="animate-fade-in"
            style={{
              animationDelay: `${(i % INITIAL_VISIBLE_STOCKS) * ANIMATION_DELAY_INCREMENT_SECONDS}s`,
            }}
          >
            <StockCard stock={stock} onClick={() => navigate(`/stock/${stock.symbol}`)} />
          </div>
        ))}
      </div>

      {filteredRecommendedStocks.length > 0 && (
        <div className="mt-5 flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {visibleStocks.length} of {filteredRecommendedStocks.length} picks
          </p>
          {remainingStockCount > 0 && (
            <Button variant="outline" onClick={handleShowMore}>
              Show {Math.min(INITIAL_VISIBLE_STOCKS, remainingStockCount)} more
            </Button>
          )}
        </div>
      )}

      {filteredRecommendedStocks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No stocks here right now — try another filter.</p>
        </div>
      )}
    </div>
  );
};
