// TanStack Query hooks for Payments
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { Payment, CreatePaymentDto, QueryPaymentDto } from '@/lib/types';

// Get all payments
export const usePayments = (params?: QueryPaymentDto) => {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: async (): Promise<Payment[]> => {
      const response = await apiClient.get<Payment[]>('/payments', { params });
      return response.data;
    },
  });
};

// Get single payment
export const usePayment = (id: string) => {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: async (): Promise<Payment> => {
      const response = await apiClient.get<Payment>(`/payments/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create payment mutation
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePaymentDto): Promise<Payment> => {
      const response = await apiClient.post<Payment>('/payments', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

// Update payment mutation
export const useUpdatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreatePaymentDto> }): Promise<Payment> => {
      const response = await apiClient.patch<Payment>(`/payments/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

// Delete payment mutation
export const useDeletePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/payments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};
