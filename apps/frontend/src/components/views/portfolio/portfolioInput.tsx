import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/elements/button';
import { Input } from '@/components/elements/input';
import { Plus, X, Briefcase } from 'lucide-react';
import { availableStocksForPortfolio } from '@/data/mockStocks';
import { PortfolioItem } from '@market-mind/common';
import { cn } from '@/utils/tailwindUtils';

interface PortfolioInputProps {
  portfolio: PortfolioItem[];
  onChange: (portfolio: PortfolioItem[]) => void;
  compact?: boolean;
}

const PortfolioInput = ({ portfolio, onChange, compact = false }: PortfolioInputProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredStocks = availableStocksForPortfolio.filter(
    stock =>
      !portfolio.some(p => p.ticker === stock.ticker) &&
      (stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addStock = (ticker: string) => {
    onChange([...portfolio, { ticker, shares: 0, avgPrice: 0 }]);
    setSearchTerm('');
    setShowDropdown(false);
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || filteredStocks.length === 0) return;

    const maxIndex = Math.min(filteredStocks.length, 5) - 1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (maxIndex >= 0) {
        addStock(filteredStocks[highlightedIndex].ticker);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowDropdown(false);
      setHighlightedIndex(0);
    }
  };

  const removeStock = (ticker: string) => {
    onChange(portfolio.filter(s => s.ticker !== ticker));
  };

  const updateStock = (ticker: string, field: 'shares' | 'avgPrice', valueStr: string) => {
    if (valueStr.length > 10) return;

    const numValue = valueStr === '' ? 0 : Number(valueStr);
    if (isNaN(numValue) || numValue < 0) return;

    onChange(
      portfolio.map(s =>
        s.ticker === ticker ? { ...s, [field]: numValue } : s
      )
    );
  };

  return (
    <div className={cn('space-y-4', compact && 'space-y-3')}>
      <div className="relative" ref={dropdownRef}>
        <Input
          type="text"
          placeholder="Search stocks to add..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setShowDropdown(true);
            setHighlightedIndex(0);
          }}
          className={cn(compact && 'h-9 text-sm')}
        />
        {showDropdown && searchTerm && filteredStocks.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
            {filteredStocks.slice(0, 5).map((stock, index) => (
              <button
                key={stock.ticker}
                type="button"
                onClick={() => addStock(stock.ticker)}
                className={cn(
                  "w-full px-4 py-2 text-left flex items-center justify-between text-sm transition-colors",
                  highlightedIndex === index ? "bg-secondary" : "hover:bg-secondary/50"
                )}
              >
                <span className="font-mono text-primary">{stock.ticker}</span>
                <span className="text-muted-foreground text-xs">{stock.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {portfolio.length > 0 && (
        <div className={cn('space-y-2', compact && 'space-y-1.5')}>
          {portfolio.map(stock => {
            const stockInfo = availableStocksForPortfolio.find(s => s.ticker === stock.ticker);
            return (
              <div
                key={stock.ticker}
                className={cn(
                  'flex items-center gap-2 bg-secondary/30 rounded-lg p-3',
                  compact && 'p-2'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('font-mono text-primary font-medium', compact && 'text-sm')}>
                      {stock.ticker}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {stockInfo?.name}
                    </span>
                  </div>
                  <div className={cn('flex gap-2 mt-2', compact && 'mt-1.5')}>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Shares</label>
                      <Input
                        type="number"
                        min="0"
                        value={stock.shares || ''}
                        onChange={(e) => updateStock(stock.ticker, 'shares', e.target.value)}
                        className={cn('h-8 text-sm mt-0.5', compact && 'h-7')}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Avg Price ($)</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={stock.avgPrice || ''}
                        onChange={(e) => updateStock(stock.ticker, 'avgPrice', e.target.value)}
                        className={cn('h-8 text-sm mt-0.5', compact && 'h-7')}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeStock(stock.ticker)}
                >
                  <X size={16} />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {portfolio.length === 0 && (
        <div className={cn(
          'text-center py-6 border border-dashed border-border rounded-lg',
          compact && 'py-4'
        )}>
          <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No stocks added yet. Search above to add your holdings.
          </p>
        </div>
      )}
    </div>
  );
};

export default PortfolioInput;
