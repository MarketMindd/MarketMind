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
});
