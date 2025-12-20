'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Settings,
  BarChart3,
  LogOut,
  Tag,
  Bell,
  RefreshCcw,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import NotificationBell from '@/components/notifications/NotificationBell';
import { AdminGuard } from '@/components/auth';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/refunds', label: 'Refunds', icon: RefreshCcw },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSidebarOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const currentPage = sidebarLinks.find((link) =>
    pathname === link.href ||
    (link.href !== '/admin' && pathname.startsWith(link.href))
  )?.label || 'Dashboard';

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
        {/* Mobile Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-0 z-50 h-screen border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 ${
            isCollapsed ? 'w-20' : 'w-64'
          } ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
        >
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
            <Link href="/admin" className="flex items-center space-x-2">
              <img src="/icon.svg" alt="ShopHub" className="h-8 w-8 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-600">
                  Admin
                </span>
              )}
            </Link>
            {/* Close button (mobile) */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
            {/* Collapse button (desktop) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:block"
            >
              <ChevronLeft className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 overflow-y-auto p-3" style={{ height: 'calc(100vh - 180px)' }}>
            {sidebarLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/admin' && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={isCollapsed ? link.label : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <link.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{link.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-3 dark:border-gray-800">
            {!isCollapsed && (
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                  <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {session?.user?.name || 'Admin'}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {session?.user?.email || ''}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              title={isCollapsed ? 'Sign out' : undefined}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span>Sign out</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          {/* Top Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/80 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                {currentPage}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <NotificationBell isAdmin />
              <Link
                href="/"
                className="hidden text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white sm:block"
              >
                View Store
              </Link>
            </div>
          </header>
          <div className="min-h-screen p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </AdminGuard>
  );
}
