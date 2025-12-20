'use client';

import { useCallback } from 'react';
import * as analytics from '@/lib/analytics';
import { useCartStore, CartItem } from '@/store/cartStore';

/**
 * Hook for tracking e-commerce analytics events
 * Wraps cart actions with analytics tracking
 */
export function useAnalytics() {
  const cartStore = useCartStore();

  // Convert CartItem to analytics ProductItem
  const toProductItem = useCallback((item: CartItem): analytics.ProductItem => ({
    item_id: item.productId,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
  }), []);

  // Track add to cart
  const trackAddToCart = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    analytics.addToCart({
      item_id: item.productId,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
    });
  }, []);

  // Track remove from cart
  const trackRemoveFromCart = useCallback((item: CartItem) => {
    analytics.removeFromCart({
      item_id: item.productId,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    });
  }, []);

  // Track view cart
  const trackViewCart = useCallback(() => {
    const items = cartStore.items.map(toProductItem);
    const total = cartStore.getTotalPrice();
    analytics.viewCart(items, total);
  }, [cartStore, toProductItem]);

  // Track begin checkout
  const trackBeginCheckout = useCallback(() => {
    const items = cartStore.items.map(toProductItem);
    const total = cartStore.getTotalPrice();
    analytics.beginCheckout(items, total);
  }, [cartStore, toProductItem]);

  // Track purchase
  const trackPurchase = useCallback((
    transactionId: string,
    total: number,
    shipping: number = 0,
    tax: number = 0,
    coupon?: string
  ) => {
    const items = cartStore.items.map(toProductItem);
    analytics.purchase(transactionId, items, total, shipping, tax, coupon);
  }, [cartStore, toProductItem]);

  // Track product view
  const trackViewProduct = useCallback((product: {
    id: string;
    name: string;
    price: number;
    category?: string;
  }) => {
    analytics.viewItem({
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      item_category: product.category,
    });
  }, []);

  // Track product list view
  const trackViewProductList = useCallback((
    listName: string,
    products: Array<{ id: string; name: string; price: number; category?: string }>
  ) => {
    analytics.viewItemList(
      listName,
      products.map(p => ({
        item_id: p.id,
        item_name: p.name,
        price: p.price,
        item_category: p.category,
      }))
    );
  }, []);

  // Track search
  const trackSearch = useCallback((term: string) => {
    analytics.search(term);
  }, []);

  // Track wishlist add
  const trackAddToWishlist = useCallback((product: {
    id: string;
    name: string;
    price: number;
  }) => {
    analytics.addToWishlist({
      item_id: product.id,
      item_name: product.name,
      price: product.price,
    });
  }, []);

  // Track signup
  const trackSignUp = useCallback((method: string = 'email') => {
    analytics.signUp(method);
  }, []);

  // Track login
  const trackLogin = useCallback((method: string = 'email') => {
    analytics.login(method);
  }, []);

  // Track newsletter signup
  const trackNewsletterSignup = useCallback(() => {
    analytics.newsletterSignup();
  }, []);

  // Track review submit
  const trackReviewSubmit = useCallback((productId: string, rating: number) => {
    analytics.reviewSubmit(productId, rating);
  }, []);

  // Track coupon application
  const trackApplyCoupon = useCallback((code: string, success: boolean) => {
    analytics.applyCoupon(code, success);
  }, []);

  return {
    trackAddToCart,
    trackRemoveFromCart,
    trackViewCart,
    trackBeginCheckout,
    trackPurchase,
    trackViewProduct,
    trackViewProductList,
    trackSearch,
    trackAddToWishlist,
    trackSignUp,
    trackLogin,
    trackNewsletterSignup,
    trackReviewSubmit,
    trackApplyCoupon,
  };
}

// Re-export types for convenience
export type { ProductItem } from '@/lib/analytics';
