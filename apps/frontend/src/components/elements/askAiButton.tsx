import { Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/elements/button';
import { buildAskAiHref } from '@/consts/routes';
import { cn } from '@/utils/tailwindUtils';

interface AskAiButtonProps {
  symbol?: string;
  prompt?: string;
  label?: string;
  className?: string;
}

export const AskAiButton = ({ symbol, prompt, label = 'Ask AI', className }: AskAiButtonProps) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(buildAskAiHref({ symbol, prompt }));
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn('flex items-center gap-1.5 text-primary', className)}
    >
      <Brain size={14} />
      {label}
    </Button>
  );
};
