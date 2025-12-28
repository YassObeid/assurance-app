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
import { Label } from '@/components/ui/label';
import { useDelegates, useCreateDelegate } from '@/hooks/useDelegates';
import { useRegions } from '@/hooks/useRegions';
import { useManagers } from '@/hooks/useManagers';
import { getErrorMessage } from '@/lib/api';
import { Delegate } from '@/lib/types';
import { isGM } from '@/lib/auth';

// Zod validation schema
const delegateSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  phone: z.string().optional(),
  regionId: z.string().min(1, 'Région requise'),
  managerId: z.string().min(1, 'Manager requis'),
  userId: z.string().optional(),
});

type DelegateFormData = z.infer<typeof delegateSchema>;

export default function DelegatesPage() {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const { data: delegates, isLoading } = useDelegates();
  const { data: regions } = useRegions();
  const { data: managers } = useManagers();
  const createDelegate = useCreateDelegate();
  const canCreate = isGM();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DelegateFormData>({
    resolver: zodResolver(delegateSchema),
  });

  const onSubmit = (data: DelegateFormData) => {
    setError('');
    setSuccess('');
    createDelegate.mutate(data, {
      onSuccess: () => {
        setSuccess('Délégué créé avec succès');
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
    { key: 'phone', header: 'Téléphone' },
    {
      key: 'regionId',
      header: 'Région',
      render: (delegate: Delegate) => delegate.region?.name || delegate.regionId,
    },
    {
      key: 'createdAt',
      header: 'Date de création',
      render: (delegate: Delegate) => new Date(delegate.createdAt).toLocaleDateString('fr-FR'),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Délégués</h1>
            <p className="text-gray-500 mt-2">
              Gérer les délégués de l&apos;organisation
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Annuler' : 'Nouveau délégué'}
            </Button>
          )}
        </div>

        {success && (
          <Alert variant="success">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {showForm && canCreate && (
          <Card>
            <CardHeader>
              <CardTitle>Créer un délégué</CardTitle>
              <CardDescription>
                Ajouter un nouveau délégué à l&apos;organisation
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
                  label="Nom"
                  name="name"
                  placeholder="Nom du délégué"
                  register={register}
                  error={errors.name}
                  required
                />

                <FormField
                  label="Téléphone"
                  name="phone"
                  type="tel"
                  placeholder="+212 6XX XXX XXX"
                  register={register}
                  error={errors.phone}
                />

                <div className="space-y-2">
                  <Label htmlFor="regionId">
                    Région <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <select
                    id="regionId"
                    {...register('regionId')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une région</option>
                    {regions?.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                  {errors.regionId && (
                    <p className="text-sm text-red-500">{errors.regionId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="managerId">
                    Manager <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <select
                    id="managerId"
                    {...register('managerId')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un manager</option>
                    {managers?.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.user?.name || manager.userId} - {manager.region?.name || manager.regionId}
                      </option>
                    ))}
                  </select>
                  {errors.managerId && (
                    <p className="text-sm text-red-500">{errors.managerId.message}</p>
                  )}
                </div>

                <FormField
                  label="User ID (optionnel)"
                  name="userId"
                  placeholder="ID utilisateur pour l'accès"
                  register={register}
                  error={errors.userId}
                />

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createDelegate.isPending}
                  >
                    {createDelegate.isPending ? 'Création...' : 'Créer'}
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
            <CardTitle>Liste des délégués</CardTitle>
            <CardDescription>
              {delegates?.length || 0} délégué(s) au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={delegates || []}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="Aucun délégué trouvé"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
