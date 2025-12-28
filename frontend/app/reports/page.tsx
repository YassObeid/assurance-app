'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGlobalSummary, useRegionsReport } from '@/hooks/useReports';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { isGM, isRegionManager } from '@/lib/auth';

export default function ReportsPage() {
  const canViewSummary = isGM();
  const canViewRegions = isGM() || isRegionManager();

  const { data: summary, isLoading: summaryLoading, error: summaryError } = useGlobalSummary();
  const { data: regionsReport, isLoading: regionsLoading, error: regionsError } = useRegionsReport();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports</h1>
          <p className="text-gray-500 mt-2">
            Consultez les rapports et statistiques
          </p>
        </div>

        {canViewSummary && (
          <Card>
            <CardHeader>
              <CardTitle>Résumé global</CardTitle>
              <CardDescription>
                Vue d&apos;ensemble de toutes les données
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summaryLoading && <LoadingSpinner />}
              
              {summaryError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Erreur lors du chargement du résumé
                  </AlertDescription>
                </Alert>
              )}

              {summary && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Régions</p>
                    <p className="text-2xl font-bold text-blue-600">{summary.totalRegions}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Managers</p>
                    <p className="text-2xl font-bold text-green-600">{summary.totalManagers}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Délégués</p>
                    <p className="text-2xl font-bold text-purple-600">{summary.totalDelegates}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Membres</p>
                    <p className="text-2xl font-bold text-orange-600">{summary.totalMembers}</p>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Paiements</p>
                    <p className="text-2xl font-bold text-pink-600">{summary.totalPayments}</p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Montant total</p>
                    <p className="text-2xl font-bold text-indigo-600">{summary.totalAmount} MAD</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {canViewRegions && (
          <Card>
            <CardHeader>
              <CardTitle>Rapport par région</CardTitle>
              <CardDescription>
                Statistiques détaillées par région
              </CardDescription>
            </CardHeader>
            <CardContent>
              {regionsLoading && <LoadingSpinner />}
              
              {regionsError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Erreur lors du chargement des rapports régionaux
                  </AlertDescription>
                </Alert>
              )}

              {regionsReport && regionsReport.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Région</TableHead>
                      <TableHead>Délégués</TableHead>
                      <TableHead>Membres</TableHead>
                      <TableHead>Paiements</TableHead>
                      <TableHead>Montant total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regionsReport.map((report) => (
                      <TableRow key={report.regionId}>
                        <TableCell className="font-medium">{report.regionName}</TableCell>
                        <TableCell>{report.delegatesCount}</TableCell>
                        <TableCell>{report.membersCount}</TableCell>
                        <TableCell>{report.paymentsCount}</TableCell>
                        <TableCell>{report.totalAmount} MAD</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {regionsReport && regionsReport.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  Aucune donnée disponible
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {!canViewSummary && !canViewRegions && (
          <Alert>
            <AlertDescription>
              Vous n&apos;avez pas accès aux rapports globaux. Contactez votre administrateur.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}
