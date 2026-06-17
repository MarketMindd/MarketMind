/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { z } from 'zod';
import { CreateChatSessionPayload, RiskTolerance, SendMessagePayload } from '@market-mind/common';
import {
  ChatMessageEntity,
  ChatSessionEntity,
  MarketDataEntity,
  RecommendationEntity,
  StockEntity,
  UserProfileEntity,
} from '@market-mind/database';
import { LLM_CLIENT, type LlmClient } from '../ai/llm-client.interface';
import { PromptBuilderService } from '../ai/prompt-builder.service';
import { NewsApiService } from '../news/news-api.service';
import { PortfolioService } from '../portfolio/portfolio.service';

const chatResponseSchema = z.object({
  reply: z.string().describe('The conversational response from the AI assistant.'),
  title: z
    .string()
    .optional()
    .describe(
      'A suitable, short title (2-4 words) for this chat session based on the first user message. Only generate this if requested in the instructions.',
    ),
});

const DEFAULT_SESSION_TITLE = 'New Chat';
const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const validateSessionId = (id: string) => {
  if (!id || !UUID_REGEX.test(id)) {
    throw new NotFoundException('Session not found');
  }
};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatSessionEntity)
    private readonly sessionRepo: Repository<ChatSessionEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepo: Repository<ChatMessageEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly userRepo: Repository<UserProfileEntity>,
    @InjectRepository(StockEntity)
    private readonly stockRepo: Repository<StockEntity>,
    @InjectRepository(MarketDataEntity)
    private readonly marketDataRepo: Repository<MarketDataEntity>,
    @InjectRepository(RecommendationEntity)
    private readonly recommendationRepo: Repository<RecommendationEntity>,
    private readonly portfolioService: PortfolioService,
    private readonly promptBuilder: PromptBuilderService,
    @Inject(LLM_CLIENT) private readonly llmClient: LlmClient,
    private readonly newsApiService: NewsApiService,
  ) {}

  async getSessions(userId: string): Promise<ChatSessionEntity[]> {
    return this.sessionRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async createSession(
    userId: string,
    payload: CreateChatSessionPayload,
  ): Promise<ChatSessionEntity> {
    let title = payload.title || DEFAULT_SESSION_TITLE;
    if (payload.symbol) {
      title = `${payload.symbol.toUpperCase()} Discussion`;
    }
    const session = this.sessionRepo.create({ userId, title });
    return this.sessionRepo.save(session);
  }

  async deleteSession(userId: string, sessionId: string): Promise<{ success: boolean }> {
    validateSessionId(sessionId);
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException('You do not own this session');

    await this.sessionRepo.remove(session);
    return { success: true };
  }

  async getMessages(userId: string, sessionId: string): Promise<ChatMessageEntity[]> {
    validateSessionId(sessionId);
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException('You do not own this session');

    return this.messageRepo.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });
  }

  async sendMessage(
    userId: string,
    sessionId: string,
    payload: SendMessagePayload,
  ): Promise<ChatMessageEntity> {
    validateSessionId(sessionId);
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException('You do not own this session');

    const userMessage = this.messageRepo.create({
      sessionId,
      role: 'user',
      content: payload.content,
    });
    await this.messageRepo.save(userMessage);

    const history = (
      await this.messageRepo.find({
        where: { sessionId },
        order: { createdAt: 'DESC' },
        take: 10,
      })
    ).reverse();

    const user = await this.userRepo.findOneOrFail({ where: { id: userId } });
    const portfolio = await this.portfolioService.getPortfolio(userId);

    const allStocks = await this.stockRepo.find({ select: ['symbol', 'name', 'sector'] });
    const stockMap = new Map(allStocks.map((s) => [s.symbol, s]));
    const knownSymbols = new Set(allStocks.map((s) => s.symbol));

    const stockSymbol = this.resolveStockSymbol(session.title, payload.content, knownSymbols);

    let stockContext: any = undefined;
    if (stockSymbol) {
      try {
        stockContext = await this.buildStockContext(stockSymbol, user.riskTolerance);
      } catch (err) {
        this.logger.warn(`Failed to resolve stock context for ${stockSymbol}: ${err}`);
      }
    }

    const rankedRecommendations = await this.buildRankedRecommendations(
      user.riskTolerance,
      stockMap,
    );

    const shouldGenerateTitle = history.length === 1 && session.title === DEFAULT_SESSION_TITLE;

    const prompt = this.promptBuilder.buildChatPrompt(
      { riskTolerance: user.riskTolerance, interests: user.interests ?? [] },
      portfolio,
      history,
      payload.content,
      stockContext,
      shouldGenerateTitle,
      rankedRecommendations,
      payload.explainMode,
    );

    const customJsonSchema = z.toJSONSchema(chatResponseSchema);

    let rawResultText: string;
    try {
      rawResultText = await this.llmClient.generateContent(prompt, customJsonSchema);
    } catch (err) {
      this.logger.error(`Gemini AI generation failed: ${err}`);
      await this.messageRepo.remove(userMessage);
      const errStr = String(err);
      if (
        errStr.includes('429') ||
        errStr.includes('RESOURCE_EXHAUSTED') ||
        errStr.includes('Too Many Requests')
      ) {
        throw new HttpException(
          'MarketMind AI is temporarily busy. Please try again in a moment.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw new InternalServerErrorException('Failed to generate AI response. Please try again.');
    }

    const parsedResult = this.parseAiResponse(rawResultText);

    const modelMessage = this.messageRepo.create({
      sessionId,
      role: 'model',
      content: parsedResult.reply || 'No response formulated.',
    });
    await this.messageRepo.save(modelMessage);

    if (shouldGenerateTitle && parsedResult.title) {
      session.title = parsedResult.title.trim();
    }

    session.updatedAt = new Date();
    await this.sessionRepo.save(session);

    return modelMessage;
  }

  private resolveStockSymbol(
    sessionTitle: string,
    messageContent: string,
    knownSymbols: Set<string>,
  ): string | undefined {
    const candidates = new Set<string>();

    const tickerMatch = sessionTitle.match(/^([A-Z0-9]+)\sDiscussion/);
    if (tickerMatch) {
      candidates.add(tickerMatch[1]);
    }

    const words = messageContent.toUpperCase().match(/\b[A-Z]{1,10}\b/g) || [];
    for (const word of words) {
      if (knownSymbols.has(word)) {
        candidates.add(word);
      }
    }

    return candidates.size > 0 ? [...candidates][0] : undefined;
  }

  private async buildStockContext(
    stockSymbol: string,
    riskTolerance: RiskTolerance,
  ): Promise<any> {
    const stock = await this.stockRepo.findOne({ where: { symbol: stockSymbol } });
    if (!stock) return undefined;

    const [marketData, recommendation, rawNews] = await Promise.all([
      this.marketDataRepo.findOne({ where: { stockSymbol }, order: { time: 'DESC' } }),
      this.recommendationRepo.findOne({
        where: { stockSymbol, riskTolerance },
        order: { updatedAt: 'DESC' },
      }),
      this.newsApiService.getNews(stockSymbol).catch(() => []),
    ]);

    return {
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      price: marketData ? Number(marketData.price) : 0,
      priceChange: marketData ? Number(marketData.priceChange) : 0,
      recommendationStatus: recommendation?.status,
      recommendationRationale: recommendation?.rationale,
      news: rawNews
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
        .slice(0, 3)
        .map((n) => ({
          title: n.title,
          source: n.source,
          description: n.description ?? undefined,
        })),
    };
  }

  private async buildRankedRecommendations(
    riskTolerance: RiskTolerance,
    stockMap: Map<string, StockEntity>,
  ) {
    const recommendations = await this.recommendationRepo.find({
      where: { riskTolerance },
      order: { confidenceScore: 'DESC' },
      take: 10,
    });

    return recommendations.map((rec) => {
      const stock = stockMap.get(rec.stockSymbol);
      return {
        symbol: rec.stockSymbol,
        name: stock?.name ?? rec.stockSymbol,
        sector: stock?.sector ?? 'Unknown',
        status: rec.status as string,
        confidence: Number(rec.confidenceScore),
      };
    });
  }

  private parseAiResponse(rawText: string): { reply: string; title?: string } {
    try {
      let text = rawText.trim();
      const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)```$/);
      if (fenceMatch) {
        text = fenceMatch[1].trim();
      }
      return JSON.parse(text);
    } catch (err) {
      this.logger.error(`Failed to parse AI response: ${rawText}. Error: ${err}`);
      return {
        reply: 'I apologize, but I encountered an error processing that request. Please try again.',
      };
    }
  }
}