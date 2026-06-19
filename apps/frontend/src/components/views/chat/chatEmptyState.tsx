import type { ExplainMode } from '@market-mind/common';
import { Send } from 'lucide-react';
import { Button } from '../../elements/button';
import { ExplainModeToggle } from '../../elements/explainModeToggle';
import { Input } from '../../elements/input';

const suggestedQuestions = [
  "What does 'market cap' mean?",
  "Is it a good time to buy Apple stock?",
  "How do I build a balanced portfolio?"
];

interface ChatEmptyStateProps {
  firstName: string;
  input: string;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: (text?: string) => void;
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
    <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full px-6 py-8 animate-fade-in relative">
      <div className="text-center space-y-3 relative z-10 w-full mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          What can I help with, {firstName}?
        </h1>
        <p className="text-base text-muted-foreground">
          Ask about your portfolio, stock recommendations, or financial metrics.
        </p>
      </div>

      <div className="w-full bg-card/60 border border-border/40 p-4 rounded-[20px] shadow-lg relative z-10 flex flex-col gap-4">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask here"
            className="flex-1 bg-background/50 border-primary h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-primary shadow-inner"
            disabled={isPendingSend}
            autoFocus
          />
          <Button
            className="h-12 w-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0 shadow-lg shadow-primary/20 flex items-center justify-center p-0"
            onClick={() => onSend()}
            disabled={!input.trim() || isPendingSend}
          >
            <Send size={20} className="ml-[-2px]" />
          </Button>
        </div>
        <div className="flex justify-center">
          <ExplainModeToggle mode={explainMode} onChange={onExplainModeChange} />
        </div>
      </div>
    </div>
  );
};
