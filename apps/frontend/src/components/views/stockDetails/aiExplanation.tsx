import { Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Stock } from '@market-mind/common';
import { Button } from '@/components/elements/button';
import { buildAskAiHref } from '@/consts/routes';

interface AiExplanationProps {
  stock: Stock;
}

export const AiExplanation = ({ stock }: AiExplanationProps) => {
  const navigate = useNavigate();

  return (
    <div className="glass-card p-6 mb-6 animate-fade-in stagger-2 border-l-4 border-l-primary">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Why the AI thinks this</h2>
        </div>
        <Button
          size="sm"
          className="flex items-center gap-2"
          onClick={() =>
            navigate(
              buildAskAiHref({
                symbol: stock.symbol,
                prompt: `Give me your analysis of ${stock.symbol}.`,
              }),
            )
          }
        >
          <Brain size={16} />
          Ask AI Assistant
        </Button>
      </div>
      {stock.aiRecommendation.aiSummary && (
        <p className="text-foreground/90 leading-relaxed mb-3">
          {stock.aiRecommendation.aiSummary}
        </p>
      )}
      <p className="text-muted-foreground text-sm leading-relaxed">
        {stock.aiRecommendation.rationale ||
          'This stock has not been analyzed yet. Add it to your portfolio to receive AI recommendations.'}
      </p>
    </div>
  );
};
