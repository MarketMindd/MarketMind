import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AiRecommendation } from '@market-mind/common';
import { RecommendationEntity } from '@market-mind/database';
import { Repository } from 'typeorm';
import { ProcessingService } from '../processing/processing.service';
import { parseRecommendationSimulationArgs } from './recommendation-simulator.parser';

export interface RecommendationSimulationResult {
  operation: 'inserted' | 'updated';
  recommendation: AiRecommendation;
}

interface RecommendationSimulationRunnerDeps {
  createApplicationContext?: () => Promise<INestApplicationContext>;
  log?: (message: string) => void;
}

const loadRecommendationRepo = (
  appContext: INestApplicationContext,
): Repository<RecommendationEntity> =>
  appContext.get<Repository<RecommendationEntity>>(getRepositoryToken(RecommendationEntity));

const validatePersistedRecommendation = (
  persistedRecommendation: RecommendationEntity | null,
  recommendation: AiRecommendation,
): void => {
  if (!persistedRecommendation) {
    throw new Error(
      `Recommendation for ${recommendation.symbol}/${recommendation.riskTolerance} was not persisted.`,
    );
  }

  if (
    persistedRecommendation.status !== recommendation.status ||
    Number(persistedRecommendation.confidenceScore) !== recommendation.confidence ||
    persistedRecommendation.rationale !== recommendation.rationale
  ) {
    throw new Error(
      `Recommendation for ${recommendation.symbol}/${recommendation.riskTolerance} was persisted with unexpected values.`,
    );
  }
};

export const runRecommendationSimulation = async (
  argv: string[],
  deps: RecommendationSimulationRunnerDeps = {},
): Promise<RecommendationSimulationResult> => {
  const recommendation = parseRecommendationSimulationArgs(argv);
  const createApplicationContext =
    deps.createApplicationContext ??
    (async () => {
      const { AppModule } = await import('../app/app.module');
      return NestFactory.createApplicationContext(AppModule);
    });
  const log = deps.log ?? console.log;

  log(`Submitting recommendation: ${JSON.stringify(recommendation)}`);

  let appContext: INestApplicationContext | null = null;

  try {
    appContext = await createApplicationContext();

    const processingService = appContext.get(ProcessingService);
    const recommendationRepo = loadRecommendationRepo(appContext);
    const lookup = {
      stockSymbol: recommendation.symbol,
      riskTolerance: recommendation.riskTolerance,
    };

    const existingRecommendation = await recommendationRepo.findOne({ where: lookup });
    const operation: RecommendationSimulationResult['operation'] = existingRecommendation
      ? 'updated'
      : 'inserted';

    await processingService.process([recommendation]);

    const persistedRecommendation = await recommendationRepo.findOne({ where: lookup });
    validatePersistedRecommendation(persistedRecommendation, recommendation);

    log(
      `Recommendation ${operation} for ${recommendation.symbol}/${recommendation.riskTolerance} with status ${recommendation.status}.`,
    );

    return {
      operation,
      recommendation,
    };
  } finally {
    if (appContext) {
      await appContext.close();
    }
  }
};
