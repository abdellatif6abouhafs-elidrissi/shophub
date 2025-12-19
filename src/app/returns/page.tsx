'use client';

import { motion } from 'framer-motion';
import {
  RefreshCw,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

const returnSteps = [
  {
    step: 1,
    title: 'Initiate Return',
    description: 'Log into your account and select the item you wish to return from your order history.',
  },
  {
    step: 2,
    title: 'Print Label',
    description: 'Download and print the prepaid return shipping label sent to your email.',
  },
  {
    step: 3,
    title: 'Pack & Ship',
    description: 'Pack the item securely in its original packaging and drop off at any carrier location.',
  },
  {
    step: 4,
    title: 'Receive Refund',
    description: 'Once we receive and inspect your return, your refund will be processed within 5-7 business days.',
  },
];

const eligibleItems = [
  'Unworn and unused items with original tags',
  'Items in original packaging',
  'Items returned within 30 days of delivery',
  'Items with proof of purchase',
];

const nonEligibleItems = [
  'Final sale items',
  'Personalized or custom-made products',
  'Intimate apparel and swimwear',
  'Items damaged due to misuse',
  'Gift cards',
];

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <RefreshCw className="mx-auto mb-6 h-16 w-16 text-white" />
            <h1 className="mb-4 text-4xl font-bold text-white">
              Returns & Exchanges
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-blue-100">
              Easy, hassle-free returns within 30 days. Your satisfaction is our
              priority.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* 30-Day Policy Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-center text-white"
        >
          <Clock className="mx-auto mb-3 h-10 w-10" />
          <h2 className="mb-2 text-2xl font-bold">30-Day Return Policy</h2>
          <p className="text-blue-100">
            Not satisfied with your purchase? Return it within 30 days for a full
            refund.
          </p>
        </motion.div>

        {/* Return Process Steps */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            How to Return an Item
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {returnSteps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="relative rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
                {index < returnSteps.length - 1 && (
                  <ArrowRight className="absolute -right-2 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-gray-300 lg:block" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Eligibility */}
        <div className="mb-12 grid gap-6 md:grid-cols-2">
          {/* Eligible Items */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
          >
            <div className="mb-4 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Eligible for Return
              </h3>
            </div>
            <ul className="space-y-3">
              {eligibleItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-600 dark:text-gray-400"
                >
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Non-Eligible Items */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
          >
            <div className="mb-4 flex items-center gap-3">
              <XCircle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Not Eligible for Return
              </h3>
            </div>
            <ul className="space-y-3">
              {nonEligibleItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-600 dark:text-gray-400"
                >
                  <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Exchange Policy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-3">
              <Package className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Exchange Policy
              </h3>
            </div>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Want a different size or color? We offer free exchanges on all
              eligible items. Simply select &quot;Exchange&quot; when initiating your return
              and choose your preferred replacement.
            </p>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Free shipping on all exchanges
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Exchange for same item in different size/color
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Price difference refunded or charged accordingly
              </li>
            </ul>
          </div>
        </motion.section>

        {/* Refund Information */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Refund Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">
                  Return received & inspected
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  1-2 business days
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">
                  Refund processed
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  3-5 business days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Refund appears in your account
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  5-10 business days
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
              * Timeline may vary depending on your payment provider
            </p>
          </div>
        </motion.section>

        {/* Start Return CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center"
        >
          <Mail className="mx-auto mb-4 h-12 w-12 text-white" />
          <h3 className="mb-2 text-2xl font-bold text-white">
            Ready to Start a Return?
          </h3>
          <p className="mb-6 text-blue-100">
            Log into your account to initiate a return or contact our support
            team for assistance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/profile/orders">
              <Button className="bg-white text-blue-600 hover:bg-gray-100">
                View My Orders
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Contact Support
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
