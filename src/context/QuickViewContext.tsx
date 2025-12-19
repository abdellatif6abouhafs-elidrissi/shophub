'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { IProduct } from '@/types';
import QuickViewModal from '@/components/product/QuickViewModal';

interface QuickViewContextType {
  openQuickView: (product: IProduct) => void;
  closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextType | undefined>(undefined);

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openQuickView = (prod: IProduct) => {
    setProduct(prod);
    setIsOpen(true);
  };

  const closeQuickView = () => {
    setIsOpen(false);
    // Delay clearing product to allow exit animation
    setTimeout(() => setProduct(null), 300);
  };

  return (
    <QuickViewContext.Provider value={{ openQuickView, closeQuickView }}>
      {children}
      <QuickViewModal product={product} isOpen={isOpen} onClose={closeQuickView} />
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const context = useContext(QuickViewContext);
  if (context === undefined) {
    throw new Error('useQuickView must be used within a QuickViewProvider');
  }
  return context;
}
