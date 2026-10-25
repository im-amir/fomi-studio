import { getHistoryPage } from '@/lib/mock/history';
import { errorResponse } from '@/lib/mock/http';

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;

/** @param {import('next/server').NextRequest} request */
export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const limit = Number(searchParams.get('limit') ?? DEFAULT_LIMIT);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return errorResponse(
      400,
      'INVALID_REQUEST',
      `limit must be between 1 and ${MAX_LIMIT}.`,
      'limit',
    );
  }

  const page = getHistoryPage({ cursor: searchParams.get('cursor'), limit });
  if (!page)
    return errorResponse(400, 'INVALID_CURSOR', 'This page of history no longer exists.', 'cursor');

  return Response.json(page);
}
