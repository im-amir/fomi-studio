/** @import { Batch, GenerateRequest, HistoryPage } from './types' */

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

/** Error with a machine-readable `code` the UI can branch on (e.g. highlight `field`). */
export class ApiError extends Error {
  /** @param {{ code: string, message: string, status: number, field?: string }} details */
  constructor({ code, message, status, field }) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.field = field;
  }
}

/** @param {unknown} error */
export function isAbortError(error) {
  return error instanceof DOMException && error.name === 'AbortError';
}

/**
 * fetch + JSON with consistent errors. Aborts are re-thrown untouched so callers
 * can ignore them; everything else becomes an ApiError.
 * @template T
 * @param {string} path
 * @param {{ method?: 'GET' | 'POST', body?: unknown, signal?: AbortSignal }} [options]
 * @returns {Promise<T>}
 */
async function request(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(path, {
      method,
      signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ApiError({
      code: 'NETWORK_ERROR',
      message: 'Can’t reach FOMI. Check your connection and try again.',
      status: 0,
    });
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError({
      code: data?.error?.code ?? 'UNKNOWN_ERROR',
      message: data?.error?.message ?? FALLBACK_MESSAGE,
      status: response.status,
      field: data?.error?.field,
    });
  }
  return data;
}

/**
 * @param {GenerateRequest} params
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<Batch>}
 */
export function generateBatch(params, { signal } = {}) {
  return request('/api/generate', { method: 'POST', body: params, signal });
}

/**
 * @param {{ cursor?: string | null, limit?: number, signal?: AbortSignal }} [options]
 * @returns {Promise<HistoryPage>}
 */
export function fetchHistory({ cursor, limit = 12, signal } = {}) {
  const query = new URLSearchParams({ limit: String(limit) });
  if (cursor) query.set('cursor', cursor);
  return request(`/api/history?${query}`, { signal });
}
