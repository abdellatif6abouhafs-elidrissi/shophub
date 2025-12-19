'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, Loader2, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '@/utils/format';
import { IProduct } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

const RECENT_SEARCHES_KEY = 'recent-searches';
const MAX_RECENT_SEARCHES = 5;

const trendingSearches = [
  'Wireless Headphones',
  'Smart Watch',
  'Running Shoes',
  'Laptop Backpack',
  'LED Monitor',
];

interface SearchAutocompleteProps {
  className?: string;
  onClose?: () => void;
  isMobile?: boolean;
}

async function searchProducts(query: string): Promise<IProduct[]> {
  if (!query || query.length < 2) return [];
  const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=5`);
  const data = await res.json();
  return data.data || [];
}

export default function SearchAutocomplete({ className = '', onClose, isMobile = false }: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search-autocomplete', debouncedQuery],
    queryFn: () => searchProducts(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  // Load recent searches
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (saved) {
          setRecentSearches(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((searchTerm: string) => {
    if (typeof window === 'undefined' || !searchTerm.trim()) return;

    const updated = [
      searchTerm,
      ...recentSearches.filter((s) => s.toLowerCase() !== searchTerm.toLowerCase()),
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  // Handle search submit
  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    saveRecentSearch(searchTerm);
    router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
    setQuery('');
    setIsOpen(false);
    onClose?.();
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  // Handle product click
  const handleProductClick = (product: IProduct) => {
    saveRecentSearch(product.name);
    router.push(`/products/${product.slug}`);
    setQuery('');
    setIsOpen(false);
    onClose?.();
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const showDropdown = isOpen && (query.length >= 2 || recentSearches.length > 0);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Search products..."
            className={`w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white ${
              isMobile ? 'w-full' : 'w-64'
            }`}
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10"
          >
            {/* Loading State */}
            {isLoading && query.length >= 2 && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            )}

            {/* Search Results */}
            {!isLoading && searchResults && searchResults.length > 0 && (
              <div className="p-2">
                <p className="mb-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Products
                </p>
                {searchResults.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleProductClick(product)}
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => handleSearch(query)}
                  className="mt-2 w-full rounded-lg bg-blue-50 px-3 py-2 text-center text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                >
                  View all results for "{query}"
                </button>
              </div>
            )}

            {/* No Results */}
            {!isLoading && query.length >= 2 && searchResults?.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No products found for "{query}"
                </p>
              </div>
            )}

            {/* Recent Searches */}
            {query.length < 2 && recentSearches.length > 0 && (
              <div className="p-2">
                <div className="mb-2 flex items-center justify-between px-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Recent Searches
                  </p>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <Clock className="h-4 w-4 text-gray-400" />
                    {search}
                  </button>
                ))}
              </div>
            )}

            {/* Trending Searches */}
            {query.length < 2 && (
              <div className="border-t border-gray-100 p-2 dark:border-gray-700">
                <p className="mb-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Trending Searches
                </p>
                {trendingSearches.slice(0, 4).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    {search}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
