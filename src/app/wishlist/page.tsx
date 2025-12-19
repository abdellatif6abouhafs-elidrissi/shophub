'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ShoppingBag,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/format';
import toast from 'react-hot-toast';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  stock?: number;
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    // Load wishlist from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wishlist');
      console.log('Wishlist from localStorage:', saved);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          console.log('Parsed wishlist:', parsed);
          setWishlistItems(parsed);
        } catch (e) {
          console.error('Error parsing wishlist:', e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  const removeFromWishlist = (id: string) => {
    const updated = wishlistItems.filter((item) => item.id !== id);
    setWishlistItems(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    toast.success('Removed from wishlist');
  };

  const moveToCart = (item: WishlistItem) => {
    addItem({
      productId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      stock: item.stock || 99,
      quantity: 1,
    });
    removeFromWishlist(item.id);
    toast.success('Moved to cart');
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.removeItem('wishlist');
    toast.success('Wishlist cleared');
  };

  // Show loading while checking localStorage
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Your Wishlist is Empty
            </h1>
            <p className="mb-8 text-gray-600 dark:text-gray-400">
              Save your favorite items here to buy later.
            </p>
            <Link href="/products">
              <Button size="lg">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Browse Products
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Wishlist
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {wishlistItems.length} items saved
            </p>
          </div>
          <button
            onClick={clearWishlist}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
          >
            Clear All
          </button>
        </div>

        {/* Wishlist Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {wishlistItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group rounded-xl bg-white shadow-sm dark:bg-gray-900"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden rounded-t-xl">
                <Link href={`/products/${item.slug}`}>
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <ShoppingBag className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </Link>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute right-2 top-2 rounded-full bg-white p-2 shadow-md transition-colors hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/30"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <Link href={`/products/${item.slug}`}>
                  <h3 className="mb-2 font-medium text-gray-900 hover:text-blue-600 dark:text-white">
                    {item.name}
                  </h3>
                </Link>
                <p className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                  {formatPrice(item.price)}
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => moveToCart(item)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
