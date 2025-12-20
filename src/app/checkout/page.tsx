'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Truck, MapPin, ArrowLeft, ShoppingBag, Check, User, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/format';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface AddressForm {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface GuestInfo {
  email: string;
  name: string;
}

function CheckoutForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const stripe = useStripe();
  const elements = useElements();
  const { items, getTotalPrice, clearCart, _hasHydrated } = useCartStore();

  const [step, setStep] = useState(0); // 0 = choose auth method, 1 = shipping, 2 = payment, 3 = review
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>('stripe');
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    email: '',
    name: '',
  });
  const [address, setAddress] = useState<AddressForm>({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });

  const subtotal = getTotalPrice();
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Set step based on session status
  useEffect(() => {
    if (status === 'authenticated' && step === 0) {
      setStep(1); // Skip auth choice for logged in users
    }
  }, [status, step]);

  useEffect(() => {
    // Only redirect after hydration is complete and cart is truly empty
    if (_hasHydrated && items.length === 0) {
      router.push('/products');
    }
  }, [items, router, _hasHydrated]);

  const handleAddressChange = (field: keyof AddressForm, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validateAddress = () => {
    const required = ['fullName', 'phone', 'street', 'city', 'state', 'zipCode', 'country'];
    for (const field of required) {
      if (!address[field as keyof AddressForm]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  const validateGuestInfo = () => {
    if (!guestInfo.email) {
      toast.error('Please enter your email address');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleGuestContinue = () => {
    if (validateGuestInfo()) {
      setIsGuestCheckout(true);
      setStep(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAddress()) return;

    setIsLoading(true);

    try {
      if (paymentMethod === 'stripe') {
        if (!stripe || !elements) {
          toast.error('Stripe not loaded');
          return;
        }

        // Create payment intent
        const intentRes = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const intentData = await intentRes.json();

        if (!intentData.success) {
          throw new Error(intentData.error);
        }

        // Confirm payment
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          intentData.data.clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement)!,
              billing_details: {
                name: address.fullName,
                email: session?.user?.email,
              },
            },
          }
        );

        if (error) {
          throw new Error(error.message);
        }

        if (paymentIntent?.status !== 'succeeded') {
          throw new Error('Payment failed');
        }
      }

      // Create order with cart items from client
      const orderPayload: Record<string, unknown> = {
        shippingAddress: address,
        paymentMethod,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          variant: item.variant,
        })),
      };

      // Add guest checkout data
      if (isGuestCheckout) {
        orderPayload.isGuestCheckout = true;
        orderPayload.guestEmail = guestInfo.email;
        orderPayload.guestName = guestInfo.name || address.fullName;
      }

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.error);
      }

      clearCart();
      toast.success('Order placed successfully!');

      // Redirect based on user type
      if (isGuestCheckout) {
        router.push(`/order-confirmation?orderNumber=${orderData.data.orderNumber}&email=${encodeURIComponent(guestInfo.email)}`);
      } else {
        router.push(`/profile/orders/${orderData.data._id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Checkout failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while hydrating
  if (!_hasHydrated || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  // Step 0: Auth Choice (only for non-authenticated users)
  if (step === 0 && !session) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-950">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/cart"
            className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900"
          >
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              How would you like to checkout?
            </h1>

            <div className="space-y-4">
              {/* Login Option */}
              <Link
                href="/login?callbackUrl=/checkout"
                className="flex items-center gap-4 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-blue-600 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-blue-900/20"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Sign in to your account
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Track orders and access your order history
                  </p>
                </div>
                <ArrowLeft className="h-5 w-5 rotate-180 text-gray-400" />
              </Link>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                    or
                  </span>
                </div>
              </div>

              {/* Guest Checkout Option */}
              <div className="rounded-lg border-2 border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <Mail className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Continue as Guest
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Checkout without creating an account
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Input
                    label="Email Address"
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email for order updates"
                    required
                  />
                  <Input
                    label="Name (Optional)"
                    value={guestInfo.name}
                    onChange={(e) => setGuestInfo((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                  />
                  <Button onClick={handleGuestContinue} className="w-full">
                    Continue as Guest
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/cart"
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Progress Steps */}
              <div className="mb-8 flex items-center justify-between">
                {['Shipping', 'Payment', 'Review'].map((label, index) => (
                  <div key={label} className="flex items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                        step > index + 1
                          ? 'bg-green-500 text-white'
                          : step === index + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {step > index + 1 ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    <span
                      className={`ml-2 text-sm font-medium ${
                        step >= index + 1
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400'
                      }`}
                    >
                      {label}
                    </span>
                    {index < 2 && (
                      <div className="mx-4 h-0.5 w-16 bg-gray-200 dark:bg-gray-700" />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Shipping */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
                >
                  <div className="mb-6 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Shipping Address
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Full Name"
                      value={address.fullName}
                      onChange={(e) => handleAddressChange('fullName', e.target.value)}
                      required
                    />
                    <Input
                      label="Phone"
                      value={address.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      required
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="Street Address"
                        value={address.street}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                        required
                      />
                    </div>
                    <Input
                      label="City"
                      value={address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      required
                    />
                    <Input
                      label="State"
                      value={address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      required
                    />
                    <Input
                      label="ZIP Code"
                      value={address.zipCode}
                      onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                      required
                    />
                    <Input
                      label="Country"
                      value={address.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      required
                    />
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button onClick={() => setStep(2)}>Continue to Payment</Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
                >
                  <div className="mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Payment Method
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {/* Credit Card Option */}
                    <label
                      className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-colors ${
                        paymentMethod === 'stripe'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="stripe"
                        checked={paymentMethod === 'stripe'}
                        onChange={() => setPaymentMethod('stripe')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Credit / Debit Card
                        </p>
                        <p className="text-sm text-gray-500">Pay securely with Stripe</p>
                      </div>
                    </label>

                    {/* COD Option */}
                    <label
                      className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-colors ${
                        paymentMethod === 'cod'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <Truck className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Cash on Delivery
                        </p>
                        <p className="text-sm text-gray-500">Pay when you receive</p>
                      </div>
                    </label>

                    {/* Card Element */}
                    {paymentMethod === 'stripe' && (
                      <div className="mt-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Card Details
                        </label>
                        <CardElement
                          options={{
                            style: {
                              base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                  color: '#aab7c4',
                                },
                              },
                            },
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)}>Review Order</Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Shipping Summary */}
                  <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Shipping Address
                      </h3>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {address.fullName}
                      <br />
                      {address.street}
                      <br />
                      {address.city}, {address.state} {address.zipCode}
                      <br />
                      {address.country}
                      <br />
                      Phone: {address.phone}
                    </p>
                  </div>

                  {/* Payment Summary */}
                  <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Payment Method
                      </h3>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {paymentMethod === 'stripe'
                        ? 'Credit / Debit Card'
                        : 'Cash on Delivery'}
                    </p>
                  </div>

                  {/* Submit */}
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button type="submit" isLoading={isLoading} size="lg">
                      Place Order - {formatPrice(total)}
                    </Button>
                  </div>
                </motion.div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Order Summary
              </h2>

              {/* Items */}
              <div className="max-h-64 space-y-4 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variant?.value || 'default'}`}
                    className="flex gap-3"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <hr className="my-4 border-gray-200 dark:border-gray-700" />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="text-gray-900 dark:text-white">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax (8%)</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatPrice(tax)}
                  </span>
                </div>
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {shipping === 0 && (
                <p className="mt-4 text-center text-sm text-green-600 dark:text-green-400">
                  You qualify for free shipping!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
