import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import NewsletterPopup from '@/components/newsletter/NewsletterPopup';
import CompareDrawer from '@/components/product/CompareDrawer';
import CompareFloatingButton from '@/components/product/CompareFloatingButton';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'ShopHub - Your One-Stop Online Store',
    template: '%s | ShopHub',
  },
  description:
    'Discover amazing products at great prices. Shop electronics, fashion, home goods, and more at ShopHub.',
  keywords: ['ecommerce', 'online shopping', 'electronics', 'fashion', 'home goods'],
  authors: [{ name: 'ShopHub' }],
  creator: 'ShopHub',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'ShopHub',
    title: 'ShopHub - Your One-Stop Online Store',
    description:
      'Discover amazing products at great prices. Shop electronics, fashion, home goods, and more at ShopHub.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopHub - Your One-Stop Online Store',
    description:
      'Discover amazing products at great prices. Shop electronics, fashion, home goods, and more at ShopHub.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <NewsletterPopup />
            <CompareDrawer />
            <CompareFloatingButton />
          </div>
        </Providers>
      </body>
    </html>
  );
}
