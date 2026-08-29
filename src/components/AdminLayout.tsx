import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Users, BookOpen, CreditCard, LayoutDashboard, FileText, UserPlus, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminLayout() {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Enquiries', path: '/enquiries', icon: UserPlus },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Fees & Invoices', path: '/fees', icon: CreditCard },
    { name: 'Joining List', path: '/joining-list', icon: FileSpreadsheet },
    { name: 'Certificates', path: '/certificates', icon: FileText },
    { name: 'Generator', path: '/certificate-generator', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pixelwind</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Admin Portal</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-700 dark:text-blue-200" : "text-gray-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {profile?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{profile?.full_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
