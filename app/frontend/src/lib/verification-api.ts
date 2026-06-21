import type { VerificationResult } from '@/types/verification';
import { withRetry } from '@/lib/retry';
import { apiClient } from '@/lib/api-client';

export class VerificationApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VerificationApiError';
  }
}

export async function startEvidenceVerification(
  payload: FormData,
): Promise<VerificationResult> {
  let data: VerificationResult | undefined;
  let response: Response | undefined;

  try {
    const result = await withRetry(() =>
      apiClient.POST('/api/v1/verification/start', {
        // FormData is passed as-is; the cast bypasses the typed body schema
        // since openapi-fetch serialises multipart differently per version.
        body: payload as never,
      }),
    );
    data = result.data as VerificationResult | undefined;
    response = result.response;
  } catch {
    throw new VerificationApiError(
      'Unable to reach the verification service. Please check your connection and try again.',
    );
  }

  if (response && response.ok && data) {
    return data;
  }

  if (response && response.status >= 400 && response.status < 500) {
    let message =
      'The verification request was rejected. Please review your evidence and try again.';
    try {
      const body = (await response.json()) as { message?: string };
      if (typeof body.message === 'string' && body.message.trim().length > 0) {
        message = body.message;
      }
    } catch {
      // JSON parsing failed — use the default message
    }
    throw new VerificationApiError(message);
  }

  throw new VerificationApiError(
    'The verification service is temporarily unavailable. Please try again in a moment.',
  );
}
