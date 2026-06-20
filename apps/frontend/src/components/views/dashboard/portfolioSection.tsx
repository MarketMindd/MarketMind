import { Briefcase, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PortfolioItemWithStock, Stock } from '@market-mind/common';
import { Button } from '@/components/elements/button';
import { StockCard } from '@/components/elements/stockCard';

interface PortfolioSectionProps {
  portfolio: PortfolioItemWithStock[];
  portfolioStocks: Stock[];
}

export const PortfolioSection = ({ portfolio, portfolioStocks }: PortfolioSectionProps) => {
  const navigate = useNavigate();

  if (portfolio.length === 0) {
    return (
      <div className="glass-card p-6 mt-8 text-center animate-fade-in">
        <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Do you already own some stocks?
        </h3>
        <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
          Tell us what you own and we'll keep an eye on it for you — plus tailor recommendations
          around it.
        </p>
        <Button variant="outline" onClick={() => navigate('/portfolio')}>
          <Briefcase size={18} />
          Add what I own
        </Button>
      </div>
    );
  }

  if (portfolioStocks.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 animate-fade-in stagger-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">What you own</h2>
          <span className="text-sm text-muted-foreground">({portfolioStocks.length})</span>
        </div>
        <Link
          to="/portfolio"
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Edit
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
  );
};
