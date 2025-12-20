'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, X, Loader2, Check, Mail } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface NotifyMeButtonProps {
  productId: string;
  productName: string;
}

export default function NotifyMeButton({ productId, productName }: NotifyMeButtonProps) {
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
        toast.success('Ghadi n3lmouk mli product irj3 disponible!');
        setTimeout(() => setIsOpen(false), 2000);
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
    <>
      {/* Notify Me Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
      >
        <Bell className="mr-2 h-5 w-5" />
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
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4"
            >
              <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>

                {isSubscribed ? (
                  /* Success State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8 text-center"
                  >
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      Tsjel Mzyan!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Ghadi n3lmouk f <span className="font-medium">{email}</span> mli {productName} irj3 disponible.
                    </p>
                  </motion.div>
                ) : (
                  /* Form State */
                  <>
                    <div className="mb-6 text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                        <BellRing className="h-7 w-7 text-orange-600" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                        3lemni mli irj3!
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Dkhel email dyalk w ghadi n3lmouk mli <span className="font-medium">{productName}</span> irj3 disponible.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        leftIcon={<Mail className="h-4 w-4" />}
                        required
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Kansjel...
                          </>
                        ) : (
                          <>
                            <Bell className="mr-2 h-4 w-4" />
                            3lemni
                          </>
                        )}
                      </Button>
                    </form>

                    <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                      Ghadi nrslou lik email wa7ed bla spam
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
