import { Link } from 'react-router-dom';
import { Award, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Term } from '../../elements/term';
import { APP_ROUTES } from '@/consts/routes';

interface PerformanceSummaryProps {
  successCount: number;
  directionalCount: number;
  successRate: number;
}

export const PerformanceSummary = ({
  successCount,
  directionalCount,
  successRate,
}: PerformanceSummaryProps) => {
  return (
    <div className="glass-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Award className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">How the AI is doing</h2>
        </div>
        <Link
          to={APP_ROUTES.PERFORMANCE}
          className="flex items-center gap-0.5 text-xs text-primary hover:underline"
        >
          See all
          <ChevronRight size={14} />
        </Link>
      </div>

      {directionalCount === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-2">
          <Award className="w-5 h-5 text-muted-foreground mb-2" />
          <p className="text-sm text-foreground mb-1">No graded picks yet</p>
          <p className="text-xs text-muted-foreground">
            Check back once recommendations have had time to play out.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center text-center py-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-3xl font-bold text-foreground">
              {successCount}
              <span className="text-muted-foreground text-xl"> / {directionalCount}</span>
            </span>
          </div>
          <p className="text-sm text-foreground mb-1">picks worked out</p>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            That's a{' '}
            <Term
              term={`Success rate: ${Number(successRate.toFixed(1))}%`}
              explanation="The share of past AI recommendations that ended up making money."
              hideIcon
              className="text-success font-medium no-underline"
            >
              {Number(successRate.toFixed(1))}% hit rate
            </Term>
          </p>
        </div>
      )}
    </div>
  );
};
