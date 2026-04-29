export const calculatePriceChange = (currentPrice: number, percentChange: number) => {
  const decimalChange = percentChange / 100;
  const originalPrice = currentPrice / (1 + decimalChange);
  const priceChange = currentPrice - originalPrice;

  return Number(priceChange.toFixed(2));
};
