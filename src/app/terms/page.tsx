'use client';

import { motion } from 'framer-motion';
import { FileText, AlertTriangle, ShoppingBag, CreditCard, Scale, Mail } from 'lucide-react';

const sections = [
  {
    icon: ShoppingBag,
    title: 'Products and Services',
    content: `All products displayed on ShopHub are subject to availability. We reserve the right to limit quantities and discontinue products without notice.

Product Descriptions: We strive to provide accurate descriptions and images. However, we do not warrant that product descriptions, colors, or other content is accurate, complete, or error-free.

Pricing: All prices are in USD unless otherwise stated. We reserve the right to change prices at any time without notice. In case of pricing errors, we reserve the right to cancel orders placed at incorrect prices.`,
  },
  {
    icon: CreditCard,
    title: 'Orders and Payment',
    content: `Order Acceptance: Your order represents an offer to purchase. We reserve the right to accept or decline any order for any reason.

Payment: Payment must be received before order processing. We accept major credit cards, PayPal, and other payment methods as displayed at checkout.

Order Cancellation: Orders may be cancelled within 1 hour of placement. After this period, cancellation is subject to our discretion and may incur fees.`,
  },
  {
    icon: AlertTriangle,
    title: 'Limitation of Liability',
    content: `To the fullest extent permitted by law, ShopHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:

• Loss of profits, data, or goodwill
• Service interruption or computer damage
• Cost of substitute goods or services
• Any damages arising from your use of our services

Our total liability shall not exceed the amount paid by you for the product giving rise to the claim.`,
  },
  {
    icon: Scale,
    title: 'Intellectual Property',
    content: `All content on this website, including text, graphics, logos, images, and software, is the property of ShopHub or its content suppliers and is protected by intellectual property laws.

You may not:
• Copy, reproduce, or distribute our content without permission
• Use our trademarks without written consent
• Create derivative works from our content
• Reverse engineer any aspect of the website`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FileText className="mx-auto mb-6 h-16 w-16 text-white" />
            <h1 className="mb-4 text-4xl font-bold text-white">
              Terms of Service
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-blue-100">
              Please read these terms carefully before using our services.
            </p>
            <p className="mt-4 text-sm text-blue-200">
              Last updated: December 2024
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
        >
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Agreement to Terms
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            By accessing or using ShopHub&apos;s website and services, you agree to be
            bound by these Terms of Service and all applicable laws and
            regulations. If you do not agree with any of these terms, you are
            prohibited from using or accessing this site. The materials contained
            in this website are protected by applicable copyright and trademark
            law.
          </p>
        </motion.div>

        {/* Main Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                  <section.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
              </div>
              <div className="whitespace-pre-line text-gray-600 dark:text-gray-400">
                {section.content}
              </div>
            </motion.div>
          ))}
        </div>

        {/* User Conduct */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
        >
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            User Conduct
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            When using our website, you agree not to:
          </p>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
              Use the service for any unlawful purpose
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
              Attempt to gain unauthorized access to any systems
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
              Transmit viruses or malicious code
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
              Interfere with the proper working of the service
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
              Create multiple accounts for fraudulent purposes
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
              Impersonate another person or entity
            </li>
          </ul>
        </motion.div>

        {/* Account Terms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
        >
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Account Terms
          </h2>
          <ul className="space-y-3 text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
              You must be 18 years or older to create an account
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
              You are responsible for maintaining the confidentiality of your
              account credentials
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
              You are responsible for all activities that occur under your account
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
              You must notify us immediately of any unauthorized use of your
              account
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
              We reserve the right to suspend or terminate accounts that violate
              these terms
            </li>
          </ul>
        </motion.div>

        {/* Governing Law */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
        >
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Governing Law
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            These Terms shall be governed by and construed in accordance with the
            laws of the State of New York, without regard to its conflict of law
            provisions. Any disputes arising from these terms shall be resolved in
            the courts of New York.
          </p>
        </motion.div>

        {/* Changes to Terms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 rounded-xl bg-yellow-50 p-6 dark:bg-yellow-900/20"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 flex-shrink-0 text-yellow-600" />
            <div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Changes to Terms
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We reserve the right to modify these terms at any time. We will
                notify users of any material changes by posting a notice on our
                website. Your continued use of the service after such
                modifications constitutes acceptance of the updated terms.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20"
        >
          <div className="flex items-start gap-4">
            <Mail className="h-6 w-6 flex-shrink-0 text-blue-600" />
            <div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Questions About These Terms?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                If you have any questions about these Terms of Service, please
                contact us at{' '}
                <a
                  href="mailto:legal@shophub.com"
                  className="text-blue-600 hover:underline"
                >
                  legal@shophub.com
                </a>{' '}
                or visit our{' '}
                <a href="/contact" className="text-blue-600 hover:underline">
                  Contact Page
                </a>
                .
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
