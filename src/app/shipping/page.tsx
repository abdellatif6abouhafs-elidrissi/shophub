'use client';

import { motion } from 'framer-motion';
import {
  Truck,
  Clock,
  MapPin,
  Package,
  Globe,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const shippingMethods = [
  {
    name: 'Standard Shipping',
    time: '5-7 business days',
    price: '$5.99',
    freeOver: '$100',
    icon: Package,
  },
  {
    name: 'Express Shipping',
    time: '2-3 business days',
    price: '$12.99',
    freeOver: '$200',
    icon: Truck,
  },
  {
    name: 'Next Day Delivery',
    time: '1 business day',
    price: '$24.99',
    freeOver: null,
    icon: Clock,
  },
];

const internationalZones = [
  { zone: 'Canada & Mexico', time: '7-10 business days', price: 'From $14.99' },
  { zone: 'Europe', time: '10-14 business days', price: 'From $19.99' },
  { zone: 'Asia Pacific', time: '12-18 business days', price: 'From $24.99' },
  { zone: 'Rest of World', time: '14-21 business days', price: 'From $29.99' },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Truck className="mx-auto mb-6 h-16 w-16 text-white" />
            <h1 className="mb-4 text-4xl font-bold text-white">
              Shipping Information
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-blue-100">
              Fast, reliable shipping to get your orders to you safely and on
              time.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Free Shipping Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center text-white"
        >
          <CheckCircle className="mx-auto mb-3 h-10 w-10" />
          <h2 className="mb-2 text-2xl font-bold">Free Shipping on Orders Over $100</h2>
          <p className="text-green-100">
            Enjoy free standard shipping on all qualifying orders within the US.
          </p>
        </motion.div>

        {/* Domestic Shipping */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="mb-6 flex items-center gap-3">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Domestic Shipping (US)
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {shippingMethods.map((method, index) => (
              <motion.div
                key={method.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
              >
                <method.icon className="mb-4 h-8 w-8 text-blue-600" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {method.name}
                </h3>
                <p className="mb-1 text-gray-600 dark:text-gray-400">
                  {method.time}
                </p>
                <p className="text-2xl font-bold text-blue-600">{method.price}</p>
                {method.freeOver && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    Free on orders over {method.freeOver}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* International Shipping */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="mb-6 flex items-center gap-3">
            <Globe className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              International Shipping
            </h2>
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-900">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Region
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Delivery Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Starting Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {internationalZones.map((zone) => (
                  <tr key={zone.zone}>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {zone.zone}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {zone.time}
                    </td>
                    <td className="px-6 py-4 font-medium text-blue-600">
                      {zone.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Important Information */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="mb-6 flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Important Information
            </h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
            <ul className="space-y-4 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>
                  <strong className="text-gray-900 dark:text-white">Order Processing:</strong>{' '}
                  Orders are typically processed within 1-2 business days.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>
                  <strong className="text-gray-900 dark:text-white">Tracking:</strong>{' '}
                  You&apos;ll receive a tracking number via email once your order ships.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>
                  <strong className="text-gray-900 dark:text-white">Signature Required:</strong>{' '}
                  Orders over $500 require a signature upon delivery.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>
                  <strong className="text-gray-900 dark:text-white">Customs & Duties:</strong>{' '}
                  International orders may be subject to customs fees and import duties.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>
                  <strong className="text-gray-900 dark:text-white">PO Boxes:</strong>{' '}
                  We can ship to PO Boxes via standard shipping only.
                </span>
              </li>
            </ul>
          </div>
        </motion.section>

        {/* Contact for Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl bg-blue-50 p-6 text-center dark:bg-blue-900/20"
        >
          <p className="text-gray-700 dark:text-gray-300">
            Have questions about shipping?{' '}
            <a
              href="/contact"
              className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Contact our support team
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
