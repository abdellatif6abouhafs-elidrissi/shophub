'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  count?: number;
}

const sizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  count,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(maxRating)].map((_, index) => {
          const value = index + 1;
          const isFilled = value <= displayRating;
          const isHalfFilled = !isFilled && value - 0.5 <= displayRating;

          return (
            <motion.button
              key={index}
              type="button"
              whileHover={interactive ? { scale: 1.1 } : {}}
              whileTap={interactive ? { scale: 0.9 } : {}}
              onClick={() => handleClick(value)}
              onMouseEnter={() => handleMouseEnter(value)}
              onMouseLeave={handleMouseLeave}
              disabled={!interactive}
              className={`relative ${interactive ? 'cursor-pointer' : 'cursor-default'} ${
                interactive ? 'hover:opacity-80' : ''
              }`}
            >
              {/* Background star (empty) */}
              <Star
                className={`${sizeClasses[size]} text-gray-300 dark:text-gray-600`}
              />

              {/* Filled star overlay */}
              {(isFilled || isHalfFilled) && (
                <Star
                  className={`${sizeClasses[size]} absolute inset-0 fill-yellow-400 text-yellow-400`}
                  style={isHalfFilled ? { clipPath: 'inset(0 50% 0 0)' } : {}}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {showValue && (
        <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {rating.toFixed(1)}
        </span>
      )}

      {count !== undefined && (
        <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
          ({count} {count === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}
