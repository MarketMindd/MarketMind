import { getRepositoryToken } from '@nestjs/typeorm';
import { RiskTolerance } from '@market-mind/common';
import { RecommendationEntity } from '@market-mind/database';
import { ProcessingService } from '../processing/processing.service';
import { runRecommendationSimulation } from './recommendation-simulator.runner';

describe('runRecommendationSimulation', () => {
  it('passes the parsed recommendation through correctly and closes the Nest context', async () => {
    const processMock = jest.fn().mockResolvedValue(undefined);
    const closeMock = jest.fn().mockResolvedValue(undefined);
    const repoFindOne = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        stockSymbol: 'AAPL',
        riskTolerance: RiskTolerance.MEDIUM,
        status: 'Hold',
        confidenceScore: 0.82,
        rationale: 'Manual test',
      });
    const appContext = {
      get: jest.fn((token: unknown) => {
        if (token === ProcessingService) {
          return { process: processMock };
        }

        if (token === getRepositoryToken(RecommendationEntity)) {
          return { findOne: repoFindOne };
        }

        throw new Error(`Unexpected token: ${String(token)}`);
      }),
      close: closeMock,
    };

    const result = await runRecommendationSimulation(
      [
        '--symbol',
        'AAPL',
        '--riskTolerance',
        RiskTolerance.MEDIUM,
        '--status',
        'Hold',
        '--confidence',
        '0.82',
        '--rationale',
        'Manual test',
      ],
      {
        createApplicationContext: async () => appContext as never,
        log: jest.fn(),
      },
    );

    expect(processMock).toHaveBeenCalledWith([
      expect.objectContaining({
        symbol: 'AAPL',
        riskTolerance: RiskTolerance.MEDIUM,
        status: 'Hold',
        confidence: 0.82,
        rationale: 'Manual test',
      }),
    ]);
    expect(closeMock).toHaveBeenCalledTimes(1);
    expect(result.operation).toBe('inserted');
  });
});
