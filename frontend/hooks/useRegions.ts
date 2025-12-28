// TanStack Query hooks for Regions
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { Region, CreateRegionDto } from '@/lib/types';

// Get all regions
export const useRegions = () => {
  return useQuery({
    queryKey: ['regions'],
    queryFn: async (): Promise<Region[]> => {
      const response = await apiClient.get<Region[]>('/regions');
      return response.data;
    },
  });
};

// Get single region
export const useRegion = (id: string) => {
  return useQuery({
    queryKey: ['regions', id],
    queryFn: async (): Promise<Region> => {
      const response = await apiClient.get<Region>(`/regions/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create region mutation
export const useCreateRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRegionDto): Promise<Region> => {
      const response = await apiClient.post<Region>('/regions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    },
  });
};

// Update region mutation
export const useUpdateRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateRegionDto> }): Promise<Region> => {
      const response = await apiClient.patch<Region>(`/regions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    },
  });
};

// Delete region mutation
export const useDeleteRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/regions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    },
  });
};
