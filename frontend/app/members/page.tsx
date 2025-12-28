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
import { useMembers, useCreateMember } from '@/hooks/useMembers';
import { getErrorMessage } from '@/lib/api';
import { Member } from '@/lib/types';
import { isDelegate } from '@/lib/auth';

// Zod validation schema
const memberSchema = z.object({
  cin: z.string().min(1, 'CIN requis'),
  fullName: z.string().min(1, 'Nom complet requis'),
  status: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

export default function MembersPage() {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const { data: members, isLoading } = useMembers();
  const createMember = useCreateMember();
  const canCreate = isDelegate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      status: 'ACTIVE',
    },
  });

  const onSubmit = (data: MemberFormData) => {
    setError('');
    setSuccess('');
    createMember.mutate(data, {
      onSuccess: () => {
        setSuccess('Membre créé avec succès');
        reset({ status: 'ACTIVE' });
        setShowForm(false);
        setTimeout(() => setSuccess(''), 3000);
      },
      onError: (err) => {
        setError(getErrorMessage(err));
      },
    });
  };

  const columns = [
    { key: 'cin', header: 'CIN' },
    { key: 'fullName', header: 'Nom complet' },
    { key: 'status', header: 'Statut' },
    {
      key: 'createdAt',
      header: 'Date de création',
      render: (member: Member) => new Date(member.createdAt).toLocaleDateString('fr-FR'),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Membres</h1>
            <p className="text-gray-500 mt-2">
              Gérer les membres de l&apos;organisation
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Annuler' : 'Nouveau membre'}
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
              <CardTitle>Créer un membre</CardTitle>
              <CardDescription>
                Ajouter un nouveau membre à votre liste
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
                  label="CIN"
                  name="cin"
                  placeholder="Ex: AB123456"
                  register={register}
                  error={errors.cin}
                  required
                />

                <FormField
                  label="Nom complet"
                  name="fullName"
                  placeholder="Prénom et nom"
                  register={register}
                  error={errors.fullName}
                  required
                />

                <FormField
                  label="Statut"
                  name="status"
                  placeholder="ACTIVE, INACTIVE..."
                  register={register}
                  error={errors.status}
                />

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createMember.isPending}
                  >
                    {createMember.isPending ? 'Création...' : 'Créer'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      reset({ status: 'ACTIVE' });
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
            <CardTitle>Liste des membres</CardTitle>
            <CardDescription>
              {members?.length || 0} membre(s) au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={members || []}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="Aucun membre trouvé"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
