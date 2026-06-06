import { RiskTolerance } from '@market-mind/common';
import { parseRecommendationSimulationArgs } from './recommendation-simulator.parser';

describe('parseRecommendationSimulationArgs', () => {
  it('accepts valid enum values and confidence range', () => {
    const result = parseRecommendationSimulationArgs([
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
      '--generatedAt',
      '2026-05-23T10:15:00.000Z',
    ]);

    expect(result).toEqual({
      symbol: 'AAPL',
      riskTolerance: RiskTolerance.MEDIUM,
      status: 'Hold',
      confidence: 0.82,
      rationale: 'Manual test',
      generatedAt: new Date('2026-05-23T10:15:00.000Z'),
    });
  });

  it('rejects invalid riskTolerance', () => {
    expect(() =>
      parseRecommendationSimulationArgs([
        '--symbol',
        'AAPL',
        '--riskTolerance',
        'Aggressive',
        '--status',
        'Hold',
        '--confidence',
        '0.82',
        '--rationale',
        'Manual test',
      ]),
    ).toThrow(/riskTolerance/i);
  });

  it('rejects invalid status', () => {
    expect(() =>
      parseRecommendationSimulationArgs([
        '--symbol',
        'AAPL',
        '--riskTolerance',
        RiskTolerance.MEDIUM,
        '--status',
        'Buy',
        '--confidence',
        '0.82',
        '--rationale',
        'Manual test',
      ]),
    ).toThrow(/status/i);
  });

  it('rejects missing required flags', () => {
    expect(() =>
      parseRecommendationSimulationArgs([
        '--symbol',
        'AAPL',
        '--riskTolerance',
        RiskTolerance.MEDIUM,
        '--status',
        'Hold',
      ]),
    ).toThrow(/confidence|rationale/i);
  });

  it('rejects confidence outside 0..1', () => {
    expect(() =>
      parseRecommendationSimulationArgs([
        '--symbol',
        'AAPL',
        '--riskTolerance',
        RiskTolerance.MEDIUM,
        '--status',
        'Hold',
        '--confidence',
        '1.2',
        '--rationale',
        'Manual test',
      ]),
    ).toThrow(/confidence/i);
  });
});
