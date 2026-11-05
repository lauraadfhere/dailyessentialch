/**
 * Workers-safe fetch timeout.
 *
 * `AbortSignal.timeout()` relies on `setTimeout()`, which Cloudflare Workers
 * may not support fully — the pending timer can cause the Worker runtime to
 * detect a hang and cancel the request.
 *
 * This helper creates a plain `AbortController` and schedules the abort via
 * `setTimeout`.  The critical difference is that we **always** clear the timer
 * once the fetch settles (success _or_ failure), so no dangling timer is left
 * for the runtime to trip over.
 *
 * Usage:
 *   const { signal, clear } = fetchTimeout(3000);
 *   try {
 *     const res = await fetch(url, { signal });
 *     …
 *   } finally {
 *     clear();
 *   }
 */
export function fetchTimeout(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(new DOMException("The operation was aborted due to timeout", "TimeoutError")), ms);
  return {
    signal: controller.signal,
    clear() {
      clearTimeout(id);
    },
  };
}

/**
 * Convenience wrapper: performs `fetch()` with a timeout and always clears the
 * timer so no background work remains after the response (or error) is handled.
 */
export async function fetchWithTimeout(url: string | URL, init: RequestInit & { timeoutMs: number }): Promise<Response> {
  const { timeoutMs, ...rest } = init;
  const { signal, clear } = fetchTimeout(timeoutMs);
  try {
    return await fetch(url, { ...rest, signal });
  } finally {
    clear();
  }
}
