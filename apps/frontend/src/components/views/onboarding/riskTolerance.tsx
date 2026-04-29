import { ArrowRight, Check, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiskTolerance as RiskToleranceEnum } from '@market-mind/common';
import { Button } from '@/components/elements/button';
import { APP_ROUTES } from '@/consts/routes';
import { cn } from '@/utils/tailwindUtils';

const riskLevels = [
  {
    id: RiskToleranceEnum.LOW,
    name: 'Conservative',
    description: 'Lower risk, steady growth focus',
    icon: '🛡️',
  },
  {
    id: RiskToleranceEnum.MEDIUM,
    name: 'Moderate',
    description: 'Balanced risk and reward',
    icon: '⚖️',
  },
  {
    id: RiskToleranceEnum.HIGH,
    name: 'Aggressive',
    description: 'Higher risk, higher potential returns',
    icon: '🚀',
  },
];

export const RiskTolerance: React.FC = () => {
  const [selectedRisk, setSelectedRisk] = useState<RiskToleranceEnum | null>(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedRisk) return;
    navigate(APP_ROUTES.INTERESTS);
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
                  1 >= s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground',
                )}
              >
                {1 > s ? <Check size={18} /> : s}
              </div>
              {s < 2 && (
                <div
                  className={cn(
                    'w-16 h-0.5 rounded-full transition-all duration-300',
                    1 > s ? 'bg-primary' : 'bg-secondary',
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="glass-card p-8 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              What's your risk tolerance?
            </h2>
            <p className="text-muted-foreground">
              This helps us tailor recommendations to your comfort level
            </p>
          </div>

          <div className="space-y-4">
            {riskLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedRisk(level.id)}
                className={cn(
                  'w-full p-5 rounded-xl border-2 text-left transition-all duration-200 hover-lift',
                  selectedRisk === level.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-secondary/30 hover:border-muted-foreground/30',
                )}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{level.icon}</span>
                  <div>
                    <div className="font-semibold text-foreground">{level.name}</div>
                    <div className="text-sm text-muted-foreground">{level.description}</div>
                  </div>
                  {selectedRisk === level.id && (
                    <Check className="ml-auto text-primary" size={24} />
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
            <div />
            <Button variant="glow" disabled={!selectedRisk} onClick={handleContinue}>
              Continue
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
