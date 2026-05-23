import { NewsArticle } from '../filter/filter.types';

export interface NewsProviderService {
  readonly name: string;
  getNews(symbol: string): Promise<NewsArticle[]>;
}
