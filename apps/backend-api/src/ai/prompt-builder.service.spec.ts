import { RiskTolerance } from '@market-mind/common';
import { PromptBuilderService } from './prompt-builder.service';

describe('PromptBuilderService.buildChatPrompt', () => {
  const service = new PromptBuilderService();
  const profile = { riskTolerance: RiskTolerance.MEDIUM, interests: [] };

  it('instructs the model to link stock references to their detail page', () => {
    const prompt = service.buildChatPrompt(profile, [], [], 'What should I buy?');
    expect(prompt).toContain('[AAPL](/stock/AAPL)');
  });

  it('instructs the model to link page references to their route', () => {
    const prompt = service.buildChatPrompt(profile, [], [], 'Where do I edit holdings?');
    expect(prompt).toContain('(/portfolio)');
  });

  it('injects beginner-friendly guidance in easy mode', () => {
    const prompt = service.buildChatPrompt(
      profile,
      [],
      [],
      'What is a stock?',
      undefined,
      false,
      undefined,
      'easy',
    );
    expect(prompt).toContain('EASY MODE');
    expect(prompt).toContain('beginner');
  });

  it('injects professional guidance in pro mode', () => {
    const prompt = service.buildChatPrompt(
      profile,
      [],
      [],
      'Analyze NVDA valuation',
      undefined,
      false,
      undefined,
      'pro',
    );
    expect(prompt).toContain('PROFESSIONAL MODE');
    expect(prompt).not.toContain('EASY MODE');
  });

  it('defaults to easy mode when no explain mode is provided', () => {
    const prompt = service.buildChatPrompt(profile, [], [], 'What should I buy?');
    expect(prompt).toContain('EASY MODE');
  });
});
