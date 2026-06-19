/* eslint-disable @typescript-eslint/no-explicit-any */
import { GptOssClientService } from './gpt-oss-client.service';

jest.mock('../config/appConfig', () => ({
  appConfig: {
    llm: {
      gptOss: {
        baseUrl: 'http://llm.test',
        username: 'student1',
        password: 'pass123',
        model: 'gpt-oss-120b',
        maxTokens: 4096,
      },
    },
  },
}));

describe('GptOssClientService', () => {
  const service = new GptOssClientService();
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('posts to the OpenAI-compatible endpoint with Basic auth and returns the message content', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '{"reply":"hi"}' } }] }),
    });
    global.fetch = fetchMock as any;

    const result = await service.generateContent('say hi');

    expect(result).toBe('{"reply":"hi"}');
    const [calledUrl, init] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe('http://llm.test/v1/chat/completions');
    expect((init.headers as any).Authorization).toBe(
      `Basic ${Buffer.from('student1:pass123').toString('base64')}`,
    );
    const body = JSON.parse(init.body);
    expect(body.model).toBe('gpt-oss-120b');
    expect(body.max_tokens).toBe(4096);
    expect(body.messages[1]).toEqual({ role: 'user', content: 'say hi' });
  });

  it('throws an error containing the status code when the service responds 429', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      text: async () => 'rate limited',
    });
    global.fetch = fetchMock as any;

    await expect(service.generateContent('hi')).rejects.toThrow('429');
  });
});
