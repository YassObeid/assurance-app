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
import { useManagers, useCreateManager } from '@/hooks/useManagers';
import { useCreateUser } from '@/hooks/useUsers';
import { useRegions } from '@/hooks/useRegions';
import { getErrorMessage } from '@/lib/api';
import { RegionManager } from '@/lib/types';

// Zod validation schema - creating both User and Manager
const managerSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe doit avoir au moins 6 caractères'),
  regionId: z.string().min(1, 'Région requise'),
  startAt: z.string().optional(),
});

type ManagerFormData = z.infer<typeof managerSchema>;

export default function ManagersPage() {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const { data: managers, isLoading } = useManagers();
  const { data: regions } = useRegions();
  const createManager = useCreateManager();
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManagerFormData>({
    resolver: zodResolver(managerSchema),
  });

  const onSubmit = async (data: ManagerFormData) => {
    setError('');
    setSuccess('');
    
    try {
      // Step 1: Create the user with REGION_MANAGER role
      const userResponse = await createUser.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'REGION_MANAGER',
      });

      // Step 2: Create the manager linking user to region
      await createManager.mutateAsync({
        userId: userResponse.id,
        regionId: data.regionId,
        startAt: data.startAt,
      });

      setSuccess('Manager créé avec succès');
      reset();
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const columns = [
    {
      key: 'userId',
      header: 'User ID',
      render: (manager: RegionManager) => manager.user?.name || manager.userId,
    },
    {
      key: 'regionId',
      header: 'Région',
      render: (manager: RegionManager) => manager.region?.name || manager.regionId,
    },
    {
      key: 'startAt',
      header: 'Date début',
      render: (manager: RegionManager) => new Date(manager.startAt).toLocaleDateString('fr-FR'),
    },
    {
      key: 'endAt',
      header: 'Date fin',
      render: (manager: RegionManager) => 
        manager.endAt ? new Date(manager.endAt).toLocaleDateString('fr-FR') : 'En cours',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Managers</h1>
            <p className="text-gray-500 mt-2">
              Gérer les managers régionaux
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : 'Nouveau manager'}
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
              <CardTitle>Créer un manager</CardTitle>
              <CardDescription>
                Créer un compte utilisateur et l&apos;assigner à une région
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
                  label="Nom complet"
                  name="name"
                  placeholder="Nom du manager"
                  register={register}
                  error={errors.name}
                  required
                />

                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="manager@example.com"
                  register={register}
                  error={errors.email}
                  required
                />

                <FormField
                  label="Mot de passe"
                  name="password"
                  type="password"
                  placeholder="Minimum 6 caractères"
                  register={register}
                  error={errors.password}
                  required
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

                <FormField
                  label="Date de début"
                  name="startAt"
                  type="datetime-local"
                  register={register}
                  error={errors.startAt}
                />

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createUser.isPending || createManager.isPending}
                  >
                    {createUser.isPending || createManager.isPending ? 'Création...' : 'Créer'}
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
            <CardTitle>Liste des managers</CardTitle>
            <CardDescription>
              {managers?.length || 0} manager(s) au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={managers || []}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="Aucun manager trouvé"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
