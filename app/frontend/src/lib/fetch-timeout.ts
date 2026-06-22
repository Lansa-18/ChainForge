export const DEFAULT_TIMEOUT_MS = 30_000;

export function isTimeoutError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'AbortError' || error.name === 'TimeoutError')
  );
}

function mergeSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  const controller = new AbortController();
  if (a.aborted) { controller.abort(a.reason); return controller.signal; }
  if (b.aborted) { controller.abort(b.reason); return controller.signal; }
  a.addEventListener('abort', () => controller.abort(a.reason), { once: true });
  b.addEventListener('abort', () => controller.abort(b.reason), { once: true });
  return controller.signal;
}

export function withTimeoutFetch(
  baseFetch: typeof globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): typeof globalThis.fetch {
  return (input, init) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const signal = init?.signal
      ? mergeSignals(init.signal as AbortSignal, controller.signal)
      : controller.signal;
    return baseFetch(input, { ...init, signal }).finally(() => clearTimeout(timer));
  };
}
