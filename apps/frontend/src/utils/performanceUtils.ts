import {
  DIRECTIONAL_NOISE_THRESHOLD_PCT,
  HOLD_STABILITY_THRESHOLD_PCT,
  StockRecommendation,
} from '@market-mind/common';

export const getOutcomeExplanation = (status: StockRecommendation): string => {
  if (status === StockRecommendation.HOLD) {
    return `This is a Hold call, so it's graded a Success if the price stayed within ${HOLD_STABILITY_THRESHOLD_PCT}% and a Miss if it moved beyond that in either direction.`;
  }
  const direction = status === StockRecommendation.INVEST ? 'rose' : 'fell';
  const opposite = status === StockRecommendation.INVEST ? 'fell' : 'rose';
  return `This is an ${status} call, so it's graded a Success if the price ${direction} by more than ${DIRECTIONAL_NOISE_THRESHOLD_PCT}% and a Miss if it ${opposite} by more than ${DIRECTIONAL_NOISE_THRESHOLD_PCT}% instead.`;
};
