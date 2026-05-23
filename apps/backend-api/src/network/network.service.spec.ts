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
    const mapper = (data: any) => ({ mapped: data.test });

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
    const mapper = (data: any) => ({ mapped: data.test });

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
    const mapper = (data: any) => data;

    const resultPromise = service.get(url, mapper);
    const errorCatch = resultPromise.catch((e) => e);

    // Fast-forward timers to cover all retry delays (1000ms + 2000ms)
    await jest.advanceTimersByTimeAsync(3000);

    const error = await errorCatch;
    expect(error.message).toBe('API error: Internal Server Error');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
