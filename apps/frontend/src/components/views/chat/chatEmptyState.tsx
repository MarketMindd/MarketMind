import { Send } from 'lucide-react';
import type { ExplainMode } from '@market-mind/common';
import { ExplainModeToggle } from '../../elements/explainModeToggle';
import { Button } from '../../elements/button';
import { Input } from '../../elements/input';

interface ChatEmptyStateProps {
  firstName: string;
  input: string;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  isPendingSend: boolean;
  explainMode: ExplainMode;
  onExplainModeChange: (mode: ExplainMode) => void;
}

export const ChatEmptyState = ({
  firstName,
  input,
  onInputChange,
  onKeyDown,
  onSend,
  isPendingSend,
  explainMode,
  onExplainModeChange,
}: ChatEmptyStateProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full px-6 py-8 space-y-8 animate-fade-in relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_60%)] pointer-events-none" />

      <div className="text-center space-y-2 relative z-10">
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
          What can I help with, {firstName}?
        </h1>
        <p className="text-sm text-muted-foreground">
          Ask about your portfolio, stock recommendations, or financial metrics.
        </p>
      </div>

      <div className="w-full relative z-10 glass-card p-4 rounded-2xl border border-border/40 space-y-3 shadow-lg bg-card/40">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask MarketMind AI..."
            className="flex-1 bg-background/50 border-border/30 focus:border-primary/50"
            disabled={isPendingSend}
            autoFocus
          />
          <Button
            variant="glow"
            size="icon"
            onClick={() => onSend()}
            disabled={!input.trim() || isPendingSend}
          >
            <Send size={18} />
          </Button>
        </div>
        <div className="flex justify-center">
          <ExplainModeToggle mode={explainMode} onChange={onExplainModeChange} />
        </div>
      </div>
    </div>
  );
};
