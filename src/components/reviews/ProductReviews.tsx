'use client';

import { useQueryClient } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import ReviewForm from './ReviewForm';
import ReviewsList from './ReviewsList';

interface ProductReviewsProps {
  productId: string;
  productSlug: string;
  productRating: number;
  productReviewCount: number;
}

export default function ProductReviews({
  productId,
  productSlug,
  productRating,
  productReviewCount,
}: ProductReviewsProps) {
  const queryClient = useQueryClient();

  const handleReviewSubmitted = () => {
    // Invalidate reviews query to refetch
    queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    // Invalidate product query to get updated rating
    queryClient.invalidateQueries({ queryKey: ['product', productSlug] });
  };

  return (
    <section className="mt-16">
      <div className="mb-8 flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Customer Reviews
        </h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Review Form */}
        <div className="lg:col-span-1">
          <ReviewForm
            productId={productId}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2">
          <ReviewsList
            productId={productId}
            productRating={productRating}
            productReviewCount={productReviewCount}
          />
        </div>
      </div>
    </section>
  );
}
