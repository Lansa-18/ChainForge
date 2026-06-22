'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { isTimeoutError } from '@/lib/fetch-timeout';
import type {
  Campaign,
  CampaignCreatePayload,
  CampaignUpdatePayload,
} from '@/types/campaign';
import { useActivity } from './useActivity';

async function fetchCampaigns(): Promise<Campaign[]> {
  try {
    const { data, error } = await apiClient.GET('/api/v1/campaigns', {
      params: { query: { includeArchived: false } },
    });
    if (error) throw new Error((error as { message?: string }).message ?? 'Failed to fetch campaigns');
    const result = data as unknown as { data?: Campaign[] } | Campaign[] | null;
    if (Array.isArray(result)) return result;
    return result?.data ?? [];
  } catch (error) {
    if (isTimeoutError(error)) throw new Error('Request timed out. Please check your connection and try again.');
    throw error;
  }
}

async function postCampaign(payload: CampaignCreatePayload): Promise<Campaign> {
  try {
    const { data, error, response } = await apiClient.POST('/api/v1/campaigns', {
      body: payload as never,
    });
    if (error || !response.ok) {
      throw new Error((error as { message?: string } | undefined)?.message ?? 'Failed to create campaign');
    }
    const result = data as unknown as { data?: Campaign } | Campaign | null;
    return (result && 'data' in result ? result.data : result) as Campaign;
  } catch (error) {
    if (isTimeoutError(error)) throw new Error('Request timed out. Please check your connection and try again.');
    throw error;
  }
}

async function patchCampaign(id: string, payload: CampaignUpdatePayload): Promise<Campaign> {
  try {
    const { data, error } = await apiClient.PATCH('/api/v1/campaigns/{id}', {
      params: { path: { id } },
      body: payload as never,
    });
    if (error) throw new Error((error as { message?: string }).message ?? 'Failed to update campaign');
    const result = data as unknown as { data?: Campaign } | Campaign | null;
    return (result && 'data' in result ? result.data : result) as Campaign;
  } catch (error) {
    if (isTimeoutError(error)) throw new Error('Request timed out. Please check your connection and try again.');
    throw error;
  }
}

export function useCampaigns() {
  return useQuery({ queryKey: ['campaigns'], queryFn: fetchCampaigns });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { trackJob } = useActivity();

  return useMutation({
    mutationFn: (payload: CampaignCreatePayload) => {
      return trackJob(
        'Create Campaign',
        `Creating campaign "${payload.name}"`,
        () => postCampaign(payload),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CampaignUpdatePayload }) =>
      patchCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}
