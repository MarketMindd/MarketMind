import { PortfolioEntity, PortfolioHoldingEntity } from '@market-mind/database';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { CurrentUserService } from './current-user.service';
import { HARDCODED_USER_ID } from './portfolios.constants';
import { PortfoliosController } from './portfolios.controller';
import { PortfoliosService } from './portfolios.service';

type PortfolioRepoMock = {
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
};

type HoldingRepoMock = {
  create: jest.Mock;
  save: jest.Mock;
  delete: jest.Mock;
};

const PORTFOLIO_ID = 'a1111111-1111-1111-1111-111111111111';
const HOLDING_IDS = [
  'b1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'b3333333-3333-3333-3333-333333333333',
];

const createRepositoryMocks = (): {
  portfolioRepo: PortfolioRepoMock;
  holdingRepo: HoldingRepoMock;
} => {
  let nextHoldingId = 0;
  let portfolio: PortfolioEntity | null = null;
  let holdings: PortfolioHoldingEntity[] = [];

  const refreshPortfolio = (): void => {
    if (!portfolio) {
      return;
    }

    portfolio = {
      ...portfolio,
      holdings: [...holdings],
      updatedAt: new Date(),
    };
  };

  const portfolioRepo: PortfolioRepoMock = {
    findOne: jest.fn(async ({ where }: { where: { userId: string } }) => {
      if (!portfolio || portfolio.userId !== where.userId) {
        return null;
      }

      refreshPortfolio();
      return portfolio;
    }),
    create: jest.fn((data: Partial<PortfolioEntity>) => ({
      id: PORTFOLIO_ID,
      userId: data.userId ?? HARDCODED_USER_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
      holdings: [],
    })),
    save: jest.fn(async (entity: PortfolioEntity) => {
      portfolio = {
        ...entity,
        id: entity.id ?? PORTFOLIO_ID,
        createdAt: entity.createdAt ?? new Date(),
        updatedAt: new Date(),
        holdings,
      };
      return portfolio;
    }),
  };

  const holdingRepo: HoldingRepoMock = {
    create: jest.fn((data: Partial<PortfolioHoldingEntity>) => ({
      id:
        HOLDING_IDS[nextHoldingId++] ??
        'b4444444-4444-4444-4444-444444444444',
      portfolioId: data.portfolioId ?? PORTFOLIO_ID,
      symbol: data.symbol ?? 'AAPL',
      companyName: data.companyName ?? 'Apple Inc.',
      shares: String(data.shares ?? '1.000000'),
      avgCost: String(data.avgCost ?? '100.000000'),
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    save: jest.fn(async (entity: PortfolioHoldingEntity) => {
      const index = holdings.findIndex((item) => item.id === entity.id);
      const nextEntity: PortfolioHoldingEntity = {
        ...entity,
        updatedAt: new Date(),
      };

      if (index === -1) {
        holdings.push(nextEntity);
      } else {
        holdings[index] = nextEntity;
      }

      refreshPortfolio();
      return nextEntity;
    }),
    delete: jest.fn(async ({ id, portfolioId }: { id: string; portfolioId: string }) => {
      const startLength = holdings.length;
      holdings = holdings.filter(
        (holding) => !(holding.id === id && holding.portfolioId === portfolioId),
      );
      refreshPortfolio();
      return { affected: startLength - holdings.length };
    }),
  };

  return { portfolioRepo, holdingRepo };
};

describe('PortfoliosController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const { portfolioRepo, holdingRepo } = createRepositoryMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [PortfoliosController],
      providers: [
        PortfoliosService,
        CurrentUserService,
        {
          provide: getRepositoryToken(PortfolioEntity),
          useValue: portfolioRepo,
        },
        {
          provide: getRepositoryToken(PortfolioHoldingEntity),
          useValue: holdingRepo,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates and returns a portfolio on GET /api/portfolios/me', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/portfolios/me')
      .expect(200);

    expect(response.body.userId).toBe(HARDCODED_USER_ID);
    expect(response.body.holdings).toEqual([]);
  });

  it('adds and merges duplicate symbols with weighted average on POST', async () => {
    await request(app.getHttpServer()).post('/api/portfolios/me/holdings').send({
      symbol: 'AAPL',
      companyName: 'Apple Inc.',
      shares: 10,
      avgPrice: 100,
    });

    const response = await request(app.getHttpServer())
      .post('/api/portfolios/me/holdings')
      .send({
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        shares: 5,
        avgPrice: 130,
      })
      .expect(201);

    expect(response.body.holdings).toHaveLength(1);
    expect(response.body.holdings[0].symbol).toBe('AAPL');
    expect(response.body.holdings[0].shares).toBe(15);
    expect(response.body.holdings[0].avgCost).toBeCloseTo(110, 8);
    expect(response.body.holdings[0].current).toBe(193.2);
    expect(response.body.holdings[0].gainLoss).toBeCloseTo(1248, 8);
  });

  it('updates an existing holding on PATCH', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/portfolios/me/holdings')
      .send({
        symbol: 'MSFT',
        companyName: 'Microsoft Corp.',
        shares: 4,
        avgPrice: 300,
      })
      .expect(201);

    const holdingId = createResponse.body.holdings[0].id;
    const patchResponse = await request(app.getHttpServer())
      .patch(`/api/portfolios/me/holdings/${holdingId}`)
      .send({
        companyName: 'Microsoft',
        shares: 6,
        avgPrice: 290,
      })
      .expect(200);

    expect(patchResponse.body.holdings[0].companyName).toBe('Microsoft');
    expect(patchResponse.body.holdings[0].shares).toBe(6);
    expect(patchResponse.body.holdings[0].avgCost).toBe(290);
  });

  it('deletes a holding on DELETE', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/portfolios/me/holdings')
      .send({
        symbol: 'NVDA',
        companyName: 'NVIDIA',
        shares: 2,
        avgPrice: 120,
      })
      .expect(201);

    const holdingId = createResponse.body.holdings[0].id;
    await request(app.getHttpServer())
      .delete(`/api/portfolios/me/holdings/${holdingId}`)
      .expect(204);

    const getResponse = await request(app.getHttpServer())
      .get('/api/portfolios/me')
      .expect(200);
    expect(getResponse.body.holdings).toHaveLength(0);
  });

  it('validates payload on POST', async () => {
    await request(app.getHttpServer())
      .post('/api/portfolios/me/holdings')
      .send({
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        shares: 0,
        avgPrice: 190,
        extra: 'not-allowed',
      })
      .expect(400);
  });
});
