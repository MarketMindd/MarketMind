import { NewsArticle } from '../filter/filter.types';

export interface INetworkProvider<TRaw = any> {
  getData(...args: any[]): Promise<NewsArticle[]>;
}
