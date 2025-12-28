// TanStack Query hooks for Managers (RegionManagers)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { RegionManager, CreateManagerDto } from '@/lib/types';

// Get all managers
export const useManagers = () => {
  return useQuery({
    queryKey: ['managers'],
    queryFn: async (): Promise<RegionManager[]> => {
      const response = await apiClient.get<RegionManager[]>('/managers');
      return response.data;
    },
  });
};

// Get single manager
export const useManager = (id: string) => {
  return useQuery({
    queryKey: ['managers', id],
    queryFn: async (): Promise<RegionManager> => {
      const response = await apiClient.get<RegionManager>(`/managers/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create manager mutation
export const useCreateManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateManagerDto): Promise<RegionManager> => {
      const response = await apiClient.post<RegionManager>('/managers', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
    },
  });
};

// Update manager mutation
export const useUpdateManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateManagerDto> }): Promise<RegionManager> => {
      const response = await apiClient.patch<RegionManager>(`/managers/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
    },
  });
};

// Delete manager mutation
export const useDeleteManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/managers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
    },
  });
};
