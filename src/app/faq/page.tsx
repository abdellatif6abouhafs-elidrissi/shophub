'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  ChevronDown,
  Search,
  ShoppingCart,
  Truck,
  CreditCard,
  RefreshCw,
  Shield,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

const faqCategories = [
  {
    icon: ShoppingCart,
    title: 'Orders',
    questions: [
      {
        q: 'How do I track my order?',
        a: 'Once your order is shipped, you\'ll receive an email with a tracking number. You can also track your order by logging into your account and visiting the "My Orders" section.',
      },
      {
        q: 'Can I modify or cancel my order?',
        a: 'You can modify or cancel your order within 1 hour of placing it. After that, please contact our customer support team for assistance.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and various digital wallets including Apple Pay and Google Pay.',
      },
    ],
  },
  {
    icon: Truck,
    title: 'Shipping',
    questions: [
      {
        q: 'How long does shipping take?',
        a: 'Standard shipping typically takes 5-7 business days. Express shipping is available for 2-3 business days delivery. International shipping may take 10-15 business days.',
      },
      {
        q: 'Do you offer free shipping?',
        a: 'Yes! We offer free standard shipping on all orders over $100. Orders under $100 have a flat rate shipping fee of $5.99.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location.',
      },
    ],
  },
  {
    icon: RefreshCw,
    title: 'Returns & Refunds',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 30-day return policy for most items. Products must be unused, in original packaging, and with all tags attached.',
      },
      {
        q: 'How do I initiate a return?',
        a: 'Log into your account, go to "My Orders", select the order, and click "Return Item". You\'ll receive a prepaid shipping label via email.',
      },
      {
        q: 'When will I receive my refund?',
        a: 'Refunds are processed within 5-7 business days after we receive your return. The refund will be credited to your original payment method.',
      },
    ],
  },
  {
    icon: CreditCard,
    title: 'Payments',
    questions: [
      {
        q: 'Is my payment information secure?',
        a: 'Absolutely! We use industry-standard SSL encryption and never store your complete credit card information. All payments are processed through secure payment gateways.',
      },
      {
        q: 'Can I use multiple payment methods?',
        a: 'Currently, we only support one payment method per order. However, you can use store credit or gift cards in combination with another payment method.',
      },
      {
        q: 'Do you offer payment plans?',
        a: 'Yes, we partner with Klarna and Afterpay to offer buy-now-pay-later options at checkout.',
      },
    ],
  },
  {
    icon: Shield,
    title: 'Account & Security',
    questions: [
      {
        q: 'How do I reset my password?',
        a: 'Click "Forgot Password" on the login page and enter your email. You\'ll receive a link to reset your password within a few minutes.',
      },
      {
        q: 'How do I update my account information?',
        a: 'Log into your account and go to "Profile" or "Settings" to update your personal information, shipping addresses, and preferences.',
      },
      {
        q: 'Is my personal information safe?',
        a: 'Yes, we take data privacy seriously. Your information is protected by industry-standard security measures and we never sell your data to third parties.',
      },
    ],
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <HelpCircle className="mx-auto mb-6 h-16 w-16 text-white" />
            <h1 className="mb-4 text-4xl font-bold text-white">
              Frequently Asked Questions
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100">
              Find answers to common questions about orders, shipping, returns,
              and more.
            </p>

            {/* Search */}
            <div className="mx-auto max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for answers..."
                  className="w-full rounded-xl border-0 py-4 pl-12 pr-4 text-gray-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                  <category.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {category.title}
                </h2>
              </div>

              <div className="space-y-3">
                {category.questions.map((item, index) => {
                  const itemId = `${category.title}-${index}`;
                  const isOpen = openItems.includes(itemId);

                  return (
                    <div
                      key={index}
                      className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.q}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 text-gray-500 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-700 dark:bg-gray-800">
                              <p className="text-gray-600 dark:text-gray-400">
                                {item.a}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center"
        >
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-white" />
          <h3 className="mb-2 text-2xl font-bold text-white">
            Still have questions?
          </h3>
          <p className="mb-6 text-blue-100">
            Can&apos;t find what you&apos;re looking for? Our support team is here to
            help.
          </p>
          <Link href="/contact">
            <Button className="bg-white text-blue-600 hover:bg-gray-100">
              Contact Support
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
