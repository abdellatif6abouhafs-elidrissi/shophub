'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IProduct } from '@/types';
import toast from 'react-hot-toast';

const MAX_COMPARE_ITEMS = 4;
const STORAGE_KEY = 'compare-products';

interface CompareContextType {
  compareItems: IProduct[];
  addToCompare: (product: IProduct) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  isCompareOpen: boolean;
  openCompare: () => void;
  closeCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareItems, setCompareItems] = useState<IProduct[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setCompareItems(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Error loading compare items:', e);
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareItems));
    }
  }, [compareItems, isLoaded]);

  const addToCompare = (product: IProduct) => {
    if (compareItems.length >= MAX_COMPARE_ITEMS) {
      toast.error(`Maximum ${MAX_COMPARE_ITEMS} products can be compared`);
      return;
    }

    if (compareItems.some((item) => item._id === product._id)) {
      toast.error('Product already in compare list');
      return;
    }

    setCompareItems((prev) => [...prev, product]);
    toast.success('Added to compare');
  };

  const removeFromCompare = (productId: string) => {
    setCompareItems((prev) => prev.filter((item) => item._id !== productId));
    toast.success('Removed from compare');
  };

  const clearCompare = () => {
    setCompareItems([]);
    toast.success('Compare list cleared');
  };

  const isInCompare = (productId: string) => {
    return compareItems.some((item) => item._id === productId);
  };

  const openCompare = () => setIsCompareOpen(true);
  const closeCompare = () => setIsCompareOpen(false);

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isCompareOpen,
        openCompare,
        closeCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
