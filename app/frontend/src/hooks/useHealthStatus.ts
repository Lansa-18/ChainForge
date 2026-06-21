'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  BackendHealthResponse,
  HealthState,
  HealthStatusResult,
} from '@/types/health';

/** Polling interval: 30 seconds — reasonable for a health badge */
const POLL_INTERVAL_MS = 30_000;

async function fetchHealth(): Promise<BackendHealthResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8_000);

  try {
    const { data, error } = await apiClient.GET('/api/v1/health', {
      signal: controller.signal,
      cache: 'no-store',
    } as Parameters<typeof apiClient.GET>[1]);

    if (error) {
      throw new Error(`Server responded with an error`);
    }

    return data as BackendHealthResponse;
  } finally {
    clearTimeout(timeoutId);
  }
}

function deriveState(
  status: string | undefined,
  isLoading: boolean,
  isError: boolean,
): HealthState {
  if (isLoading) return 'loading';
  if (isError) return 'down';
  if (status === 'ok') return 'ok';
  if (status) return 'degraded';
  return 'down';
}

export function useHealthStatus(): HealthStatusResult {
  const { data, error, isLoading, dataUpdatedAt } = useQuery<
    BackendHealthResponse,
    Error
  >({
    queryKey: ['backend-health'],
    queryFn: fetchHealth,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
    retry: 1,
    staleTime: POLL_INTERVAL_MS,
  });

  const state = deriveState(data?.status, isLoading, !!error);
  const lastChecked = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  return {
    state,
    data: data ?? null,
    error: error ?? null,
    lastChecked,
  };
}
