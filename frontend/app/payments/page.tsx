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
import { usePayments, useCreatePayment } from '@/hooks/usePayments';
import { useMembers } from '@/hooks/useMembers';
import { getErrorMessage } from '@/lib/api';
import { Payment } from '@/lib/types';
import { isDelegate } from '@/lib/auth';

// Zod validation schema
const paymentSchema = z.object({
  memberId: z.string().min(1, 'Membre requis'),
  amount: z.string().min(1, 'Montant requis'),
  paidAt: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function PaymentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const { data: payments, isLoading } = usePayments();
  const { data: members } = useMembers();
  const createPayment = useCreatePayment();
  const canCreate = isDelegate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const onSubmit = (data: PaymentFormData) => {
    setError('');
    setSuccess('');
    
    const payload = {
      memberId: data.memberId,
      amount: parseFloat(data.amount),
      paidAt: data.paidAt || undefined,
    };

    createPayment.mutate(payload, {
      onSuccess: () => {
        setSuccess('Paiement enregistré avec succès');
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
    {
      key: 'memberId',
      header: 'Membre',
      render: (payment: Payment) => payment.member?.fullName || payment.memberId,
    },
    {
      key: 'amount',
      header: 'Montant',
      render: (payment: Payment) => `${payment.amount} MAD`,
    },
    {
      key: 'paidAt',
      header: 'Date de paiement',
      render: (payment: Payment) => new Date(payment.paidAt).toLocaleDateString('fr-FR'),
    },
    {
      key: 'delegateId',
      header: 'Délégué',
      render: (payment: Payment) => payment.delegate?.name || '-',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Paiements</h1>
            <p className="text-gray-500 mt-2">
              Gérer les paiements des membres
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Annuler' : 'Nouveau paiement'}
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
              <CardTitle>Enregistrer un paiement</CardTitle>
              <CardDescription>
                Ajouter un nouveau paiement pour un membre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="memberId">
                    Membre <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <select
                    id="memberId"
                    {...register('memberId')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un membre</option>
                    {members?.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.fullName} ({member.cin})
                      </option>
                    ))}
                  </select>
                  {errors.memberId && (
                    <p className="text-sm text-red-500">{errors.memberId.message}</p>
                  )}
                </div>

                <FormField
                  label="Montant (MAD)"
                  name="amount"
                  type="number"
                  placeholder="Ex: 1000"
                  register={register}
                  error={errors.amount}
                  required
                />

                <FormField
                  label="Date de paiement"
                  name="paidAt"
                  type="datetime-local"
                  register={register}
                  error={errors.paidAt}
                />

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createPayment.isPending}
                  >
                    {createPayment.isPending ? 'Enregistrement...' : 'Enregistrer'}
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
            <CardTitle>Liste des paiements</CardTitle>
            <CardDescription>
              {payments?.length || 0} paiement(s) au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={payments || []}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="Aucun paiement trouvé"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
