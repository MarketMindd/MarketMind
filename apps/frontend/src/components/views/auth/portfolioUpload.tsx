import { Briefcase, ChevronDown, ChevronUp, FileSpreadsheet, Upload } from 'lucide-react';
import { PortfolioItem } from '@market-mind/common';
import { Button } from '@/components/ui/button';
import { PortfolioInput } from '@/components/views/portfolio/portfolioInput';

interface PortfolioUploadProps {
  showPortfolio: boolean;
  setShowPortfolio: (show: boolean) => void;
  portfolio: PortfolioItem[];
  setPortfolio: React.Dispatch<React.SetStateAction<PortfolioItem[]>>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export const PortfolioUpload = ({
  showPortfolio,
  setShowPortfolio,
  portfolio,
  setPortfolio,
  fileInputRef,
  handleFileUpload,
}: PortfolioUploadProps) => {
  return (
    <div className="animate-fade-in">
      <button
        type="button"
        onClick={() => setShowPortfolio(!showPortfolio)}
        className="w-full flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-primary" />
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Add Your Portfolio</p>
            <p className="text-xs text-muted-foreground">Optional - Add your existing holdings</p>
          </div>
        </div>
        {showPortfolio ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {showPortfolio && (
        <div className="mt-4 p-4 rounded-lg border border-border bg-card animate-fade-in space-y-4">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="portfolio-file"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileSpreadsheet size={16} />
              Import from Excel/CSV
              <Upload size={14} />
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-card text-muted-foreground">or add manually</span>
            </div>
          </div>
          <PortfolioInput portfolio={portfolio} onChange={setPortfolio} compact />
        </div>
      )}
    </div>
  );
};
