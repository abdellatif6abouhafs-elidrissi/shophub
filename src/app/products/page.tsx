'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { IProduct, ICategory } from '@/types';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
];

async function fetchProducts(searchParams: URLSearchParams) {
  const res = await fetch(`/api/products?${searchParams.toString()}`);
  const data = await res.json();
  return data;
}

async function fetchCategories(): Promise<ICategory[]> {
  const res = await fetch('/api/categories');
  const data = await res.json();
  return data.data || [];
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const buildSearchParams = () => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (sort) params.set('sort', sort);
    if (search) params.set('search', search);
    if (inStock) params.set('inStock', 'true');
    params.set('page', page.toString());
    params.set('limit', '12');
    return params;
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['products', category, minPrice, maxPrice, sort, search, inStock, page],
    queryFn: () => fetchProducts(buildSearchParams()),
  });

  const products: IProduct[] = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const updateFilters = () => {
    const params = buildSearchParams();
    router.push(`/products?${params.toString()}`);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setSearch('');
    setInStock(false);
    setPage(1);
    router.push('/products');
  };

  useEffect(() => {
    refetch();
  }, [page, sort, refetch]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {search ? `Search results for "${search}"` : 'All Products'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {pagination.total} products found
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Desktop Filters */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-24 space-y-6 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Filters
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Clear all
                </button>
              </div>

              {/* Search */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search
                </label>
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <Select
                  value={category}
                  onChange={(value) => setCategory(value)}
                  options={[
                    { value: '', label: 'All Categories' },
                    ...(categories?.map((cat) => ({
                      value: cat._id,
                      label: cat.name,
                    })) || []),
                  ]}
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* In Stock */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="inStock"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  In Stock Only
                </label>
              </div>

              <Button onClick={updateFilters} className="w-full">
                Apply Filters
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Bar */}
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
              <Select
                value={sort}
                onChange={(value) => {
                  setSort(value);
                  setPage(1);
                }}
                options={sortOptions}
              />
            </div>

            {/* Desktop Sort */}
            <div className="mb-6 hidden items-center justify-between lg:flex">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {products.length} of {pagination.total} products
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                <Select
                  value={sort}
                  onChange={(value) => {
                    setSort(value);
                    setPage(1);
                  }}
                  options={sortOptions}
                />
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <ProductGridSkeleton count={12} />
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <SlidersHorizontal className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  No products found
                </h3>
                <p className="mb-6 text-gray-500 dark:text-gray-400">
                  Try adjusting your filters or search query
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === pagination.totalPages ||
                        Math.abs(p - page) <= 1
                    )
                    .map((p, idx, arr) => (
                      <span key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => setPage(p)}
                          className={`h-8 w-8 rounded-lg text-sm font-medium ${
                            p === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                        >
                          {p}
                        </button>
                      </span>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFilterOpen(false)}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="absolute bottom-0 left-0 top-0 w-80 bg-white p-6 dark:bg-gray-900"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filters
              </h2>
              <button onClick={() => setIsFilterOpen(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search
                </label>
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <Select
                  value={category}
                  onChange={(value) => setCategory(value)}
                  options={[
                    { value: '', label: 'All Categories' },
                    ...(categories?.map((cat) => ({
                      value: cat._id,
                      label: cat.name,
                    })) || []),
                  ]}
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* In Stock */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="inStockMobile"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="inStockMobile"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  In Stock Only
                </label>
              </div>

              <div className="flex gap-2">
                <Button onClick={clearFilters} variant="outline" className="flex-1">
                  Clear
                </Button>
                <Button onClick={updateFilters} className="flex-1">
                  Apply
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ProductsLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}
