import { ArrowLeft, Check, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RiskTolerance, SectorInterest } from '@market-mind/common';
import { Button } from '@/components/elements/button';
import { APP_ROUTES } from '@/consts/routes';
import { useClientQueries } from '@/hooks/useClientQueries';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/tailwindUtils';

const sectors: { id: SectorInterest; name: string; icon: string; description: string; examples: string }[] = [
  { id: SectorInterest.TECHNOLOGY, name: 'Technology', icon: '💻', description: 'Companies that design, develop, and manufacture technology products.', examples: 'Apple, Microsoft, Nvidia' },
  { id: SectorInterest.HEALTHCARE, name: 'Healthcare', icon: '🏥', description: 'Medical services, equipment, and pharmaceuticals.', examples: 'Johnson & Johnson, Pfizer, UnitedHealth' },
  { id: SectorInterest.FINANCE, name: 'Finance', icon: '🏦', description: 'Banks, investment funds, and insurance companies.', examples: 'JPMorgan Chase, Visa, Goldman Sachs' },
  { id: SectorInterest.ENERGY, name: 'Energy', icon: '⚡', description: 'Exploration and production of oil, gas, and renewable energy.', examples: 'ExxonMobil, Chevron, NextEra Energy' },
  { id: SectorInterest.CONSUMER, name: 'Consumer', icon: '🛒', description: 'Retailers, food, and beverage companies.', examples: 'Amazon, Walmart, Coca-Cola' },
  { id: SectorInterest.INDUSTRIAL, name: 'Industrial', icon: '🏭', description: 'Manufacturing, machinery, and defense.', examples: 'Boeing, Caterpillar, Honeywell' },
  { id: SectorInterest.REAL_ESTATE, name: 'Real Estate', icon: '🏠', description: 'Property management, development, and REITs.', examples: 'American Tower, Prologis, Simon Property' },
  { id: SectorInterest.MATERIALS, name: 'Materials', icon: '🔧', description: 'Chemicals, construction materials, and mining.', examples: 'Linde, Sherwin-Williams, Newmont' },
];

export const Interests: React.FC = () => {
  const [selectedSectors, setSelectedSectors] = useState<SectorInterest[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const riskTolerance =
    (location.state as { riskTolerance?: RiskTolerance } | null)?.riskTolerance ?? null;

  const {
    profile: { useUpdateProfile },
  } = useClientQueries();

  const updateProfile = useUpdateProfile({
    onSuccess: () => {
      navigate(APP_ROUTES.DASHBOARD);
    },
    onError: (err: Error) =>
      toast({
        title: 'Failed to save preferences',
        description: err.message,
        variant: 'destructive',
      }),
  });

  const toggleSector = (sectorId: SectorInterest) => {
    setSelectedSectors((prev) =>
      prev.includes(sectorId) ? prev.filter((id) => id !== sectorId) : [...prev, sectorId],
    );
  };

  const canProceed = selectedSectors.length >= 2;

  const handleContinue = () => {
    if (!canProceed) return;
    updateProfile.mutate({
      ...(riskTolerance ? { riskTolerance } : {}),
      interests: selectedSectors,
    });
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
                  'group relative p-4 rounded-xl border-2 text-center transition-all duration-300 overflow-hidden min-h-[120px] flex flex-col items-center justify-center',
                  selectedSectors.includes(sector.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-secondary/30 hover:border-muted-foreground/30',
                )}
              >
                <div className="flex flex-col items-center justify-center transition-all duration-300 group-hover:opacity-0 group-hover:scale-95 absolute inset-0">
                  <span className="text-3xl block mb-2">{sector.icon}</span>
                  <span className="text-sm font-medium text-foreground">{sector.name}</span>
                  {selectedSectors.includes(sector.id) && (
                    <Check className="absolute top-3 right-3 text-primary" size={18} />
                  )}
                </div>
                <div className="flex flex-col items-center justify-center text-center opacity-0 scale-95 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 absolute inset-0 p-3 bg-secondary/95 backdrop-blur-sm">
                  <span className="text-xs font-semibold text-foreground mb-1">{sector.name}</span>
                  <span className="text-[10px] text-muted-foreground mb-2 leading-tight">{sector.description}</span>
                  <span className="text-[10px] text-primary/80 font-medium leading-tight">e.g., {sector.examples}</span>
                  {selectedSectors.includes(sector.id) && (
                    <Check className="absolute top-2 right-2 text-primary" size={14} />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft size={18} />
              Back
            </Button>
            <Button
              variant="glow"
              disabled={!canProceed || updateProfile.isPending}
              onClick={handleContinue}
            >
              {updateProfile.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              {updateProfile.isPending ? 'Saving...' : 'Start Investing'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
