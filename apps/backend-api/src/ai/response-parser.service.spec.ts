import { Test, TestingModule } from '@nestjs/testing';
import { RiskTolerance, StockRecommendation } from '@market-mind/common';
import { ResponseParserService } from './response-parser.service';

describe('ResponseParserService', () => {
  let service: ResponseParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseParserService],
    }).compile();

    service = module.get<ResponseParserService>(ResponseParserService);
  });

  const validPayload = {
    status: StockRecommendation.INVEST,
    confidence: 0.8,
    rationale: 'Strong momentum',
    aiSummary: 'Invest with confidence on improving momentum.',
    shortTermOutlook: 'Near-term catalysts support upside over the next quarter.',
    longTermOutlook: 'Long-term growth remains attractive over the next one to two years.',
  };
  const validJson = JSON.stringify(validPayload);

  it('parses valid JSON successfully', () => {
    const result = service.parse(validJson, 'AAPL', RiskTolerance.MEDIUM);
    expect(result.status).toBe(StockRecommendation.INVEST);
    expect(result.confidence).toBe(0.8);
    expect(result.rationale).toBe('Strong momentum');
    expect(result.aiSummary).toBe('Invest with confidence on improving momentum.');
    expect(result.shortTermOutlook).toBe(
      'Near-term catalysts support upside over the next quarter.',
    );
    expect(result.longTermOutlook).toBe(
      'Long-term growth remains attractive over the next one to two years.',
    );
    expect(result.symbol).toBe('AAPL');
    expect(result.riskTolerance).toBe(RiskTolerance.MEDIUM);
    expect(result.generatedAt).toBeInstanceOf(Date);
  });

  it('strips plain fenced JSON blocks', () => {
    const fenced = '```\n' + validJson + '\n```';
    const result = service.parse(fenced, 'AAPL', RiskTolerance.HIGH);
    expect(result.status).toBe(StockRecommendation.INVEST);
  });

  it('strips json-tagged fenced JSON blocks', () => {
    const fenced = '```json\n' + validJson + '\n```';
    const result = service.parse(fenced, 'TSLA', RiskTolerance.LOW);
    expect(result.status).toBe(StockRecommendation.INVEST);
  });

  it('throws on malformed JSON', () => {
    expect(() => service.parse('not json', 'AAPL', RiskTolerance.LOW)).toThrow(/invalid JSON/);
  });

  it('throws when status is not a valid enum value', () => {
    const bad = JSON.stringify({ status: 'UNKNOWN', confidence: 0.5, rationale: 'test' });
    expect(() => service.parse(bad, 'AAPL', RiskTolerance.MEDIUM)).toThrow(/schema validation/);
  });

  it('throws when confidence is above 1', () => {
    const bad = JSON.stringify({ status: 'Hold', confidence: 1.5, rationale: 'test' });
    expect(() => service.parse(bad, 'AAPL', RiskTolerance.MEDIUM)).toThrow(/schema validation/);
  });

  it('throws when confidence is below 0', () => {
    const bad = JSON.stringify({ status: 'Exit', confidence: -0.1, rationale: 'test' });
    expect(() => service.parse(bad, 'AAPL', RiskTolerance.HIGH)).toThrow(/schema validation/);
  });

  it('throws when rationale is empty', () => {
    const bad = JSON.stringify({ status: 'Hold', confidence: 0.5, rationale: '' });
    expect(() => service.parse(bad, 'AAPL', RiskTolerance.MEDIUM)).toThrow(/schema validation/);
  });

  it('accepts responses that omit optional outlook fields', () => {
    const legacyPayload = JSON.stringify({
      status: 'Hold',
      confidence: 0.6,
      rationale: 'Stable fundamentals',
    });

    const result = service.parse(legacyPayload, 'MSFT', RiskTolerance.MEDIUM);

    expect(result.status).toBe('Hold');
    expect(result.aiSummary).toBeUndefined();
    expect(result.shortTermOutlook).toBeUndefined();
    expect(result.longTermOutlook).toBeUndefined();
  });

  it('accepts an empty aiSummary string', () => {
    const payload = JSON.stringify({
      ...validPayload,
      aiSummary: '',
    });

    const result = service.parse(payload, 'AAPL', RiskTolerance.MEDIUM);

    expect(result.aiSummary).toBe('');
  });

  it('trims surrounding whitespace before parsing', () => {
    const result = service.parse('  ' + validJson + '  ', 'AAPL', RiskTolerance.LOW);
    expect(result.status).toBe(StockRecommendation.INVEST);
  });
});
