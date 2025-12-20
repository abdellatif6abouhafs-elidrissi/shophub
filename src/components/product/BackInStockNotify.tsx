'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Mail, CheckCircle, Loader2, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface BackInStockNotifyProps {
  productId: string;
  productName: string;
}

export default function BackInStockNotify({ productId, productName }: BackInStockNotifyProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(session?.user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Dkhel email dyalk');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email machi sahih');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/stock-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, productId }),
      });

      const data = await res.json();

      if (data.success) {
        setIsSubscribed(true);
        toast.success('Ghadi n3lmouk mli product irj3!');
        setTimeout(() => {
          setIsOpen(false);
          setIsSubscribed(false);
        }, 2500);
      } else {
        toast.error(data.error || 'Kayn chi mochkil');
      }
    } catch (error) {
      toast.error('Kayn chi mochkil, 3awed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Trigger Button */}
      <Button
        variant="outline"
        className="w-full border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
        onClick={() => setIsOpen(true)}
      >
        <Bell className="mr-2 h-4 w-4" />
        3lemni mli irj3 disponible
      </Button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4"
            >
              <div className="overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-orange-500 to-amber-600 px-6 py-8 text-center">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute right-4 top-4 rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring' }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20"
                  >
                    {isSubscribed ? (
                      <CheckCircle className="h-8 w-8 text-white" />
                    ) : (
                      <Bell className="h-8 w-8 text-white" />
                    )}
                  </motion.div>

                  <h2 className="mb-2 text-xl font-bold text-white">
                    {isSubscribed ? 'You\'re on the list!' : 'Get Notified'}
                  </h2>
                  <p className="text-orange-100">
                    {isSubscribed
                      ? `We'll email you when "${productName}" is back in stock`
                      : `Be the first to know when "${productName}" is available again`}
                  </p>
                </div>

                {/* Form */}
                <div className="p-6">
                  {!isSubscribed ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Subscribing...
                          </>
                        ) : (
                          <>
                            <Bell className="mr-2 h-4 w-4" />
                            Notify Me
                          </>
                        )}
                      </Button>
                      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                        We'll only email you once when this item is back in stock.
                      </p>
                    </form>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-gray-600 dark:text-gray-400">
                        Check your inbox for confirmation.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
