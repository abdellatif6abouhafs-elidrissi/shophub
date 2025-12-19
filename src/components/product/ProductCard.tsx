'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye, GitCompare } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useQuickView } from '@/context/QuickViewContext';
import { useCompare } from '@/context/CompareContext';
import { formatPrice, getDiscountPercentage } from '@/utils/format';
import { IProduct } from '@/types';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { openQuickView } = useQuickView();
  const { addToCompare, isInCompare } = useCompare();

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCompare(product);
  };

  const discount = product.comparePrice
    ? getDiscountPercentage(product.price, product.comparePrice)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '',
      stock: product.stock,
    });

    toast.success('Added to cart');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-lg dark:bg-gray-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {discount > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                -{discount}%
              </span>
            )}
            {product.isFeatured && (
              <span className="rounded-full bg-blue-500 px-2 py-1 text-xs font-semibold text-white">
                Featured
              </span>
            )}
            {product.stock <= 0 && (
              <span className="rounded-full bg-gray-800 px-2 py-1 text-xs font-semibold text-white">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute right-3 top-3 flex flex-col gap-2"
          >
            <button
              onClick={handleWishlist}
              className={`rounded-full bg-white p-2 shadow-md transition-colors ${
                isWishlisted
                  ? 'text-red-500'
                  : 'text-gray-600 hover:text-red-500'
              } dark:bg-gray-800`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleQuickView}
              className="rounded-full bg-white p-2 text-gray-600 shadow-md transition-colors hover:text-blue-500 dark:bg-gray-800"
              title="Quick View"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={handleCompare}
              className={`rounded-full bg-white p-2 shadow-md transition-colors dark:bg-gray-800 ${
                isInCompare(product._id)
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
              title="Compare"
            >
              <GitCompare className="h-4 w-4" />
            </button>
          </motion.div>

          {/* Add to Cart Button */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: isHovered ? 0 : '100%' }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 right-0 p-3"
          >
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <ShoppingCart className="h-4 w-4" />
              {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          {typeof product.category === 'object' && product.category && (
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {(product.category as { name: string }).name}
            </p>
          )}

          {/* Name */}
          <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="mb-2 flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(product.ratings.average)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({product.ratings.count})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-gray-500 line-through dark:text-gray-400">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
