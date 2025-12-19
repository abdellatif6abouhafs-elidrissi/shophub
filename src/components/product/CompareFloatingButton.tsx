'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';

export default function CompareFloatingButton() {
  const { compareItems, openCompare } = useCompare();

  if (compareItems.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={openCompare}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-white shadow-lg transition-colors hover:bg-blue-700"
      >
        <GitCompare className="h-5 w-5" />
        <span className="font-medium">Compare ({compareItems.length})</span>
      </motion.button>
    </AnimatePresence>
  );
}
