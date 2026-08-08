import { Test, TestingModule } from '@nestjs/testing';
import { GeminiClientService } from './gemini-client.service';

const generateContentMock = jest.fn();

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(({ apiKey }: { apiKey: string }) => ({
    models: { generateContent: (...args: unknown[]) => generateContentMock(apiKey, ...args) },
  })),
}));

jest.mock('../config/appConfig', () => ({
  appConfig: {
    geminiApiKeys: ['key1', 'key2'],
  },
}));

describe('GeminiClientService', () => {
  let service: GeminiClientService;

  beforeEach(async () => {
    generateContentMock.mockReset();
    jest.useFakeTimers();

    const module: TestingModule = await Test.createTestingModule({
      providers: [GeminiClientService],
    }).compile();

    service = module.get<GeminiClientService>(GeminiClientService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('rotates to the next API key when the first key is exhausted', async () => {
    generateContentMock.mockImplementation(async (apiKey: string) => {
      if (apiKey === 'key1') {
        throw new Error('RESOURCE_EXHAUSTED');
      }
      return { text: '{"reply":"ok"}' };
    });

    const resultPromise = service.generateContent('prompt');
    await jest.advanceTimersByTimeAsync(1000 + 2000);
    const result = await resultPromise;

    expect(result).toBe('{"reply":"ok"}');
    expect(generateContentMock).toHaveBeenCalledTimes(4);
  });

  it('throws once every rotated key has failed', async () => {
    generateContentMock.mockRejectedValue(new Error('RESOURCE_EXHAUSTED'));

    const resultPromise = service.generateContent('prompt');
    const errorCatch = resultPromise.catch((e) => e);
    await jest.advanceTimersByTimeAsync((1000 + 2000) * 2);

    const error = (await errorCatch) as Error;
    expect(error.message).toBe('RESOURCE_EXHAUSTED');
    expect(generateContentMock).toHaveBeenCalledTimes(6);
  });
});
