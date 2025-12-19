'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Heart,
  Settings,
  LogOut,
  Edit2,
  Save,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const menuItems = [
  { icon: Package, label: 'My Orders', href: '/profile/orders' },
  { icon: Heart, label: 'Wishlist', href: '/wishlist' },
  { icon: MapPin, label: 'Addresses', href: '/profile/addresses' },
  { icon: Settings, label: 'Settings', href: '/profile/settings' },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
    }
  }, [session]);

  const handleSave = () => {
    // In production, you would save this to the database
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
            >
              {/* User Info */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <User className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {session.user.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {session.user.email}
                </p>
                {session.user.role === 'admin' && (
                  <span className="mt-2 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                    Admin
                  </span>
                )}
              </div>

              {/* Menu */}
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                {session.user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-purple-600 transition-colors hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                  >
                    <Settings className="h-5 w-5" />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </nav>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
            >
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Profile Information
                </h1>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave}>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      leftIcon={<User className="h-4 w-4" />}
                    />
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {session.user.name}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {session.user.email}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      leftIcon={<Phone className="h-4 w-4" />}
                    />
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400">
                        {phone || 'Not provided'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Account Type
                  </label>
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
                    <Settings className="h-5 w-5 text-gray-400" />
                    <span className="capitalize text-gray-900 dark:text-white">
                      {session.user.role}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
              >
                <Package className="mb-4 h-8 w-8 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">0</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
              >
                <Heart className="mb-4 h-8 w-8 text-red-500" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">0</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Wishlist Items</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
              >
                <MapPin className="mb-4 h-8 w-8 text-green-500" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">0</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Saved Addresses</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
