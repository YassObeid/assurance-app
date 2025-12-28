// TanStack Query hooks for Reports
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { GlobalSummary, RegionReport, DelegateReport } from '@/lib/types';

// Get global summary (GM only)
export const useGlobalSummary = () => {
  return useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: async (): Promise<GlobalSummary> => {
      const response = await apiClient.get<GlobalSummary>('/reports/summary');
      return response.data;
    },
  });
};

// Get regions report (GM and Region Manager)
export const useRegionsReport = () => {
  return useQuery({
    queryKey: ['reports', 'regions'],
    queryFn: async (): Promise<RegionReport[]> => {
      const response = await apiClient.get<RegionReport[]>('/reports/regions');
      return response.data;
    },
  });
};

// Get delegate report
export const useDelegateReport = (delegateId: string) => {
  return useQuery({
    queryKey: ['reports', 'delegates', delegateId],
    queryFn: async (): Promise<DelegateReport> => {
      const response = await apiClient.get<DelegateReport>(`/reports/delegates/${delegateId}`);
      return response.data;
    },
    enabled: !!delegateId,
  });
};
