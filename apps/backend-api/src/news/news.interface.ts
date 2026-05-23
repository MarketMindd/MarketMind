import { NewsArticle } from '../filter/filter.types';

export interface NewsProviderService {
  getNews(symbol: string): Promise<NewsArticle[]>;
}
