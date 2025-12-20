'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah M.',
    location: 'New York, USA',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    rating: 5,
    text: 'Amazing quality products and super fast shipping! I ordered a dress for an event and it arrived in just 2 days. The quality exceeded my expectations. Will definitely shop here again!',
    product: 'Summer Collection Dress',
  },
  {
    id: 2,
    name: 'Ahmed K.',
    location: 'Dubai, UAE',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    rating: 5,
    text: 'Best electronics store online! Got my new headphones at a great price and the customer service was excellent. They helped me choose the right product for my needs.',
    product: 'Wireless Headphones Pro',
  },
  {
    id: 3,
    name: 'Maria L.',
    location: 'Paris, France',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    rating: 5,
    text: 'I love shopping at ShopHub! The variety of products is incredible and the prices are unbeatable. The mobile app makes it so easy to browse and order.',
    product: 'Home Decor Set',
  },
  {
    id: 4,
    name: 'James W.',
    location: 'London, UK',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    rating: 5,
    text: 'Finally found a reliable online store! The return process was hassle-free when I needed to exchange a size. Great customer experience from start to finish.',
    product: 'Running Shoes',
  },
  {
    id: 5,
    name: 'Fatima Z.',
    location: 'Casablanca, Morocco',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    rating: 5,
    text: 'Khedma zwina bzaf! Products kaynin b quality 3alya w prices rkhass. Ghadi nchri mn 3ndhom dima. Merci ShopHub!',
    product: 'Laptop Backpack',
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextTestimonial, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20 dark:from-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          >
            Customer Reviews
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl"
          >
            What Our Customers Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-400"
          >
            Join thousands of satisfied customers worldwide
          </motion.p>
        </div>

        {/* Testimonial Slider */}
        <div
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className="overflow-hidden rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 sm:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center text-center"
              >
                {/* Quote Icon */}
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Quote className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>

                {/* Text */}
                <p className="mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
                  "{testimonials[currentIndex].text}"
                </p>

                {/* Rating */}
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonials[currentIndex].rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Product */}
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                  Purchased: <span className="font-medium">{testimonials[currentIndex].product}</span>
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full">
                    <Image
                      src={testimonials[currentIndex].avatar}
                      alt={testimonials[currentIndex].name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {testimonials[currentIndex].name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonials[currentIndex].location}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevTestimonial}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-transform hover:scale-110 dark:bg-gray-700 sm:-left-5"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-transform hover:scale-110 dark:bg-gray-700 sm:-right-5"
          >
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Dots */}
        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-blue-600'
                  : 'w-2.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4"
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600 sm:text-4xl">50K+</p>
            <p className="text-gray-600 dark:text-gray-400">Happy Customers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600 sm:text-4xl">4.9</p>
            <p className="text-gray-600 dark:text-gray-400">Average Rating</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600 sm:text-4xl">100K+</p>
            <p className="text-gray-600 dark:text-gray-400">Products Sold</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600 sm:text-4xl">30+</p>
            <p className="text-gray-600 dark:text-gray-400">Countries</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
