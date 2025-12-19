'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Plus,
  Trash2,
  Edit,
  Loader2,
  CheckCircle,
  XCircle,
  Percent,
  DollarSign,
  Calendar,
  Copy,
  X,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import toast from 'react-hot-toast';

interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

async function fetchCoupons(status?: string) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  const res = await fetch(`/api/coupons?${params.toString()}`);
  const data = await res.json();
  return data;
}

export default function AdminCouponsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons', statusFilter],
    queryFn: () => fetchCoupons(statusFilter),
    enabled: status === 'authenticated' && session?.user?.role === 'admin',
  });

  const createMutation = useMutation({
    mutationFn: async (couponData: any) => {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create coupon');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Coupon created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setShowCreateModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create coupon');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const responseData = await res.json();
        throw new Error(responseData.error || 'Failed to update coupon');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Coupon updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setEditingCoupon(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update coupon');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete coupon');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Coupon deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: () => {
      toast.error('Failed to delete coupon');
    },
  });

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minPurchase: '',
      maxDiscount: '',
      usageLimit: '',
      startDate: '',
      endDate: '',
      isActive: true,
    });
  };

  const openEditModal = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minPurchase: coupon.minPurchase.toString(),
      maxDiscount: coupon.maxDiscount?.toString() || '',
      usageLimit: coupon.usageLimit.toString(),
      startDate: new Date(coupon.startDate).toISOString().split('T')[0],
      endDate: new Date(coupon.endDate).toISOString().split('T')[0],
      isActive: coupon.isActive,
    });
    setEditingCoupon(coupon);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const couponData = {
      code: formData.code,
      description: formData.description,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      minPurchase: parseFloat(formData.minPurchase) || 0,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
      usageLimit: parseInt(formData.usageLimit) || 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: formData.isActive,
    };

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon._id, data: couponData });
    } else {
      createMutation.mutate(couponData);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const getCouponStatus = (coupon: Coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (!coupon.isActive) return { status: 'inactive', color: 'gray' };
    if (now < startDate) return { status: 'scheduled', color: 'blue' };
    if (now > endDate) return { status: 'expired', color: 'red' };
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return { status: 'exhausted', color: 'orange' };
    }
    return { status: 'active', color: 'green' };
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    router.push('/login');
    return null;
  }

  const coupons: Coupon[] = data?.data || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Coupon Management
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Create and manage discount coupons
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Coupon
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Coupons' },
              { value: 'active', label: 'Active' },
              { value: 'expired', label: 'Expired / Inactive' },
            ]}
          />
        </div>

        {/* Coupons List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-12 text-center">
            <Tag className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              No Coupons Found
            </h3>
            <p className="mb-4 text-gray-500 dark:text-gray-400">
              Create your first coupon to offer discounts to customers
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Coupon
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {coupons.map((coupon) => {
              const { status: couponStatus, color } = getCouponStatus(coupon);

              return (
                <motion.div
                  key={coupon._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
                >
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyCode(coupon.code)}
                        className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 font-mono text-lg font-bold text-gray-900 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                      >
                        {coupon.code}
                        <Copy className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        color === 'green'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : color === 'red'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : color === 'blue'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : color === 'orange'
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {couponStatus.charAt(0).toUpperCase() + couponStatus.slice(1)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    {coupon.description}
                  </p>

                  {/* Discount */}
                  <div className="mb-4 flex items-center gap-2">
                    {coupon.discountType === 'percentage' ? (
                      <div className="flex items-center gap-1 rounded-lg bg-purple-100 px-3 py-1 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        <Percent className="h-4 w-4" />
                        <span className="font-bold">{coupon.discountValue}% OFF</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-bold">${coupon.discountValue} OFF</span>
                      </div>
                    )}
                    {coupon.minPurchase > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Min. ${coupon.minPurchase}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Usage</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {coupon.usedCount} / {coupon.usageLimit || '∞'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Valid Until</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(coupon.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditModal(coupon)}
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this coupon?')) {
                          deleteMutation.mutate(coupon._id);
                        }
                      }}
                      className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingCoupon) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCreateModal(false);
                setEditingCoupon(null);
                resetForm();
              }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4"
            >
              <div className="max-h-[90vh] overflow-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingCoupon(null);
                      resetForm();
                    }}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Code *</label>
                      <Input
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="SAVE20"
                        className="uppercase"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Discount Type *</label>
                      <Select
                        value={formData.discountType}
                        onChange={(value) => setFormData({ ...formData, discountType: value as 'percentage' | 'fixed' })}
                        options={[
                          { value: 'percentage', label: 'Percentage' },
                          { value: 'fixed', label: 'Fixed Amount' },
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Description *</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Get 20% off your order"
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Discount Value * {formData.discountType === 'percentage' ? '(%)' : '($)'}
                      </label>
                      <Input
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        placeholder={formData.discountType === 'percentage' ? '20' : '10'}
                        min="0"
                        max={formData.discountType === 'percentage' ? '100' : undefined}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Min. Purchase ($)</label>
                      <Input
                        type="number"
                        value={formData.minPurchase}
                        onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Max Discount ($)</label>
                      <Input
                        type="number"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                        placeholder="Optional"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Usage Limit</label>
                      <Input
                        type="number"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                        placeholder="0 = Unlimited"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Start Date *</label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">End Date *</label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                    <label htmlFor="isActive" className="text-sm">Active</label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingCoupon(null);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {(createMutation.isPending || updateMutation.isPending) ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
