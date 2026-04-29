import { ArrowLeft, Check, Sparkles, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/elements/button';
import { APP_ROUTES } from '@/consts/routes';
import { cn } from '@/utils/tailwindUtils';

const sectors = [
  { id: 'tech', name: 'Technology', icon: '💻' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
  { id: 'finance', name: 'Finance', icon: '🏦' },
  { id: 'energy', name: 'Energy', icon: '⚡' },
  { id: 'consumer', name: 'Consumer', icon: '🛒' },
  { id: 'industrial', name: 'Industrial', icon: '🏭' },
  { id: 'realestate', name: 'Real Estate', icon: '🏠' },
  { id: 'materials', name: 'Materials', icon: '🔧' },
];

export const Interests: React.FC = () => {
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const navigate = useNavigate();

  const toggleSector = (sectorId: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sectorId) ? prev.filter((id) => id !== sectorId) : [...prev, sectorId],
    );
  };

  const canProceed = selectedSectors.length >= 2;

  const handleContinue = () => {
    if (!canProceed) return;
    navigate(APP_ROUTES.DASHBOARD);
  };

  const handleBack = () => {
    navigate(APP_ROUTES.RISK_TOLERANCE);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-semibold">
            <span className="text-foreground">Market</span>
            <span className="text-primary">Mind</span>
          </span>
        </div>
        <div className="flex items-center justify-center gap-3 mb-12">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300',
                  2 >= s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground',
                )}
              >
                {2 > s ? <Check size={18} /> : s}
              </div>
              {s < 2 && (
                <div
                  className={cn(
                    'w-16 h-0.5 rounded-full transition-all duration-300',
                    2 > s ? 'bg-primary' : 'bg-secondary',
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="glass-card p-8 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Select your interests</h2>
            <p className="text-muted-foreground">Choose at least 2 sectors you're interested in</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {sectors.map((sector) => (
              <button
                key={sector.id}
                onClick={() => toggleSector(sector.id)}
                className={cn(
                  'p-4 rounded-xl border-2 text-center transition-all duration-200 hover-lift',
                  selectedSectors.includes(sector.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-secondary/30 hover:border-muted-foreground/30',
                )}
              >
                <span className="text-2xl block mb-2">{sector.icon}</span>
                <span className="text-sm font-medium text-foreground">{sector.name}</span>
                {selectedSectors.includes(sector.id) && (
                  <Check className="mx-auto mt-2 text-primary" size={18} />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft size={18} />
              Back
            </Button>
            <Button variant="glow" disabled={!canProceed} onClick={handleContinue}>
              <Sparkles size={18} />
              Start Investing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
