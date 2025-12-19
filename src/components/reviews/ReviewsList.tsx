'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  ThumbsUp,
  MoreVertical,
  Trash2,
  Edit,
  User,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import StarRating from './StarRating';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import toast from 'react-hot-toast';

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    image?: string;
  };
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  createdAt: string;
}

interface ReviewsListProps {
  productId: string;
  productRating: number;
  productReviewCount: number;
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
];

async function fetchReviews(productId: string, page: number, sort: string) {
  const res = await fetch(
    `/api/reviews?productId=${productId}&page=${page}&limit=5&sort=${sort}`
  );
  const data = await res.json();
  return data;
}

export default function ReviewsList({
  productId,
  productRating,
  productReviewCount,
}: ReviewsListProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['reviews', productId, page, sort],
    queryFn: () => fetchReviews(productId, page, sort),
  });

  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete review');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Review deleted');
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
    onError: () => {
      toast.error('Failed to delete review');
    },
  });

  const reviews: Review[] = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };
  const ratingDistribution = data?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      deleteMutation.mutate(reviewId);
    }
    setMenuOpen(null);
  };

  return (
    <div className="space-y-8">
      {/* Summary Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Average Rating */}
        <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800/50">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-5xl font-bold text-gray-900 dark:text-white">
                {productRating.toFixed(1)}
              </p>
              <StarRating rating={productRating} size="md" />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {productReviewCount} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDistribution[star as keyof typeof ratingDistribution];
                const percentage = productReviewCount > 0
                  ? (count / productReviewCount) * 100
                  : 0;

                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-3 text-sm text-gray-600 dark:text-gray-400">
                      {star}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: (5 - star) * 0.1 }}
                        className="h-full bg-yellow-400"
                      />
                    </div>
                    <span className="w-8 text-right text-xs text-gray-500 dark:text-gray-400">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-start justify-end">
          <div className="w-48">
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
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            No Reviews Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Be the first to review this product!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {reviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      {review.user.image ? (
                        <Image
                          src={review.user.image}
                          alt={review.user.name}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {review.user.name}
                        </p>
                        {review.isVerified && (
                          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions Menu */}
                  {session?.user?.id === review.user._id && (
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === review._id ? null : review._id)}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>

                      <AnimatePresence>
                        {menuOpen === review._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 z-10 mt-1 w-32 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10"
                          >
                            <button
                              onClick={() => handleDelete(review._id)}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Rating */}
                <StarRating rating={review.rating} size="sm" />

                {/* Title */}
                <h4 className="mt-3 font-semibold text-gray-900 dark:text-white">
                  {review.title}
                </h4>

                {/* Comment */}
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {review.comment}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="px-4 text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {pagination.totalPages}
          </span>
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
  );
}
