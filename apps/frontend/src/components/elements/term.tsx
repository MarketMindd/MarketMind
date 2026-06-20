import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/utils/tailwindUtils';

interface TermProps {
  /** The plain-English wording shown to the user */
  children: React.ReactNode;
  /** The actual market/finance term being translated */
  term: string;
  /** A short, friendly explanation */
  explanation: string;
  className?: string;
  /** Hide the little (?) icon */
  hideIcon?: boolean;
}

/**
 * Wraps beginner-friendly wording with a tooltip that reveals the real
 * finance term + a plain-English explanation. Helps users learn over time
 * without forcing jargon up front.
 */
export const Term = ({ children, term, explanation, className, hideIcon }: TermProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex items-baseline gap-0.5 underline decoration-dotted decoration-muted-foreground/50 underline-offset-2 cursor-help',
            className
          )}
        >
          {children}
          {!hideIcon && (
            <HelpCircle size={11} className="text-muted-foreground/60 self-center" />
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="font-semibold text-xs mb-1">{term}</p>
        <p className="text-xs text-muted-foreground">{explanation}</p>
      </TooltipContent>
    </Tooltip>
  );
};
