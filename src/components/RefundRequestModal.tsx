'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertCircle,
  Package,
  RefreshCcw,
  ArrowLeftRight,
  Check,
  Loader2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/utils/format';
import toast from 'react-hot-toast';

interface OrderItem {
  product?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: {
    name: string;
    value: string;
  };
}

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  items: OrderItem[];
  onSuccess: () => void;
}

const reasonOptions = [
  { value: 'defective', label: 'Product is defective' },
  { value: 'wrong_item', label: 'Received wrong item' },
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'damaged_shipping', label: 'Damaged during shipping' },
  { value: 'other', label: 'Other reason' },
];

const typeOptions = [
  { value: 'refund', label: 'Full Refund', icon: RefreshCcw, description: 'Get your money back' },
  { value: 'return', label: 'Return & Refund', icon: Package, description: 'Return item for refund' },
  { value: 'exchange', label: 'Exchange', icon: ArrowLeftRight, description: 'Replace with new item' },
];

export default function RefundRequestModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  items,
  onSuccess,
}: RefundRequestModalProps) {
  const [step, setStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [type, setType] = useState<string>('refund');
  const [reason, setReason] = useState<string>('');
  const [reasonDetails, setReasonDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleItem = (index: number, quantity: number) => {
    setSelectedItems((prev) => {
      const key = index.toString();
      if (prev[key]) {
        const { [key]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: quantity };
    });
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [index.toString()]: quantity,
    }));
  };

  const calculateRefundAmount = () => {
    return Object.entries(selectedItems).reduce((total, [index, qty]) => {
      const item = items[parseInt(index)];
      return total + item.price * qty;
    }, 0);
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedItems).length === 0) {
      toast.error('Please select at least one item');
      return;
    }

    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    if (reasonDetails.length < 10) {
      toast.error('Please provide more details (at least 10 characters)');
      return;
    }

    setIsSubmitting(true);

    try {
      const itemsToRefund = Object.entries(selectedItems).map(([index, qty]) => {
        const item = items[parseInt(index)];
        return {
          productId: item.product || `item-${index}`,
          quantity: qty,
        };
      });

      const res = await fetch('/api/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          items: itemsToRefund,
          reason,
          reasonDetails,
          type,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit refund request');
      }

      toast.success('Refund request submitted successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setSelectedItems({});
    setType('refund');
    setReason('');
    setReasonDetails('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-gray-900"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Request Refund/Return
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Order #{orderNumber}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Steps */}
          <div className="flex border-b border-gray-200 px-6 dark:border-gray-700">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => s < step && setStep(s)}
                className={`flex-1 py-3 text-sm font-medium ${
                  s === step
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : s < step
                    ? 'text-gray-600 dark:text-gray-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {s}. {s === 1 ? 'Select Items' : s === 2 ? 'Request Type' : 'Details'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Select Items */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Select the items you want to return or refund:
                </p>
                {items.map((item, index) => {
                  const isSelected = selectedItems[index.toString()];
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-4 rounded-xl border-2 p-4 transition-colors ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(index, item.quantity)}
                        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {isSelected && <Check className="h-4 w-4" />}
                      </button>
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
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </h3>
                        {item.variant && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.variant.name}: {item.variant.value}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatPrice(item.price)} x {item.quantity}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600 dark:text-gray-400">
                            Qty:
                          </label>
                          <select
                            value={selectedItems[index.toString()]}
                            onChange={(e) =>
                              updateItemQuantity(index, parseInt(e.target.value))
                            }
                            className="rounded-lg border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
                          >
                            {Array.from({ length: item.quantity }, (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 2: Request Type */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    What would you like to do?
                  </p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {typeOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setType(option.value)}
                          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors ${
                            type === option.value
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                          }`}
                        >
                          <Icon
                            className={`h-6 w-6 ${
                              type === option.value
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            }`}
                          />
                          <span
                            className={`font-medium ${
                              type === option.value
                                ? 'text-blue-600'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {option.label}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {option.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    Why are you requesting this?
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {reasonOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setReason(option.value)}
                        className={`rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                          reason === option.value
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                        }`}
                      >
                        <span
                          className={
                            reason === option.value
                              ? 'text-blue-600'
                              : 'text-gray-700 dark:text-gray-300'
                          }
                        >
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block font-medium text-gray-900 dark:text-white">
                    Please provide details about your request
                  </label>
                  <textarea
                    value={reasonDetails}
                    onChange={(e) => setReasonDetails(e.target.value)}
                    rows={4}
                    placeholder="Describe the issue in detail..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {reasonDetails.length}/1000 characters (minimum 10)
                  </p>
                </div>

                {/* Summary */}
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                  <h3 className="mb-3 font-medium text-gray-900 dark:text-white">
                    Request Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Items:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {Object.keys(selectedItems).length} item(s)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Reason:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {reasonOptions.find((r) => r.value === reason)?.label}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                      <div className="flex justify-between text-base">
                        <span className="font-medium text-gray-900 dark:text-white">
                          Refund Amount:
                        </span>
                        <span className="font-bold text-blue-600">
                          {formatPrice(calculateRefundAmount())}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Your request will be reviewed by our team. You&apos;ll receive an email
                    notification once it&apos;s processed. This usually takes 1-3 business days.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            ) : (
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            )}

            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && Object.keys(selectedItems).length === 0) ||
                  (step === 2 && (!type || !reason))
                }
              >
                Continue
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
