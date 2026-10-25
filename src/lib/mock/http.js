import 'server-only';

/**
 * @param {number} status
 * @param {string} code
 * @param {string} message
 * @param {string} [field]
 */
export function errorResponse(status, code, message, field) {
  return Response.json({ error: { code, message, ...(field && { field }) } }, { status });
}

/**
 * Resolves after `ms`, or rejects as soon as the client aborts, so a cancelled
 * generation stops holding a server connection open.
 * @param {number} ms
 * @param {AbortSignal} signal
 * @returns {Promise<void>}
 */
export function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}
