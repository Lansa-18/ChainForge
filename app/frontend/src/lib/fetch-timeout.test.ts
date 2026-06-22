import { withTimeoutFetch, isTimeoutError, DEFAULT_TIMEOUT_MS } from './fetch-timeout';

describe('isTimeoutError', () => {
  it('returns true for DOMException AbortError', () => {
    expect(isTimeoutError(new DOMException('aborted', 'AbortError'))).toBe(true);
  });

  it('returns true for DOMException TimeoutError', () => {
    expect(isTimeoutError(new DOMException('timed out', 'TimeoutError'))).toBe(true);
  });

  it('returns false for a plain Error', () => {
    expect(isTimeoutError(new Error('something went wrong'))).toBe(false);
  });

  it('returns false for a TypeError', () => {
    expect(isTimeoutError(new TypeError('Failed to fetch'))).toBe(false);
  });

  it('returns false for null', () => {
    expect(isTimeoutError(null)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isTimeoutError('timeout')).toBe(false);
  });
});

describe('withTimeoutFetch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves normally when the request completes before the timeout', async () => {
    const mockFetch = jest.fn().mockResolvedValue(new Response('ok', { status: 200 }));
    const timedFetch = withTimeoutFetch(mockFetch, 5_000);

    const promise = timedFetch('https://example.com/api');
    const response = await promise;

    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('aborts the request when the timeout fires', async () => {
    let capturedSignal: AbortSignal | undefined;
    const mockFetch = jest.fn().mockImplementation((_input, init?: RequestInit) => {
      capturedSignal = init?.signal as AbortSignal | undefined;
      return new Promise<Response>((_, reject) => {
        if (capturedSignal) {
          capturedSignal.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          );
        }
      });
    });

    const timedFetch = withTimeoutFetch(mockFetch, 5_000);
    const promise = timedFetch('https://example.com/api');

    jest.advanceTimersByTime(5_000);

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
    expect(capturedSignal?.aborted).toBe(true);
  });

  it('clears the timer when the request resolves before timeout', async () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const mockFetch = jest.fn().mockResolvedValue(new Response('ok'));
    const timedFetch = withTimeoutFetch(mockFetch, 5_000);

    await timedFetch('https://example.com/api');

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('aborts immediately when the caller passes a pre-aborted signal', async () => {
    const callerController = new AbortController();
    callerController.abort();

    let capturedSignal: AbortSignal | undefined;
    const mockFetch = jest.fn().mockImplementation((_input, init?: RequestInit) => {
      capturedSignal = init?.signal as AbortSignal | undefined;
      return Promise.resolve(new Response('ok'));
    });

    const timedFetch = withTimeoutFetch(mockFetch, 5_000);
    await timedFetch('https://example.com/api', { signal: callerController.signal });

    expect(capturedSignal?.aborted).toBe(true);
  });

  it('aborts when the caller signal fires before the timeout', async () => {
    const callerController = new AbortController();
    let capturedSignal: AbortSignal | undefined;

    const mockFetch = jest.fn().mockImplementation((_input, init?: RequestInit) => {
      capturedSignal = init?.signal as AbortSignal | undefined;
      return new Promise<Response>((_, reject) => {
        capturedSignal?.addEventListener('abort', () =>
          reject(new DOMException('aborted', 'AbortError')),
        );
      });
    });

    const timedFetch = withTimeoutFetch(mockFetch, 5_000);
    const promise = timedFetch('https://example.com/api', { signal: callerController.signal });

    callerController.abort();

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('uses DEFAULT_TIMEOUT_MS when no timeout is specified', async () => {
    let capturedSignal: AbortSignal | undefined;
    const mockFetch = jest.fn().mockImplementation((_input, init?: RequestInit) => {
      capturedSignal = init?.signal as AbortSignal | undefined;
      return new Promise<Response>((_, reject) => {
        capturedSignal?.addEventListener('abort', () =>
          reject(new DOMException('aborted', 'AbortError')),
        );
      });
    });

    const timedFetch = withTimeoutFetch(mockFetch);
    const promise = timedFetch('https://example.com/api');

    jest.advanceTimersByTime(DEFAULT_TIMEOUT_MS);

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });
});
