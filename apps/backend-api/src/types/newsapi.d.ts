declare module 'newsapi' {
  interface NewsArticleRaw {
    source: { id: string | null; name: string };
    title: string;
    description: string | null;
    publishedAt: string;
  }

  interface EverythingResponse {
    status: string;
    articles: NewsArticleRaw[];
  }

  interface EverythingParams {
    q?: string;
    pageSize?: number;
    sortBy?: string;
    language?: string;
  }

  class NewsAPI {
    constructor(apiKey: string);
    v2: {
      everything(params: EverythingParams): Promise<EverythingResponse>;
    };
  }

  export = NewsAPI;
}
