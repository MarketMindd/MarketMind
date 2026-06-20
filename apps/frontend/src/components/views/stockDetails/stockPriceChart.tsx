import { LineChart } from 'lucide-react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import { Stock } from '@market-mind/common';

interface StockPriceChartProps {
  stock: Stock;
}

export const StockPriceChart = ({ stock }: StockPriceChartProps) => {
  return (
    <div className="glass-card p-6 mb-6 animate-fade-in stagger-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <LineChart className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Price over the last 30 days</h2>
          <p className="text-xs text-muted-foreground">
            Just for reference — short-term swings don't usually matter much.
          </p>
        </div>
      </div>
      <div style={{ height: '400px', width: '100%' }}>
        <AdvancedRealTimeChart
          symbol={stock.symbol}
          range="1M"
          interval="D"
          theme="dark"
          autosize
        />
      </div>
    </div>
  );
};
