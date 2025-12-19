'use client';

import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, X, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/utils/format';

export default function RecentlyViewed() {
  const { recentProducts, clearAll, isLoaded } = useRecentlyViewed();

  if (!isLoaded || recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recently Viewed
            </h2>
          </div>
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 dark:text-gray-400"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {recentProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0"
            >
              <Link
                href={`/products/${product.slug}`}
                className="group block w-40"
              >
                <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <h3 className="truncate text-sm font-medium text-gray-900 group-hover:text-blue-600 dark:text-white">
                  {product.name}
                </h3>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatPrice(product.price)}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
