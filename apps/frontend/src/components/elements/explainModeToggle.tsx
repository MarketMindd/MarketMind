import { Baby, GraduationCap, LucideIcon } from 'lucide-react';
import type { ExplainMode } from '@market-mind/common';
import { cn } from '../../utils/tailwindUtils';

interface ExplainModeToggleProps {
  mode: ExplainMode;
  onChange: (mode: ExplainMode) => void;
  className?: string;
}

const OPTIONS: { value: ExplainMode; label: string; icon: LucideIcon }[] = [
  { value: 'easy', label: 'Easy mode', icon: Baby },
  { value: 'pro', label: 'Professional', icon: GraduationCap },
];

export const ExplainModeToggle = ({ mode, onChange, className }: ExplainModeToggleProps) => {
  return (
    <div
      role="group"
      aria-label="Explanation style"
      className={cn('inline-flex items-center gap-1 rounded-lg bg-secondary/60 p-1', className)}
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = mode === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            title={
              option.value === 'easy'
                ? 'Beginner-friendly explanations, no jargon'
                : 'Concise, technical explanations for experienced investors'
            }
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon size={14} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
