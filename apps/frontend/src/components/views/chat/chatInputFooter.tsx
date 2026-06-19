import { Send } from 'lucide-react';
import type { ExplainMode } from '@market-mind/common';
import { ExplainModeToggle } from '../../elements/explainModeToggle';
import { Button } from '../../elements/button';
import { Input } from '../../elements/input';

interface ChatInputFooterProps {
  input: string;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  isPendingSend: boolean;
  explainMode: ExplainMode;
  onExplainModeChange: (mode: ExplainMode) => void;
}

export const ChatInputFooter = ({
  input,
  onInputChange,
  onKeyDown,
  onSend,
  isPendingSend,
  explainMode,
  onExplainModeChange,
}: ChatInputFooterProps) => {
  return (
    <div className="p-4 border-t border-border/40 bg-background flex-shrink-0">
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex justify-end mb-2">
          <ExplainModeToggle mode={explainMode} onChange={onExplainModeChange} />
        </div>
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Continue here - Ask in plain English"
            className="flex-1"
            disabled={isPendingSend}
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
        <p className="text-[10px] text-muted-foreground text-center mt-3 select-none">
          AI responses are grounded exclusively in system database records. Unsupported queries will
          be clarified.
        </p>
      </div>
    </div>
  );
};
