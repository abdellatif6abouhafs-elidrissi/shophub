import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  variant?: {
    name: string;
    value: string;
  };
}

export interface AppliedCoupon {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discount: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  coupon: AppliedCoupon | null;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string, variant?: { name: string; value: string }) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variant?: { name: string; value: string }
  ) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  getDiscountedTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      coupon: null,

      addItem: (item) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) =>
              i.productId === item.productId &&
              JSON.stringify(i.variant) === JSON.stringify(item.variant)
          );

          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            const newQuantity = newItems[existingItemIndex].quantity + (item.quantity || 1);
            newItems[existingItemIndex].quantity = Math.min(newQuantity, item.stock);
            return { items: newItems };
          }

          return {
            items: [...state.items, { ...item, quantity: item.quantity || 1 }],
          };
        });
      },

      removeItem: (productId, variant) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.productId === productId &&
                JSON.stringify(item.variant) === JSON.stringify(variant)
              )
          ),
        }));
      },

      updateQuantity: (productId, quantity, variant) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (item) =>
                  !(
                    item.productId === productId &&
                    JSON.stringify(item.variant) === JSON.stringify(variant)
                  )
              ),
            };
          }

          return {
            items: state.items.map((item) =>
              item.productId === productId &&
              JSON.stringify(item.variant) === JSON.stringify(variant)
                ? { ...item, quantity: Math.min(quantity, item.stock) }
                : item
            ),
          };
        });
      },

      clearCart: () => set({ items: [], coupon: null }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      applyCoupon: (coupon) => set({ coupon }),

      removeCoupon: () => set({ coupon: null }),

      getDiscountedTotal: () => {
        const subtotal = get().getTotalPrice();
        const coupon = get().coupon;
        if (!coupon) return subtotal;
        return Math.max(0, subtotal - coupon.discount);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
