'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable } from '@/components/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/FormField';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRegions, useCreateRegion } from '@/hooks/useRegions';
import { getErrorMessage } from '@/lib/api';
import { Region } from '@/lib/types';

// Zod validation schema
const regionSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
});

type RegionFormData = z.infer<typeof regionSchema>;

export default function RegionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const { data: regions, isLoading } = useRegions();
  const createRegion = useCreateRegion();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegionFormData>({
    resolver: zodResolver(regionSchema),
  });

  const onSubmit = (data: RegionFormData) => {
    setError('');
    setSuccess('');
    createRegion.mutate(data, {
      onSuccess: () => {
        setSuccess('Région créée avec succès');
        reset();
        setShowForm(false);
        setTimeout(() => setSuccess(''), 3000);
      },
      onError: (err) => {
        setError(getErrorMessage(err));
      },
    });
  };

  const columns = [
    { key: 'name', header: 'Nom' },
    {
      key: 'createdAt',
      header: 'Date de création',
      render: (region: Region) => new Date(region.createdAt).toLocaleDateString('fr-FR'),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Régions</h1>
            <p className="text-gray-500 mt-2">
              Gérer les régions de l&apos;organisation
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : 'Nouvelle région'}
          </Button>
        </div>

        {success && (
          <Alert variant="success">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Créer une région</CardTitle>
              <CardDescription>
                Ajoutez une nouvelle région à l&apos;organisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  label="Nom de la région"
                  name="name"
                  placeholder="Ex: Nord, Sud, Centre..."
                  register={register}
                  error={errors.name}
                  required
                />

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createRegion.isPending}
                  >
                    {createRegion.isPending ? 'Création...' : 'Créer'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      reset();
                      setError('');
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Liste des régions</CardTitle>
            <CardDescription>
              {regions?.length || 0} région(s) au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={regions || []}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="Aucune région trouvée"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
