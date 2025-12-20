'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Upload,
  Loader2,
  Trash2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: { _id: string; name: string } | string;
  brand?: string;
  stock: number;
  sku?: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
}

async function fetchCategories(): Promise<{ success: boolean; data: Category[] }> {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

async function fetchProduct(id: string): Promise<{ success: boolean; data: Product }> {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

async function updateProduct(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error || 'Failed to update product');
  return result;
}

async function deleteProduct(id: string) {
  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error || 'Failed to delete product');
  return result;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    category: '',
    brand: '',
    stock: '',
    sku: '',
    images: [] as string[],
    isActive: true,
    isFeatured: false,
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: productData, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId),
    enabled: !!productId,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Populate form when product data loads
  useEffect(() => {
    if (productData?.data) {
      const product = productData.data;
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        comparePrice: product.comparePrice?.toString() || '',
        category: typeof product.category === 'object' ? product.category._id : product.category || '',
        brand: product.brand || '',
        stock: product.stock?.toString() || '',
        sku: product.sku || '',
        images: product.images || [],
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
      });
    }
  }, [productData]);

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => updateProduct(productId, data),
    onSuccess: () => {
      toast.success('Product updated successfully');
      router.push('/admin/products');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(productId),
    onSuccess: () => {
      toast.success('Product deleted successfully');
      router.push('/admin/products');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
      category: formData.category,
      brand: formData.brand,
      stock: parseInt(formData.stock) || 0,
      sku: formData.sku,
      images: formData.images,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
    };

    updateMutation.mutate(productData);
  };

  const addImage = () => {
    if (newImageUrl && !formData.images.includes(newImageUrl)) {
      setFormData({
        ...formData,
        images: [...formData.images, newImageUrl],
      });
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const categories = categoriesData?.data || [];

  if (productLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (productError || !productData?.data) {
    return (
      <div className="text-center">
        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          Product Not Found
        </h2>
        <p className="mb-4 text-gray-500">
          The product you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/admin/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Product
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Update product details
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            className="text-red-600 hover:bg-red-50 dark:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
            >
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Product Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Describe your product..."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Brand
                    </label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Brand name"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      SKU
                    </label>
                    <Input
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="Stock keeping unit"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
            >
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Pricing
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price ($) *
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Compare Price ($)
                  </label>
                  <Input
                    type="number"
                    value={formData.comparePrice}
                    onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Original price for showing discounts
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Images */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
            >
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Product Images
              </h2>

              <div className="mb-4 flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                  className="flex-1"
                />
                <Button type="button" onClick={addImage} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="group relative aspect-square">
                      <Image
                        src={image}
                        alt={`Product ${index + 1}`}
                        fill
                        className="rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 rounded bg-blue-600 px-2 py-0.5 text-xs text-white">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                  <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add image URLs to display product photos
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
            >
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Status
              </h2>

              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Active (visible in store)
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Featured product
                  </span>
                </label>
              </div>
            </motion.div>

            {/* Organization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
            >
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Organization
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Stock Quantity
                  </label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <Button
                type="submit"
                className="w-full"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>

              <Link href="/admin/products" className="block">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Delete Product
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Are you sure you want to delete &quot;{formData.name}&quot;? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Product'
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
