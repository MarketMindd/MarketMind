import { PortfolioItem } from '@market-mind/common';

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file into a list of PortfolioItems.
 * It uses case-insensitive fuzzy matching for column headers and filters out
 * any tickers that are not in the validSymbols list.
 */
export async function parsePortfolioFile(
  file: File,
  validSymbols: string[],
): Promise<PortfolioItem[]> {
  const arrayBuffer = await file.arrayBuffer();
  // Dynamically import xlsx to keep the main bundle size small
  const XLSX = await import('xlsx');

  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

  const parsedStocks: PortfolioItem[] = [];
  const validTickersSet = new Set(validSymbols);

  for (const row of jsonData) {
    const keys = Object.keys(row);

    const tickerKey = keys.find((k) =>
      ['ticker', 'symbol', 'stock'].includes(k.toLowerCase().trim()),
    );
    const sharesKey = keys.find((k) =>
      ['shares', 'quantity', 'qty', 'amount'].includes(k.toLowerCase().trim()),
    );
    const priceKey = keys.find((k) =>
      [
        'price',
        'avgprice',
        'averageprice',
        'avg price',
        'average price',
        'cost',
        'costbasis',
      ].includes(k.toLowerCase().replace(/[^a-z]/g, '')),
    );

    if (tickerKey && sharesKey && priceKey) {
      const ticker = String(row[tickerKey]).trim().toUpperCase();
      const shares = Number(row[sharesKey]);
      const avgPrice = Number(row[priceKey]);

      if (ticker && !isNaN(shares) && !isNaN(avgPrice) && validTickersSet.has(ticker)) {
        parsedStocks.push({ ticker, shares, avgPrice });
      }
    }
  }

  return parsedStocks;
}
