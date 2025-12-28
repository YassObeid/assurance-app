'use client';

// Sidebar navigation component with role-based menu
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role } from '@/lib/types';
import { getUserRole } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  href: string;
  roles: Role[];
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', href: '/dashboard', roles: [Role.GM, Role.REGION_MANAGER, Role.DELEGATE] },
  { label: 'Régions', href: '/regions', roles: [Role.GM] },
  { label: 'Managers', href: '/managers', roles: [Role.GM] },
  { label: 'Délégués', href: '/delegates', roles: [Role.GM, Role.REGION_MANAGER, Role.DELEGATE] },
  { label: 'Membres', href: '/members', roles: [Role.GM, Role.REGION_MANAGER, Role.DELEGATE] },
  { label: 'Paiements', href: '/payments', roles: [Role.GM, Role.REGION_MANAGER, Role.DELEGATE] },
  { label: 'Rapports', href: '/reports', roles: [Role.GM, Role.REGION_MANAGER, Role.DELEGATE] },
];

export function Sidebar() {
  const pathname = usePathname();
  const userRole = getUserRole();

  const visibleItems = menuItems.filter((item) =>
    userRole ? item.roles.includes(userRole) : false
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-blue-600">Assurance App</h2>
      </div>
      <nav className="px-3">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 mb-1 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
