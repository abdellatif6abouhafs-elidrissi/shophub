'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Minus,
  Plus,
  Truck,
  Shield,
  RefreshCw,
  ChevronRight,
  Check,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProductCard from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/format';
import { IProduct } from '@/types';
import toast from 'react-hot-toast';

async function fetchProduct(slug: string): Promise<IProduct | null> {
  const res = await fetch(`/api/products/${slug}`);
  const data = await res.json();
  return data.success ? data.data : null;
}

async function fetchRelatedProducts(categoryId: string, excludeId: string): Promise<IProduct[]> {
  const res = await fetch(`/api/products?category=${categoryId}&limit=4`);
  const data = await res.json();
  return (data.data || []).filter((p: IProduct) => p._id !== excludeId);
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { addItem } = useCartStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug),
    enabled: !!slug,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['related-products', product?.category],
    queryFn: () => fetchRelatedProducts(product?.category as string, product?._id as string),
    enabled: !!product?.category,
  });

  // Check if product is in wishlist on load (client-side only)
  useEffect(() => {
    if (product && typeof window !== 'undefined') {
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
  }, [product]);

  const toggleWishlist = () => {
    if (!product) {
      console.log('No product');
      return;
    }

    if (typeof window === 'undefined') {
      console.log('No window');
      return;
    }

    try {
      const saved = localStorage.getItem('wishlist');
      let wishlist: Array<{ id: string; name: string; price: number; image: string; slug: string; stock: number }> = [];

      if (saved) {
        wishlist = JSON.parse(saved);
      }

      if (isWishlisted) {
        // Remove from wishlist
        wishlist = wishlist.filter((item) => item.id !== product._id);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
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

      console.log('Wishlist updated:', wishlist);
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
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="aspect-square rounded-2xl bg-gray-200 dark:bg-gray-800" />
              <div className="space-y-4">
                <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-6 w-1/4 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-24 rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Product Not Found
          </h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <Link href="/products" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            Products
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-white dark:bg-gray-900">
              <Image
                src={product.images[selectedImage] || '/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {discount > 0 && (
                <Badge className="absolute left-4 top-4" variant="danger">
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 transition-colors ${
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
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Brand & Title */}
            <div>
              {product.brand && (
                <p className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                  {product.brand}
                </p>
              )}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.ratings?.average || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {product.ratings?.average?.toFixed(1)} ({product.ratings?.count} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-xl text-gray-500 line-through dark:text-gray-400">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {product.description}
            </p>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">
                    In Stock ({product.stock} available)
                  </span>
                </>
              ) : (
                <span className="text-red-600 dark:text-red-400">Out of Stock</span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
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
                <span className="w-12 text-center font-medium">{quantity}</span>
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
            <div className="flex gap-4">
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
              <Button size="lg" variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Buy Now */}
            <Button
              size="lg"
              variant="secondary"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              Buy Now
            </Button>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
              <div className="text-center">
                <Truck className="mx-auto mb-2 h-6 w-6 text-blue-600" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="mx-auto mb-2 h-6 w-6 text-blue-600" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Secure Payment</p>
              </div>
              <div className="text-center">
                <RefreshCw className="mx-auto mb-2 h-6 w-6 text-blue-600" />
                <p className="text-xs text-gray-600 dark:text-gray-400">30-Day Returns</p>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
              Related Products
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <ProductCard key={relatedProduct._id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
