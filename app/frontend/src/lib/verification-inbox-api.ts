import { withRetry } from '@/lib/retry';
import { apiClient } from '@/lib/api-client';
import { isTimeoutError } from '@/lib/fetch-timeout';
import type {
  VerificationInboxResponse,
  VerificationInboxItem,
  VerificationStats,
  InternalNote,
  ReviewFilters,
} from '@/types/verification-review';

export async function fetchInbox(
  filters: Partial<ReviewFilters>,
): Promise<VerificationInboxResponse> {
  try {
    const { data, error } = await withRetry(() =>
      apiClient.GET('/api/v1/verification-inbox', {
        params: {
          query: {
            status: filters.status || undefined,
            page: filters.page && filters.page > 1 ? filters.page : undefined,
            dateFrom: filters.dateFrom || undefined,
            dateTo: filters.dateTo || undefined,
          },
        },
      }),
    );
    if (error) throw new Error((error as { message?: string }).message ?? 'Failed to fetch inbox');
    return data as VerificationInboxResponse;
  } catch (error) {
    if (isTimeoutError(error)) throw new Error('Request timed out. Please check your connection and try again.');
    throw error;
  }
}

export async function fetchStats(): Promise<VerificationStats> {
  try {
    const { data, error } = await withRetry(() =>
      apiClient.GET('/api/v1/verification-inbox/stats'),
    );
    if (error) throw new Error((error as { message?: string }).message ?? 'Failed to fetch stats');
    return data as VerificationStats;
  } catch (error) {
    if (isTimeoutError(error)) throw new Error('Request timed out. Please check your connection and try again.');
    throw error;
  }
}

export async function fetchDetails(id: string): Promise<VerificationInboxItem> {
  try {
    const { data, error } = await withRetry(() =>
      apiClient.GET('/api/v1/verification-inbox/{id}', {
        params: { path: { id } },
      }),
    );
    if (error) throw new Error((error as { message?: string }).message ?? 'Failed to fetch verification');
    return data as VerificationInboxItem;
  } catch (error) {
    if (isTimeoutError(error)) throw new Error('Request timed out. Please check your connection and try again.');
    throw error;
  }
}

export async function approveVerification(
  id: string,
  payload: { nextStepMessage?: string; internalNote?: string },
): Promise<VerificationInboxItem> {
  try {
    const { data, error } = await withRetry(() =>
      apiClient.POST('/api/v1/verification-inbox/{id}/approve', {
        params: { path: { id } },
        body: payload,
      }),
    );
    if (error) throw new Error((error as { message?: string }).message ?? 'Approve failed');
    return data as VerificationInboxItem;
  } catch (error) {
    if (isTimeoutError(error)) throw new Error('Request timed out. Please check your connection and try again.');
    throw error;
  }
}

export async function rejectVerification(
  id: string,
  payload: {
    rejectionReason: string;
    nextStepMessage?: string;
    internalNote?: string;
  },
): Promise<VerificationInboxItem> {
  try {
    const { data, error } = await withRetry(() =>
      apiClient.POST('/api/v1/verification-inbox/{id}/reject', {
        params: { path: { id } },
        body: payload,
      }),
    );
    if (error) throw new Error((error as { message?: string }).message ?? 'Reject failed');
    return data as VerificationInboxItem;
  } catch (error) {
    if (isTimeoutError(error)) throw new Error('Request timed out. Please check your connection and try again.');
    throw error;
  }
}

export async function requestResubmission(
  id: string,
  payload: {
    rejectionReason: string;
    nextStepMessage: string;
    internalNote?: string;
  },
): Promise<VerificationInboxItem> {
  try {
    const { data, error } = await withRetry(() =>
      apiClient.POST('/api/v1/verification-inbox/{id}/request-resubmission', {
        params: { path: { id } },
        body: payload,
      }),
    );
    if (error) throw new Error((error as { message?: string }).message ?? 'Resubmission request failed');
    return data as VerificationInboxItem;
  } catch (error) {
    if (isTimeoutError(error)) throw new Error('Request timed out. Please check your connection and try again.');
    throw error;
  }
}

export async function fetchNotes(id: string): Promise<InternalNote[]> {
  try {
    const { data, error } = await withRetry(() =>
      apiClient.GET('/api/v1/verification-inbox/{id}/notes', {
        params: { path: { id } },
      }),
    );
    if (error) throw new Error((error as { message?: string }).message ?? 'Failed to fetch notes');
    return (data ?? []) as InternalNote[];
  } catch (error) {
    if (isTimeoutError(error)) throw new Error('Request timed out. Please check your connection and try again.');
    throw error;
  }
}

export async function addNote(
  id: string,
  payload: { content: string; category?: string },
): Promise<InternalNote> {
  try {
    const { data, error } = await withRetry(() =>
      apiClient.POST('/api/v1/verification-inbox/{id}/notes', {
        params: { path: { id } },
        body: payload,
      }),
    );
    if (error) throw new Error((error as { message?: string }).message ?? 'Add note failed');
    return data as InternalNote;
  } catch (error) {
    if (isTimeoutError(error)) throw new Error('Request timed out. Please check your connection and try again.');
    throw error;
  }
}
