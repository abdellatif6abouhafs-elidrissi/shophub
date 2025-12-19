'use client';

import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trash2,
  ShoppingCart,
  Star,
  Check,
  Minus,
  GitCompare,
  ShoppingBag,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCompare } from '@/context/CompareContext';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/format';
import toast from 'react-hot-toast';

export default function CompareDrawer() {
  const { compareItems, removeFromCompare, clearCompare, isCompareOpen, closeCompare } = useCompare();
  const { addItem } = useCartStore();

  const handleAddToCart = (product: typeof compareItems[0]) => {
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '',
      stock: product.stock,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart`);
  };

  // Get all unique specification keys
  const specKeys = ['Brand', 'Price', 'Rating', 'Stock', 'Description'];

  return (
    <AnimatePresence>
      {isCompareOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCompare}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-5xl overflow-hidden bg-white shadow-2xl dark:bg-gray-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <GitCompare className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Compare Products ({compareItems.length}/4)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {compareItems.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearCompare}>
                    <Trash2 className="mr-1 h-4 w-4" />
                    Clear All
                  </Button>
                )}
                <button
                  onClick={closeCompare}
                  className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="h-[calc(100vh-80px)] overflow-auto p-6">
              {compareItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <GitCompare className="mb-4 h-16 w-16 text-gray-300" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    No Products to Compare
                  </h3>
                  <p className="mb-6 text-gray-500 dark:text-gray-400">
                    Add products to compare their features side by side
                  </p>
                  <Button onClick={closeCompare}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    {/* Product Images & Names */}
                    <thead>
                      <tr>
                        <th className="w-40 p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                          Product
                        </th>
                        {compareItems.map((product) => (
                          <th key={product._id} className="p-4 text-center">
                            <div className="relative">
                              <button
                                onClick={() => removeFromCompare(product._id)}
                                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <Link href={`/products/${product.slug}`} onClick={closeCompare}>
                                <div className="mx-auto mb-3 h-32 w-32 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                  {product.images[0] ? (
                                    <Image
                                      src={product.images[0]}
                                      alt={product.name}
                                      width={128}
                                      height={128}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <ShoppingBag className="h-8 w-8 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 hover:text-blue-600 dark:text-white">
                                  {product.name}
                                </h3>
                              </Link>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {/* Price Row */}
                      <tr className="bg-gray-50 dark:bg-gray-800/50">
                        <td className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Price
                        </td>
                        {compareItems.map((product) => (
                          <td key={product._id} className="p-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatPrice(product.price)}
                              </span>
                              {product.comparePrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(product.comparePrice)}
                                </span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Brand Row */}
                      <tr>
                        <td className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Brand
                        </td>
                        {compareItems.map((product) => (
                          <td key={product._id} className="p-4 text-center text-sm text-gray-900 dark:text-white">
                            {product.brand || <Minus className="mx-auto h-4 w-4 text-gray-300" />}
                          </td>
                        ))}
                      </tr>

                      {/* Rating Row */}
                      <tr className="bg-gray-50 dark:bg-gray-800/50">
                        <td className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Rating
                        </td>
                        {compareItems.map((product) => (
                          <td key={product._id} className="p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {product.ratings?.average?.toFixed(1) || 'N/A'}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({product.ratings?.count || 0})
                              </span>
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Stock Row */}
                      <tr>
                        <td className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Availability
                        </td>
                        {compareItems.map((product) => (
                          <td key={product._id} className="p-4 text-center">
                            {product.stock > 0 ? (
                              <span className="inline-flex items-center gap-1 text-sm text-green-600">
                                <Check className="h-4 w-4" />
                                In Stock ({product.stock})
                              </span>
                            ) : (
                              <span className="text-sm text-red-500">Out of Stock</span>
                            )}
                          </td>
                        ))}
                      </tr>

                      {/* Description Row */}
                      <tr className="bg-gray-50 dark:bg-gray-800/50">
                        <td className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Description
                        </td>
                        {compareItems.map((product) => (
                          <td key={product._id} className="p-4 text-center">
                            <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                              {product.description}
                            </p>
                          </td>
                        ))}
                      </tr>

                      {/* Add to Cart Row */}
                      <tr>
                        <td className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Action
                        </td>
                        {compareItems.map((product) => (
                          <td key={product._id} className="p-4 text-center">
                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock === 0}
                            >
                              <ShoppingCart className="mr-1 h-4 w-4" />
                              Add to Cart
                            </Button>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
