export const calculatePriceChange = (currentPrice: number, percentChange: number) => {
  const decimalChange = percentChange / 100;
  const originalPrice = currentPrice / (1 + decimalChange);
  const dollarChange = currentPrice - originalPrice;

  return Number(dollarChange.toFixed(2));
};