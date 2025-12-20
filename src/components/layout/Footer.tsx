'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone, Shield, Truck, RefreshCw, Lock } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <img src="/icon.svg" alt="ShopHub" className="h-9 w-9" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-600">
                ShopHub
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Your one-stop destination for all your shopping needs. Quality products, great prices, and exceptional service.
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-blue-600"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-blue-400"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-pink-600"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-red-600"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/products"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products?featured=true"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Featured
                </Link>
              </li>
              <li>
                <Link
                  href="/products?sort=newest"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="/products?inStock=true"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  In Stock
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Customer Service
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  123 Commerce Street, Suite 100
                  <br />
                  New York, NY 10001
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <a
                  href="tel:+1234567890"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <a
                  href="mailto:support@shophub.com"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  support@shophub.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Secure Payment</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">SSL Encrypted</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Fast Shipping</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">2-5 Business Days</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                <RefreshCw className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Easy Returns</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">30-Day Policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Buyer Protection</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Money-Back Guarantee</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {currentYear} ShopHub. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              {/* Visa */}
              <div className="flex h-8 w-12 items-center justify-center rounded bg-gray-100 dark:bg-gray-800" title="Visa">
                <svg viewBox="0 0 48 32" className="h-5 w-8">
                  <rect fill="#1A1F71" width="48" height="32" rx="4"/>
                  <path fill="#FFFFFF" d="M19.5 21h-2.7l1.7-10.5h2.7L19.5 21zm11.2-10.2c-.5-.2-1.4-.4-2.4-.4-2.7 0-4.6 1.4-4.6 3.5 0 1.5 1.4 2.4 2.4 2.9 1.1.5 1.4.9 1.4 1.3 0 .7-.9 1-1.7 1-1.1 0-1.7-.2-2.6-.6l-.4-.2-.4 2.4c.7.3 1.9.5 3.1.5 2.9 0 4.7-1.4 4.7-3.6 0-1.2-.8-2.1-2.4-2.9-1-.5-1.6-.8-1.6-1.3 0-.4.5-.9 1.6-.9.9 0 1.6.2 2.1.4l.3.1.4-2.2zm7.1-.3h-2.1c-.7 0-1.2.2-1.5.9l-4.2 10.1h2.9l.6-1.6h3.6l.3 1.6h2.6l-2.2-10.9zm-3.5 7l1.5-4 .8 4h-2.3zm-17.8-7L14 17.7l-.3-1.4c-.5-1.6-2-3.4-3.7-4.2l2.5 9h2.9l4.4-10.5h-2.9z"/>
                </svg>
              </div>
              {/* Mastercard */}
              <div className="flex h-8 w-12 items-center justify-center rounded bg-gray-100 dark:bg-gray-800" title="Mastercard">
                <svg viewBox="0 0 48 32" className="h-5 w-8">
                  <rect fill="#000000" width="48" height="32" rx="4"/>
                  <circle fill="#EB001B" cx="18" cy="16" r="8"/>
                  <circle fill="#F79E1B" cx="30" cy="16" r="8"/>
                  <path fill="#FF5F00" d="M24 10.3c1.9 1.5 3 3.5 3 5.7s-1.1 4.2-3 5.7c-1.9-1.5-3-3.5-3-5.7s1.1-4.2 3-5.7z"/>
                </svg>
              </div>
              {/* PayPal */}
              <div className="flex h-8 w-12 items-center justify-center rounded bg-gray-100 dark:bg-gray-800" title="PayPal">
                <svg viewBox="0 0 48 32" className="h-5 w-8">
                  <rect fill="#003087" width="48" height="32" rx="4"/>
                  <path fill="#FFFFFF" d="M18.5 10h4.2c2.3 0 3.9 1.1 3.6 3.5-.4 3-2.4 4.5-5 4.5h-1.1c-.4 0-.7.3-.8.7l-.6 3.8c0 .2-.2.4-.4.4h-2.6c-.3 0-.4-.2-.4-.5l1.6-11.8c.1-.4.4-.6.8-.6h.7zm4 2.3h-1.3l-.7 4h1c1.5 0 2.5-.8 2.7-2.3.2-1.2-.4-1.7-1.7-1.7z"/>
                  <path fill="#009CDE" d="M29.5 10h4.2c2.3 0 3.9 1.1 3.6 3.5-.4 3-2.4 4.5-5 4.5h-1.1c-.4 0-.7.3-.8.7l-.6 3.8c0 .2-.2.4-.4.4h-2.6c-.3 0-.4-.2-.4-.5l1.6-11.8c.1-.4.4-.6.8-.6h.7zm4 2.3h-1.3l-.7 4h1c1.5 0 2.5-.8 2.7-2.3.2-1.2-.4-1.7-1.7-1.7z"/>
                </svg>
              </div>
              {/* Stripe */}
              <div className="flex h-8 w-12 items-center justify-center rounded bg-gray-100 dark:bg-gray-800" title="Stripe">
                <svg viewBox="0 0 48 32" className="h-5 w-8">
                  <rect fill="#635BFF" width="48" height="32" rx="4"/>
                  <path fill="#FFFFFF" d="M22.5 13.5c0-.8.7-1.2 1.8-1.2 1.6 0 3.6.5 5.2 1.4V9.5c-1.7-.7-3.5-1-5.2-1-4.3 0-7.1 2.2-7.1 5.9 0 5.8 8 4.9 8 7.4 0 1-.8 1.3-2 1.3-1.7 0-4-.7-5.7-1.7v4.3c1.9.8 3.9 1.2 5.7 1.2 4.4 0 7.4-2.2 7.4-5.9 0-6.2-8-5.1-8-7.5z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
