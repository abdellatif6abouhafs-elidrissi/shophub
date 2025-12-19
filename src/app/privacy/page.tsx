'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Cookie, Mail } from 'lucide-react';

const sections = [
  {
    icon: Database,
    title: 'Information We Collect',
    content: `We collect information you provide directly to us, such as when you create an account, make a purchase, subscribe to our newsletter, or contact us for support.

This information may include:
• Personal information (name, email address, phone number)
• Billing and shipping addresses
• Payment information (processed securely through our payment providers)
• Order history and preferences
• Communications with our support team`,
  },
  {
    icon: Eye,
    title: 'How We Use Your Information',
    content: `We use the information we collect to:
• Process and fulfill your orders
• Send order confirmations and shipping updates
• Respond to your comments, questions, and requests
• Send marketing communications (with your consent)
• Personalize your shopping experience
• Improve our website and services
• Detect, investigate, and prevent fraudulent transactions`,
  },
  {
    icon: Lock,
    title: 'Information Security',
    content: `We take the security of your personal information seriously. We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction.

• All data is encrypted in transit using SSL/TLS
• Payment information is processed through PCI-compliant providers
• We regularly review and update our security practices
• Access to personal data is restricted to authorized personnel only`,
  },
  {
    icon: Cookie,
    title: 'Cookies & Tracking',
    content: `We use cookies and similar tracking technologies to:
• Remember your preferences and settings
• Understand how you interact with our website
• Analyze website traffic and performance
• Deliver relevant advertisements

You can control cookie preferences through your browser settings. Note that disabling cookies may affect website functionality.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Shield className="mx-auto mb-6 h-16 w-16 text-white" />
            <h1 className="mb-4 text-4xl font-bold text-white">Privacy Policy</h1>
            <p className="mx-auto max-w-2xl text-lg text-blue-100">
              Your privacy is important to us. This policy explains how we
              collect, use, and protect your information.
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
          <p className="text-gray-600 dark:text-gray-400">
            ShopHub (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you visit our website or make a
            purchase. Please read this privacy policy carefully. If you do not
            agree with the terms of this privacy policy, please do not access the
            site.
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

        {/* Data Sharing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
        >
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Information Sharing
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            We do not sell, trade, or rent your personal information to third
            parties. We may share your information with:
          </p>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
              <span>
                <strong>Service Providers:</strong> Companies that help us operate
                our business (payment processors, shipping carriers, etc.)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
              <span>
                <strong>Legal Requirements:</strong> When required by law or to
                protect our rights
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
              <span>
                <strong>Business Transfers:</strong> In connection with a merger,
                acquisition, or sale of assets
              </span>
            </li>
          </ul>
        </motion.div>

        {/* Your Rights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
        >
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Your Rights
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Depending on your location, you may have certain rights regarding your
            personal information:
          </p>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
              Access and receive a copy of your personal data
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
              Correct inaccurate personal data
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
              Request deletion of your personal data
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
              Opt-out of marketing communications
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
              Withdraw consent where applicable
            </li>
          </ul>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20"
        >
          <div className="flex items-start gap-4">
            <Mail className="h-6 w-6 flex-shrink-0 text-blue-600" />
            <div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Questions About This Policy?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                If you have any questions about this Privacy Policy, please
                contact us at{' '}
                <a
                  href="mailto:privacy@shophub.com"
                  className="text-blue-600 hover:underline"
                >
                  privacy@shophub.com
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
