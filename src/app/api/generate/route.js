import { createBatch } from '@/lib/mock/generate-batch';
import { errorResponse, sleep } from '@/lib/mock/http';
import { validateGenerateRequest } from '@/lib/mock/validate-request';

const MIN_LATENCY_MS = 1500;
const MAX_LATENCY_MS = 3000;
// Lets reviewers trigger the error state on demand: any prompt containing the word "fail".
const FAILURE_TRIGGER = /\bfail\b/i;

/** @param {Request} request */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, 'INVALID_JSON', 'Request body must be valid JSON.');
  }

  const result = validateGenerateRequest(body);
  if (!result.ok) {
    const { code, message, field } = result.error;
    return errorResponse(400, code, message, field);
  }

  try {
    await sleep(MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS), request.signal);
  } catch {
    // Client cancelled; nobody is listening for the body.
    return new Response(null, { status: 499 });
  }

  if (FAILURE_TRIGGER.test(result.value.prompt)) {
    return errorResponse(
      503,
      'GENERATION_FAILED',
      'The model couldn’t finish this one. Your prompt is saved — try again in a moment.',
    );
  }

  const batch = createBatch(result.value, {
    now: new Date(),
    random: Math.random,
    createId: () => crypto.randomUUID(),
  });
  return Response.json(batch, { status: 201 });
}
