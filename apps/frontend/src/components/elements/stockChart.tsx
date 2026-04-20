import type { ChartDataPoint } from '@/types/stockChart';
import { Stock } from '@market-mind/common';
import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface StockChartProps {
  stock: Stock;
}

const StockChart = ({ stock }: StockChartProps) => {
  const chartData = useMemo(() => {
    const basePrice = stock.price;
    const volatility =
      stock.recommendation === 'exit'
        ? 0.03
        : stock.recommendation === 'hold'
          ? 0.02
          : 0.015;

    const days = 30;
    let currentPrice = basePrice * (1 - (stock.changePercent / 100) * 5); // Start lower if positive trend

    const data = Array.from({ length: days }).reduce<ChartDataPoint[]>(
      (acc, _, i) => {
        const change = (Math.random() - 0.45) * volatility * currentPrice;
        currentPrice = Math.max(currentPrice + change, currentPrice * 0.9);

        const trendFactor = i / days;
        currentPrice =
          currentPrice * (1 - trendFactor * 0.1) +
          basePrice * (trendFactor * 0.1);

        const date = new Date();
        date.setDate(date.getDate() - (days - i));

        acc.push({
          date: date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          price: Number(currentPrice.toFixed(2)),
          fullDate: date.toLocaleDateString(),
        });
        return acc;
      },
      [],
    );

    data[data.length - 1].price = stock.price;

    return data;
  }, [stock]);

  const minPrice = Math.min(...chartData.map((d) => d.price)) * 0.98;
  const maxPrice = Math.max(...chartData.map((d) => d.price)) * 1.02;

  const isPositive = stock.change >= 0;
  const strokeColor = isPositive
    ? 'hsl(var(--success))'
    : 'hsl(var(--destructive))';

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id={`gradient-${stock.id}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickMargin={8}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={2}
            fill={`url(#gradient-${stock.id})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
