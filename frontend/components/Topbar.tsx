'use client';

// Topbar component with user info and logout
import { getCurrentUser } from '@/lib/auth';
import { useLogout } from '@/hooks/useAuth';
import { Button } from './ui/button';

export function Topbar() {
  const user = getCurrentUser();
  const logout = useLogout();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-gray-800">
          Gestion d&apos;Assurance
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{user.email}</p>
              <p className="text-xs text-gray-500">
                {user.role === 'GM' && 'General Manager'}
                {user.role === 'REGION_MANAGER' && 'Region Manager'}
                {user.role === 'DELEGATE' && 'Délégué'}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {user.email.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
        >
          Déconnexion
        </Button>
      </div>
    </header>
  );
}
