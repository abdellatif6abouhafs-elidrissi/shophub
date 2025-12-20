'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Tag, Search } from 'lucide-react';
import Button from '@/components/ui/Button';

// Sample blog posts for demo (these would come from API in production)
const blogPosts = [
  {
    _id: '1',
    title: 'Top 10 Fashion Trends for 2025',
    slug: 'top-10-fashion-trends-2025',
    excerpt: 'Discover the hottest fashion trends that will dominate 2025. From sustainable fashion to bold colors, here is everything you need to know.',
    coverImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
    author: { name: 'Sarah Johnson', avatar: '' },
    category: 'Fashion',
    tags: ['Fashion', 'Trends', '2025'],
    readTime: 5,
    publishedAt: '2025-01-15',
    views: 1520,
  },
  {
    _id: '2',
    title: 'How to Choose the Perfect Electronics',
    slug: 'choose-perfect-electronics',
    excerpt: 'A complete guide to buying electronics online. Learn what to look for and how to avoid common mistakes when shopping for gadgets.',
    coverImage: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80',
    author: { name: 'Mike Chen', avatar: '' },
    category: 'Technology',
    tags: ['Electronics', 'Guide', 'Shopping'],
    readTime: 7,
    publishedAt: '2025-01-10',
    views: 2340,
  },
  {
    _id: '3',
    title: '5 Ways to Save Money While Shopping',
    slug: 'save-money-shopping-tips',
    excerpt: 'Smart shopping strategies that will help you save money without compromising on quality. Coupons, timing, and more insider tips.',
    coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    author: { name: 'Emma Wilson', avatar: '' },
    category: 'Shopping Tips',
    tags: ['Savings', 'Tips', 'Budget'],
    readTime: 4,
    publishedAt: '2025-01-05',
    views: 3100,
  },
  {
    _id: '4',
    title: 'Sustainable Fashion: A Beginners Guide',
    slug: 'sustainable-fashion-beginners-guide',
    excerpt: 'Learn how to build an eco-friendly wardrobe. Sustainable brands, materials to look for, and tips for conscious shopping.',
    coverImage: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=800&q=80',
    author: { name: 'Sarah Johnson', avatar: '' },
    category: 'Fashion',
    tags: ['Sustainable', 'Eco-Friendly', 'Fashion'],
    readTime: 6,
    publishedAt: '2024-12-28',
    views: 1890,
  },
  {
    _id: '5',
    title: 'Home Decor Ideas for Small Spaces',
    slug: 'home-decor-small-spaces',
    excerpt: 'Transform your small apartment into a stylish haven. Space-saving furniture, clever storage solutions, and design tips.',
    coverImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
    author: { name: 'David Park', avatar: '' },
    category: 'Lifestyle',
    tags: ['Home', 'Decor', 'Small Spaces'],
    readTime: 5,
    publishedAt: '2024-12-20',
    views: 2560,
  },
  {
    _id: '6',
    title: 'The Ultimate Gift Guide for Every Budget',
    slug: 'ultimate-gift-guide',
    excerpt: 'Finding the perfect gift has never been easier. Our curated guide covers gifts for all occasions and price points.',
    coverImage: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80',
    author: { name: 'Emma Wilson', avatar: '' },
    category: 'Shopping Tips',
    tags: ['Gifts', 'Guide', 'Shopping'],
    readTime: 8,
    publishedAt: '2024-12-15',
    views: 4200,
  },
];

const categories = ['All', 'Fashion', 'Technology', 'Lifestyle', 'Shopping Tips'];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-4xl font-bold text-white sm:text-5xl"
          >
            ShopHub Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 text-lg text-blue-100"
          >
            Tips, trends, and insights for smart shopping
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-xl"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full rounded-xl border-0 py-4 pl-12 pr-4 text-gray-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <div className="sticky top-16 z-30 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {filteredPosts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-gray-500 dark:text-gray-400">No articles found</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-lg dark:bg-gray-900"
                >
                  <Link href={`/blog/${post.slug}`}>
                    {/* Cover Image */}
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute left-4 top-4">
                        <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Meta */}
                      <div className="mb-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(post.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.readTime} min read
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="mb-3 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="mb-4 line-clamp-2 text-gray-600 dark:text-gray-400">
                        {post.excerpt}
                      </p>

                      {/* Tags */}
                      <div className="mb-4 flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          >
                            <Tag className="h-3 w-3" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Read More */}
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 dark:text-blue-400">
                        Read More <ArrowRight className="h-4 w-4 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gray-900 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Subscribe to Our Newsletter
          </h2>
          <p className="mb-8 text-gray-400">
            Get the latest articles and shopping tips delivered to your inbox
          </p>
          <form className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-lg border-0 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button className="bg-blue-600 hover:bg-blue-700">Subscribe</Button>
          </form>
        </div>
      </section>
    </div>
  );
}
