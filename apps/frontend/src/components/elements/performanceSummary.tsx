import { Term } from './term';
import { Award, CheckCircle2 } from 'lucide-react';

export const PerformanceSummary = () => {
  // In a real application, this would be fetched from the backend.
  // For now, using the mock counts from the original UI since performance tracking isn't implemented.
  const successCount = 12;
  const totalCount = 15;
  const successRate = Math.round((successCount / totalCount) * 100);

  return (
    <div className="glass-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Award className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">How the AI is doing</h2>
        </div>
        {/* Link to performance removed as the page is disabled for now */}
      </div>

      <div className="flex-1 flex flex-col justify-center text-center py-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <span className="text-3xl font-bold text-foreground">
            {successCount}<span className="text-muted-foreground text-xl"> / {totalCount}</span>
          </span>
        </div>
        <p className="text-sm text-foreground mb-1">picks worked out</p>
        <div className="text-xs text-muted-foreground mt-1">
          That's a{' '}
          <Term
            term={`Success rate: ${successRate}%`}
            explanation="The share of past AI recommendations that ended up making money."
            hideIcon
            className="text-success font-medium no-underline"
          >
            {successRate}% hit rate
          </Term>
        </div>
      </div>
    </div>
  );
};
