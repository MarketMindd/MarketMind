import { Test, TestingModule } from '@nestjs/testing';

import { RiskTolerance } from '@market-mind/common';

import { ResponseParserService } from './response-parser.service';

describe('ResponseParserService', () => {
  let service: ResponseParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseParserService],
    }).compile();

    service = module.get<ResponseParserService>(ResponseParserService);
  });

  const validPayload = { status: 'Invest', confidence: 0.8, rationale: 'Strong momentum' };
  const validJson = JSON.stringify(validPayload);

  it('parses valid JSON successfully', () => {
    const result = service.parse(validJson, 'AAPL', RiskTolerance.MEDIUM);
    expect(result.status).toBe('Invest');
    expect(result.confidence).toBe(0.8);
    expect(result.rationale).toBe('Strong momentum');
    expect(result.symbol).toBe('AAPL');
    expect(result.riskTolerance).toBe(RiskTolerance.MEDIUM);
    expect(result.generatedAt).toBeInstanceOf(Date);
  });

  it('strips plain fenced JSON blocks', () => {
    const fenced = '```\n' + validJson + '\n```';
    const result = service.parse(fenced, 'AAPL', RiskTolerance.HIGH);
    expect(result.status).toBe('Invest');
  });

  it('strips json-tagged fenced JSON blocks', () => {
    const fenced = '```json\n' + validJson + '\n```';
    const result = service.parse(fenced, 'TSLA', RiskTolerance.LOW);
    expect(result.status).toBe('Invest');
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

  it('trims surrounding whitespace before parsing', () => {
    const result = service.parse('  ' + validJson + '  ', 'AAPL', RiskTolerance.LOW);
    expect(result.status).toBe('Invest');
  });
});
