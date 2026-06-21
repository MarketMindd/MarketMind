import { Check, Settings } from 'lucide-react';
import { RiskTolerance, SectorInterest } from '@market-mind/common';
import { cn } from '@/utils/tailwindUtils';

const riskLevels = [
  {
    id: RiskTolerance.LOW,
    name: 'Conservative',
    description:
      'I prioritize keeping my money safe over high returns. I would be stressed if my portfolio dropped.',
    icon: '🛡️',
  },
  {
    id: RiskTolerance.MEDIUM,
    name: 'Moderate',
    description: 'I want a balance. I can accept some ups and downs for a chance at better returns.',
    icon: '⚖️',
  },
  {
    id: RiskTolerance.HIGH,
    name: 'Aggressive',
    description:
      "I'm comfortable with large swings in my portfolio value for the chance of higher long-term growth.",
    icon: '🚀',
  },
];

const sectors: {
  id: SectorInterest;
  name: string;
  icon: string;
  description: string;
  examples: string;
}[] = [
  {
    id: SectorInterest.TECHNOLOGY,
    name: 'Technology',
    icon: '💻',
    description: 'Companies that design, develop, and manufacture technology products.',
    examples: 'Apple, Microsoft, Nvidia',
  },
  {
    id: SectorInterest.HEALTHCARE,
    name: 'Healthcare',
    icon: '🏥',
    description: 'Medical services, equipment, and pharmaceuticals.',
    examples: 'Johnson & Johnson, Pfizer, UnitedHealth',
  },
  {
    id: SectorInterest.FINANCE,
    name: 'Finance',
    icon: '🏦',
    description: 'Banks, investment funds, and insurance companies.',
    examples: 'JPMorgan Chase, Visa, Goldman Sachs',
  },
  {
    id: SectorInterest.ENERGY,
    name: 'Energy',
    icon: '⚡',
    description: 'Exploration and production of oil, gas, and renewable energy.',
    examples: 'ExxonMobil, Chevron, NextEra Energy',
  },
  {
    id: SectorInterest.CONSUMER,
    name: 'Consumer',
    icon: '🛒',
    description: 'Retailers, food, and beverage companies.',
    examples: 'Amazon, Walmart, Coca-Cola',
  },
  {
    id: SectorInterest.INDUSTRIAL,
    name: 'Industrial',
    icon: '🏭',
    description: 'Manufacturing, machinery, and defense.',
    examples: 'Boeing, Caterpillar, Honeywell',
  },
  {
    id: SectorInterest.REAL_ESTATE,
    name: 'Real Estate',
    icon: '🏠',
    description: 'Property management, development, and REITs.',
    examples: 'American Tower, Prologis, Simon Property',
  },
  {
    id: SectorInterest.MATERIALS,
    name: 'Materials',
    icon: '🔧',
    description: 'Chemicals, construction materials, and mining.',
    examples: 'Linde, Sherwin-Williams, Newmont',
  },
];

interface ProfilePreferencesSectionProps {
  riskTolerance: RiskTolerance;
  interests: SectorInterest[];
  onRiskToleranceChange: (value: RiskTolerance) => void;
  onInterestsChange: (value: SectorInterest[]) => void;
}

export const ProfilePreferencesSection = ({
  riskTolerance,
  interests,
  onRiskToleranceChange,
  onInterestsChange,
}: ProfilePreferencesSectionProps) => {
  const toggleSector = (sectorId: SectorInterest) => {
    onInterestsChange(
      interests.includes(sectorId)
        ? interests.filter((id) => id !== sectorId)
        : [...interests, sectorId],
    );
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
        <Settings className="w-5 h-5 text-primary" />
        Investment Preferences
      </h2>

      <div className="mb-6">
        <p className="text-sm font-medium text-foreground mb-3">Risk Tolerance</p>
        <div className="space-y-3">
          {riskLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => onRiskToleranceChange(level.id)}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover-lift',
                riskTolerance === level.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-secondary/30 hover:border-muted-foreground/30',
              )}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{level.icon}</span>
                <div>
                  <div className="font-semibold text-foreground">{level.name}</div>
                  <div className="text-sm text-muted-foreground">{level.description}</div>
                </div>
                {riskTolerance === level.id && (
                  <Check className="ml-auto text-primary" size={20} />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-3">Sector Interests</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sectors.map((sector) => (
            <button
              key={sector.id}
              onClick={() => toggleSector(sector.id)}
              className={cn(
                'group relative p-4 rounded-xl border-2 text-center transition-all duration-300 overflow-hidden min-h-[120px] flex flex-col items-center justify-center',
                interests.includes(sector.id)
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-secondary/30 hover:border-muted-foreground/30',
              )}
            >
              <div className="flex flex-col items-center justify-center transition-all duration-300 group-hover:opacity-0 group-hover:scale-95 absolute inset-0">
                <span className="text-3xl block mb-2">{sector.icon}</span>
                <span className="text-sm font-medium text-foreground">{sector.name}</span>
                {interests.includes(sector.id) && (
                  <Check className="absolute top-3 right-3 text-primary" size={18} />
                )}
              </div>
              <div className="flex flex-col items-center justify-center text-center opacity-0 scale-95 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 absolute inset-0 p-3 bg-secondary/95 backdrop-blur-sm">
                <span className="text-xs font-semibold text-foreground mb-1">{sector.name}</span>
                <span className="text-[10px] text-muted-foreground mb-2 leading-tight">
                  {sector.description}
                </span>
                <span className="text-[10px] text-primary/80 font-medium leading-tight">
                  e.g., {sector.examples}
                </span>
                {interests.includes(sector.id) && (
                  <Check className="absolute top-2 right-2 text-primary" size={14} />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
