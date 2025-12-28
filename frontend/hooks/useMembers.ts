// TanStack Query hooks for Members
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { Member, CreateMemberDto, QueryMemberDto } from '@/lib/types';

// Get all members
export const useMembers = (params?: QueryMemberDto) => {
  return useQuery({
    queryKey: ['members', params],
    queryFn: async (): Promise<Member[]> => {
      const response = await apiClient.get<Member[]>('/members', { params });
      return response.data;
    },
  });
};

// Get single member
export const useMember = (id: string) => {
  return useQuery({
    queryKey: ['members', id],
    queryFn: async (): Promise<Member> => {
      const response = await apiClient.get<Member>(`/members/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create member mutation
export const useCreateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMemberDto): Promise<Member> => {
      const response = await apiClient.post<Member>('/members', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

// Update member mutation
export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateMemberDto> }): Promise<Member> => {
      const response = await apiClient.patch<Member>(`/members/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

// Delete member mutation
export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/members/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};
