'use client';

import { useState, useEffect, useCallback } from 'react';

interface RecentProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

const MAX_RECENT_ITEMS = 8;
const STORAGE_KEY = 'recently-viewed';

export function useRecentlyViewed() {
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setRecentProducts(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Error loading recently viewed:', e);
      }
      setIsLoaded(true);
    }
  }, []);

  // Add product to recently viewed
  const addProduct = useCallback((product: RecentProduct) => {
    if (typeof window === 'undefined') return;

    setRecentProducts((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.id !== product.id);
      // Add to beginning
      const updated = [product, ...filtered].slice(0, MAX_RECENT_ITEMS);
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear all recently viewed
  const clearAll = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    setRecentProducts([]);
  }, []);

  return {
    recentProducts,
    addProduct,
    clearAll,
    isLoaded,
  };
}
