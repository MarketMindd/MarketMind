import { Send } from 'lucide-react';
import { Button } from '../../elements/button';
import { Input } from '../../elements/input';

const suggestedQuestions = [
  "What does 'market cap' mean?",
  "Is it a good time to buy Apple stock?",
  "How do I build a balanced portfolio?"
];

interface ChatEmptyStateProps {
  userName: string;
  input: string;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: (text?: string) => void;
  isPendingSend: boolean;
}

export const ChatEmptyState = ({
  userName,
  input,
  onInputChange,
  onKeyDown,
  onSend,
  isPendingSend,
}: ChatEmptyStateProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full px-6 py-8 animate-fade-in relative">
      <div className="text-center space-y-3 relative z-10 w-full mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          What can I help with, {userName}?
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
        
        <div className="pt-3 border-t border-border/30">
          <p className="text-xs text-muted-foreground mb-3 text-center sm:text-left">
            Not sure where to start? Try one of these:
          </p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {suggestedQuestions.map((question, i) => (
              <button
                key={i}
                onClick={() => onSend(question)}
                disabled={isPendingSend}
                className="text-sm px-3 py-2 rounded-lg bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
