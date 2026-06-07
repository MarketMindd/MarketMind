/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { z } from 'zod';
import { CreateChatSessionPayload, SendMessagePayload } from '@market-mind/common';
import {
  ChatMessageEntity,
  ChatSessionEntity,
  MarketDataEntity,
  RecommendationEntity,
  StockEntity,
  UserProfileEntity,
} from '@market-mind/database';
import { GeminiClientService } from '../ai/gemini-client.service';
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

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
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
    private readonly geminiClient: GeminiClientService,
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
    let title = payload.title || 'New Chat';
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

    // 1. Save user message
    const userMessage = this.messageRepo.create({
      sessionId,
      role: 'user',
      content: payload.content,
    });
    await this.messageRepo.save(userMessage);

    // 2. Fetch last 10 messages in chronological order for AI context
    const history = (
      await this.messageRepo.find({
        where: { sessionId },
        order: { createdAt: 'DESC' },
        take: 10,
      })
    ).reverse();

    // 3. Load user profile and portfolio context
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const portfolio = await this.portfolioService.getPortfolio(userId);

    // 4. Resolve stock context from session title AND user message
    let stockContext: any = undefined;

    // Collect candidate symbols: from session title pattern + from message text
    const candidateSymbols = new Set<string>();
    const tickerMatch = session.title.match(/^([A-Z0-9]+)\sDiscussion/);
    if (tickerMatch) {
      candidateSymbols.add(tickerMatch[1]);
    }

    // Look up all known stock symbols and match against the user's message
    const allStocks = await this.stockRepo.find({ select: ['symbol', 'name', 'sector'] });
    const knownSymbols = new Set(allStocks.map((s) => s.symbol));
    const stockMap = new Map(allStocks.map((s) => [s.symbol, s]));
    const messageWords = payload.content.toUpperCase().match(/\b[A-Z]{1,10}\b/g) || [];
    for (const word of messageWords) {
      if (knownSymbols.has(word)) {
        candidateSymbols.add(word);
      }
    }

    // Use the first matched symbol as stock context
    const stockSymbol = candidateSymbols.size > 0 ? [...candidateSymbols][0] : undefined;

    if (stockSymbol) {
      try {
        const stock = await this.stockRepo.findOne({ where: { symbol: stockSymbol } });
        if (stock) {
          const marketData = await this.marketDataRepo.findOne({
            where: { stockSymbol },
            order: { time: 'DESC' },
          });

          const recommendation = await this.recommendationRepo.findOne({
            where: { stockSymbol, riskTolerance: user.riskTolerance },
            order: { updatedAt: 'DESC' },
          });

          const rawNews = await this.newsApiService.getNews(stockSymbol).catch(() => []);

          stockContext = {
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
      } catch (err) {
        this.logger.warn(`Failed to resolve stock context for ${stockSymbol}: ${err}`);
      }
    }

    // 4b. Load market-wide recommendations so the assistant can answer
    // "what are your best stocks to invest in?" style questions from real DB data.
    const marketRecommendations = await this.recommendationRepo.find({
      where: { riskTolerance: user.riskTolerance },
      order: { confidenceScore: 'DESC' },
      take: 20,
    });
    const rankedRecommendations = marketRecommendations.map((rec) => {
      const stock = stockMap.get(rec.stockSymbol);
      return {
        symbol: rec.stockSymbol,
        name: stock?.name ?? rec.stockSymbol,
        sector: stock?.sector ?? 'Unknown',
        status: rec.status as string,
        confidence: Number(rec.confidenceScore),
        summary: rec.aiSummary ?? undefined,
      };
    });

    // 5. Generate content with Gemini using custom chat JSON schema
    const shouldGenerateTitle = history.length === 1 && session.title === 'New Chat';

    const prompt = this.promptBuilder.buildChatPrompt(
      {
        riskTolerance: user.riskTolerance,
        interests: user.interests ?? [],
      },
      portfolio,
      history,
      payload.content,
      stockContext,
      shouldGenerateTitle,
      rankedRecommendations,
    );

    const customJsonSchema = z.toJSONSchema(chatResponseSchema);
    let rawResultText: string;
    try {
      rawResultText = await this.geminiClient.generateContent(prompt, customJsonSchema);
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

    let parsedResult: any;
    try {
      // Strip markdown code fences if Gemini returned it wrapped
      let text = rawResultText.trim();
      const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)```$/);
      if (fenceMatch) {
        text = fenceMatch[1].trim();
      }
      parsedResult = JSON.parse(text);
    } catch (err) {
      this.logger.error(`Failed to parse AI response: ${rawResultText}. Error: ${err}`);
      parsedResult = {
        reply: 'I apologize, but I encountered an error processing that request. Please try again.',
      };
    }

    // 6. Save model reply
    const modelMessage = this.messageRepo.create({
      sessionId,
      role: 'model',
      content: parsedResult.reply || 'No response formulated.',
    });
    await this.messageRepo.save(modelMessage);

    // Update session title if generated
    if (shouldGenerateTitle && parsedResult.title) {
      session.title = parsedResult.title.trim();
    }

    // Update session timestamp
    session.updatedAt = new Date();
    await this.sessionRepo.save(session);

    return modelMessage;
  }
}
