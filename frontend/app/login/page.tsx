'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLogin } from '@/hooks/useAuth';
import { isAuthenticated } from '@/lib/auth';
import { getErrorMessage } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/FormField';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Zod validation schema
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const onSubmit = (data: LoginFormData) => {
    setError('');
    login(data, {
      onSuccess: () => {
        router.push('/dashboard');
      },
      onError: (err) => {
        setError(getErrorMessage(err));
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Assurance App
          </CardTitle>
          <CardDescription className="text-center">
            Connectez-vous à votre compte
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
              label="Email"
              name="email"
              type="email"
              placeholder="votre@email.com"
              register={register}
              error={errors.email}
              required
            />

            <FormField
              label="Mot de passe"
              name="password"
              type="password"
              placeholder="••••••••"
              register={register}
              error={errors.password}
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
