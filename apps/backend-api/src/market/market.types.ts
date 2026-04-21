export interface MarketSnapshot {
  symbol: string;
  price: number;
  priceChange: number;
  volume: number;
  fetchedAt: Date;
}
