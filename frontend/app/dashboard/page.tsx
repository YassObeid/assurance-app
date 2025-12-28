'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGlobalSummary } from '@/hooks/useReports';
import { getUserRole, isGM } from '@/lib/auth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DashboardPage() {
  const userRole = getUserRole();
  const { data: summary, isLoading, error } = useGlobalSummary();
  const canViewSummary = isGM();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-2">
            Bienvenue dans votre espace de gestion
          </p>
        </div>

        {canViewSummary && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Résumé global</h2>
            
            {isLoading && <LoadingSpinner />}
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  Erreur lors du chargement des données
                </AlertDescription>
              </Alert>
            )}

            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">{summary.totalRegions}</CardTitle>
                    <CardDescription>Régions</CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">{summary.totalManagers}</CardTitle>
                    <CardDescription>Managers</CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">{summary.totalDelegates}</CardTitle>
                    <CardDescription>Délégués</CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">{summary.totalMembers}</CardTitle>
                    <CardDescription>Membres</CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">{summary.totalPayments}</CardTitle>
                    <CardDescription>Paiements</CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">{summary.totalAmount} MAD</CardTitle>
                    <CardDescription>Montant total</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            )}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Accès rapide</CardTitle>
            <CardDescription>
              Utilisez le menu latéral pour naviguer vers les différentes sections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              {userRole === 'GM' && (
                <>
                  <p>• Gérer les régions et les managers</p>
                  <p>• Superviser tous les délégués et membres</p>
                  <p>• Consulter tous les rapports</p>
                </>
              )}
              {userRole === 'REGION_MANAGER' && (
                <>
                  <p>• Consulter les délégués de votre région</p>
                  <p>• Voir les membres et paiements</p>
                  <p>• Générer des rapports pour votre région</p>
                </>
              )}
              {userRole === 'DELEGATE' && (
                <>
                  <p>• Gérer vos membres</p>
                  <p>• Enregistrer les paiements</p>
                  <p>• Consulter vos rapports</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
