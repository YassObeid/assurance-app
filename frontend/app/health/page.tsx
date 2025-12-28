'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import apiClient from '@/lib/api';

interface HealthStatus {
  status: string;
  uptime: number;
  timestamp: string;
}

export default function HealthPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await apiClient.get<HealthStatus>('/health');
        setHealth(response.data);
        setError('');
      } catch (err) {
        setError('Backend API is not responding');
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Health Check</CardTitle>
          <CardDescription>
            Backend API Status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <LoadingSpinner />}

          {!loading && error && (
            <div className="text-center space-y-4">
              <div className="text-red-600 text-lg font-semibold">❌ Unhealthy</div>
              <p className="text-gray-600">{error}</p>
            </div>
          )}

          {!loading && health && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-green-600 text-lg font-semibold">✅ Healthy</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{health.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="font-medium">{Math.floor(health.uptime)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Timestamp:</span>
                  <span className="font-medium">
                    {new Date(health.timestamp).toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
