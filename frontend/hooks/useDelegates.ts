// TanStack Query hooks for Delegates
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { Delegate, CreateDelegateDto } from '@/lib/types';

// Get all delegates
export const useDelegates = () => {
  return useQuery({
    queryKey: ['delegates'],
    queryFn: async (): Promise<Delegate[]> => {
      const response = await apiClient.get<Delegate[]>('/delegates');
      return response.data;
    },
  });
};

// Get single delegate
export const useDelegate = (id: string) => {
  return useQuery({
    queryKey: ['delegates', id],
    queryFn: async (): Promise<Delegate> => {
      const response = await apiClient.get<Delegate>(`/delegates/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create delegate mutation
export const useCreateDelegate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDelegateDto): Promise<Delegate> => {
      const response = await apiClient.post<Delegate>('/delegates', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegates'] });
    },
  });
};

// Update delegate mutation
export const useUpdateDelegate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateDelegateDto> }): Promise<Delegate> => {
      const response = await apiClient.patch<Delegate>(`/delegates/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegates'] });
    },
  });
};

// Delete delegate mutation
export const useDeleteDelegate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/delegates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegates'] });
    },
  });
};
