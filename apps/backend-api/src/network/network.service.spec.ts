import { Test, TestingModule } from '@nestjs/testing';
import { NetworkService } from './network.service';

describe('NetworkService', () => {
  let service: NetworkService;

  beforeEach(async () => {
    global.fetch = jest.fn();
    jest.useFakeTimers();

    const module: TestingModule = await Test.createTestingModule({
      providers: [NetworkService],
    }).compile();

    service = module.get<NetworkService>(NetworkService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch and map data successfully', async () => {
    const mockData = { test: 'value' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const url = 'http://example.com';
    const mapper = (data: { test: string }) => ({ mapped: data.test });

    const result = await service.get(url, mapper);

    expect(global.fetch).toHaveBeenCalledWith(url);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ mapped: 'value' });
  });

  it('should retry on failure and eventually succeed', async () => {
    const mockData = { test: 'value' };
    const fetchMock = global.fetch as jest.Mock;

    // Fail first time, succeed second
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

    const url = 'http://example.com';
    const mapper = (data: { test: string }) => ({ mapped: data.test });

    const resultPromise = service.get(url, mapper);

    // Fast-forward timers for the first retry delay (1000ms)
    await jest.advanceTimersByTimeAsync(1000);

    const result = await resultPromise;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ mapped: 'value' });
  });

  it('should throw an error after all retries fail', async () => {
    const fetchMock = global.fetch as jest.Mock;

    fetchMock.mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    });

    const url = 'http://example.com';
    const mapper = (data: unknown) => data;

    const resultPromise = service.get(url, mapper);
    const errorCatch = resultPromise.catch((e) => e);

    // Fast-forward timers to cover all retry delays (1000ms + 2000ms)
    await jest.advanceTimersByTimeAsync(3000);

    const error = (await errorCatch) as Error;
    expect(error.message).toBe('API error: Internal Server Error');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('serves a cached response without a second fetch within the TTL', async () => {
    const mockData = { test: 'value' };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const url = 'http://example.com/news';
    const mapper = (data: { test: string }) => ({ mapped: data.test });

    const first = await service.get(url, mapper, { cacheTtlMs: 60_000 });
    const second = await service.get(url, mapper, { cacheTtlMs: 60_000 });

    expect(first).toEqual({ mapped: 'value' });
    expect(second).toEqual({ mapped: 'value' });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('does not retry a 429 and parks the host in cooldown', async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      headers: { get: () => null },
    });

    const url = 'http://ratelimited.test/news';
    const mapper = (data: unknown) => data;

    await service.get(url, mapper).catch((e) => e);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await service.get(url, mapper).catch((e) => e);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rotates to the next API key when one is rate limited', async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: { get: () => null },
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ test: 'value' }),
      });

    const mapper = (data: { test: string }) => ({ mapped: data.test });
    const buildUrl = (key: string) => `http://ratelimited.test/news?apiKey=${key}`;

    const result = await service.getWithKeyRotation(['key1', 'key2'], buildUrl, mapper);

    expect(result).toEqual({ mapped: 'value' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://ratelimited.test/news?apiKey=key1');
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://ratelimited.test/news?apiKey=key2');
  });

  it('throws once every rotated key has failed', async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      headers: { get: () => null },
    });

    const mapper = (data: unknown) => data;
    const buildUrl = (key: string) => `http://ratelimited.test/all?apiKey=${key}`;

    await expect(service.getWithKeyRotation(['key1', 'key2'], buildUrl, mapper)).rejects.toThrow(
      'Rate limited',
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
