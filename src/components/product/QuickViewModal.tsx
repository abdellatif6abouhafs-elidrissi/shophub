'use client';

import { useState, useEffect, Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  ExternalLink,
  Check,
  ShoppingBag,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/format';
import { IProduct } from '@/types';
import toast from 'react-hot-toast';

interface QuickViewModalProps {
  product: IProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCartStore();

  // Reset state when modal opens with new product
  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setQuantity(1);
      // Check wishlist status
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('wishlist');
          if (saved) {
            const wishlist = JSON.parse(saved);
            const found = wishlist.some((item: { id: string }) => item.id === product._id);
            setIsWishlisted(found);
          }
        } catch (e) {
          console.error('Error reading wishlist:', e);
        }
      }
    }
  }, [product]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleWishlist = () => {
    if (!product || typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem('wishlist');
      let wishlist: Array<{ id: string; name: string; price: number; image: string; slug: string; stock: number }> = [];

      if (saved) {
        wishlist = JSON.parse(saved);
      }

      if (isWishlisted) {
        wishlist = wishlist.filter((item) => item.id !== product._id);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        const newItem = {
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.images[0] || '',
          slug: product.slug,
          stock: product.stock,
        };
        wishlist.push(newItem);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        setIsWishlisted(true);
        toast.success('Added to wishlist!');
      }
    } catch (e) {
      console.error('Error updating wishlist:', e);
      toast.error('Failed to update wishlist');
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      stock: product.stock,
      quantity,
    });

    toast.success(`${product.name} added to cart!`);
    onClose();
  };

  if (!product) return null;

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 p-4"
          >
            <div className="relative max-h-[90vh] overflow-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow-md transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>

              <div className="grid gap-6 p-6 md:grid-cols-2">
                {/* Images Section */}
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                    {product.images.length > 0 ? (
                      <Image
                        src={product.images[selectedImage] || '/placeholder.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    {discount > 0 && (
                      <Badge className="absolute left-3 top-3" variant="danger">
                        -{discount}%
                      </Badge>
                    )}
                  </div>

                  {/* Thumbnail Images */}
                  {product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                            selectedImage === index
                              ? 'border-blue-600'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                  {/* Brand & Title */}
                  <div className="mb-3">
                    {product.brand && (
                      <p className="mb-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                        {product.brand}
                      </p>
                    )}
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {product.name}
                    </h2>
                  </div>

                  {/* Rating */}
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.ratings?.average || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({product.ratings?.count || 0} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-4 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(product.price)}
                    </span>
                    {product.comparePrice && (
                      <span className="text-lg text-gray-500 line-through dark:text-gray-400">
                        {formatPrice(product.comparePrice)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mb-4 line-clamp-3 text-gray-600 dark:text-gray-400">
                    {product.description}
                  </p>

                  {/* Stock Status */}
                  <div className="mb-4 flex items-center gap-2">
                    {product.stock > 0 ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400">
                          In Stock ({product.stock} available)
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-red-600 dark:text-red-400">Out of Stock</span>
                    )}
                  </div>

                  {/* Quantity Selector */}
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Quantity:
                    </span>
                    <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-600">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto space-y-3">
                    <div className="flex gap-3">
                      <Button
                        size="lg"
                        className="flex-1"
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={toggleWishlist}
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            isWishlisted ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                      </Button>
                    </div>

                    {/* View Full Details Link */}
                    <Link href={`/products/${product.slug}`} onClick={onClose}>
                      <Button variant="secondary" className="w-full">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Full Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
