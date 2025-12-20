'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, Share2, Facebook, Twitter, Tag, User } from 'lucide-react';
import Button from '@/components/ui/Button';

// Sample blog posts data
const blogPosts: Record<string, any> = {
  'top-10-fashion-trends-2025': {
    title: 'Top 10 Fashion Trends for 2025',
    excerpt: 'Discover the hottest fashion trends that will dominate 2025.',
    coverImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80',
    author: { name: 'Sarah Johnson' },
    category: 'Fashion',
    tags: ['Fashion', 'Trends', '2025'],
    readTime: 5,
    publishedAt: '2025-01-15',
    content: `
      <p>Fashion is constantly evolving, and 2025 promises to bring some exciting new trends. From sustainable fashion choices to bold color palettes, here's what you need to know about the hottest trends this year.</p>

      <h2>1. Sustainable Fashion Takes Center Stage</h2>
      <p>Eco-friendly materials and ethical production are no longer just nice-to-haves – they're essential. Look for brands that prioritize sustainability in their manufacturing processes.</p>

      <h2>2. Bold and Vibrant Colors</h2>
      <p>Say goodbye to muted tones! 2025 is all about bold, vibrant colors that make a statement. Think electric blue, hot pink, and sunshine yellow.</p>

      <h2>3. Oversized Silhouettes</h2>
      <p>Comfort meets style with oversized blazers, baggy jeans, and flowing dresses. The key is to balance proportions for a polished look.</p>

      <h2>4. Vintage Revival</h2>
      <p>The 90s and Y2K continue to influence fashion. Expect to see more vintage-inspired pieces making their way into modern wardrobes.</p>

      <h2>5. Tech-Integrated Fashion</h2>
      <p>Smart fabrics and wearable technology are becoming more mainstream. From temperature-regulating materials to built-in health monitors, fashion is getting smarter.</p>

      <h2>Conclusion</h2>
      <p>Stay ahead of the curve by incorporating these trends into your wardrobe. Remember, the best style is one that makes you feel confident and comfortable!</p>
    `,
  },
  'choose-perfect-electronics': {
    title: 'How to Choose the Perfect Electronics',
    excerpt: 'A complete guide to buying electronics online.',
    coverImage: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&q=80',
    author: { name: 'Mike Chen' },
    category: 'Technology',
    tags: ['Electronics', 'Guide', 'Shopping'],
    readTime: 7,
    publishedAt: '2025-01-10',
    content: `
      <p>Shopping for electronics online can be overwhelming with so many options available. This guide will help you make informed decisions and avoid common pitfalls.</p>

      <h2>Research Before You Buy</h2>
      <p>Always read reviews from multiple sources. Look for both professional reviews and user feedback to get a complete picture of the product.</p>

      <h2>Compare Specifications</h2>
      <p>Don't just look at the price. Compare specifications across different brands and models to ensure you're getting the best value for your money.</p>

      <h2>Check Warranty and Return Policy</h2>
      <p>Electronics can sometimes have issues. Make sure you understand the warranty coverage and return policy before making a purchase.</p>

      <h2>Look for Certified Sellers</h2>
      <p>Buy from authorized retailers to ensure you're getting genuine products with valid warranties.</p>

      <h2>Consider Future Compatibility</h2>
      <p>Technology evolves quickly. Consider whether the device will remain compatible with upcoming software updates and accessories.</p>
    `,
  },
  'save-money-shopping-tips': {
    title: '5 Ways to Save Money While Shopping',
    excerpt: 'Smart shopping strategies that will help you save money.',
    coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
    author: { name: 'Emma Wilson' },
    category: 'Shopping Tips',
    tags: ['Savings', 'Tips', 'Budget'],
    readTime: 4,
    publishedAt: '2025-01-05',
    content: `
      <p>Smart shopping isn't just about finding the lowest price – it's about maximizing value while staying within your budget.</p>

      <h2>1. Use Price Comparison Tools</h2>
      <p>Before making a purchase, compare prices across different retailers. Many browser extensions can do this automatically for you.</p>

      <h2>2. Wait for Sales Events</h2>
      <p>Major shopping events like Black Friday, Cyber Monday, and seasonal sales can offer significant discounts on items you've been eyeing.</p>

      <h2>3. Sign Up for Newsletters</h2>
      <p>Many retailers offer exclusive discounts to email subscribers. You'll also be the first to know about upcoming sales.</p>

      <h2>4. Use Cashback Programs</h2>
      <p>Take advantage of credit card rewards and cashback websites to earn money back on your purchases.</p>

      <h2>5. Buy Quality Over Quantity</h2>
      <p>Sometimes spending more upfront on a quality item saves money in the long run compared to replacing cheaper alternatives.</p>
    `,
  },
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = blogPosts[slug];

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Article Not Found</h1>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="relative h-[400px] sm:h-[500px]">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/blog"
              className="mb-4 inline-flex items-center gap-2 text-white/80 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
            <span className="mb-4 inline-block rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white">
              {post.category}
            </span>
            <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {post.author.name}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.readTime} min read
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Tags */}
          <div className="mb-8 flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-a:text-blue-600"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share */}
          <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
            <p className="mb-4 font-semibold text-gray-900 dark:text-white">Share this article</p>
            <div className="flex gap-3">
              <button className="rounded-full bg-blue-600 p-3 text-white hover:bg-blue-700">
                <Facebook className="h-5 w-5" />
              </button>
              <button className="rounded-full bg-sky-500 p-3 text-white hover:bg-sky-600">
                <Twitter className="h-5 w-5" />
              </button>
              <button className="rounded-full bg-gray-600 p-3 text-white hover:bg-gray-700">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
            <h3 className="mb-4 text-2xl font-bold text-white">Ready to Shop?</h3>
            <p className="mb-6 text-blue-100">
              Discover our amazing collection of products
            </p>
            <Link href="/products">
              <Button className="bg-white text-blue-600 hover:bg-gray-100">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
