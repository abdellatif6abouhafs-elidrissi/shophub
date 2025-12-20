/**
 * Google Analytics 4 (GA4) Integration
 * Enhanced e-commerce tracking for the store
 */

// GA4 Measurement ID - set in environment variable
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Check if GA is available
export const isGAEnabled = (): boolean => {
  return typeof window !== 'undefined' && !!GA_MEASUREMENT_ID;
};

// Declare gtag function type
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

// Initialize dataLayer
export const initializeGA = (): void => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
    window.gtag('js', new Date().toISOString());
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: window.location.pathname,
    });
  }
};

// Track page views
export const pageview = (url: string): void => {
  if (!isGAEnabled()) return;
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Track custom events
export const event = (
  action: string,
  params?: Record<string, unknown>
): void => {
  if (!isGAEnabled()) return;
  window.gtag('event', action, params);
};

// ============================================
// E-commerce Tracking Events (GA4 Standard)
// ============================================

export interface ProductItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_brand?: string;
  price: number;
  quantity?: number;
  discount?: number;
}

// View item list (category page, search results)
export const viewItemList = (
  listName: string,
  items: ProductItem[]
): void => {
  event('view_item_list', {
    item_list_id: listName.toLowerCase().replace(/\s+/g, '_'),
    item_list_name: listName,
    items: items.map((item, index) => ({
      ...item,
      index,
    })),
  });
};

// View single product
export const viewItem = (item: ProductItem): void => {
  event('view_item', {
    currency: 'USD',
    value: item.price,
    items: [item],
  });
};

// Add item to cart
export const addToCart = (item: ProductItem): void => {
  event('add_to_cart', {
    currency: 'USD',
    value: item.price * (item.quantity || 1),
    items: [item],
  });
};

// Remove item from cart
export const removeFromCart = (item: ProductItem): void => {
  event('remove_from_cart', {
    currency: 'USD',
    value: item.price * (item.quantity || 1),
    items: [item],
  });
};

// View cart
export const viewCart = (items: ProductItem[], total: number): void => {
  event('view_cart', {
    currency: 'USD',
    value: total,
    items,
  });
};

// Begin checkout
export const beginCheckout = (items: ProductItem[], total: number): void => {
  event('begin_checkout', {
    currency: 'USD',
    value: total,
    items,
  });
};

// Add shipping info
export const addShippingInfo = (
  items: ProductItem[],
  total: number,
  shippingTier: string
): void => {
  event('add_shipping_info', {
    currency: 'USD',
    value: total,
    shipping_tier: shippingTier,
    items,
  });
};

// Add payment info
export const addPaymentInfo = (
  items: ProductItem[],
  total: number,
  paymentType: string
): void => {
  event('add_payment_info', {
    currency: 'USD',
    value: total,
    payment_type: paymentType,
    items,
  });
};

// Purchase complete
export const purchase = (
  transactionId: string,
  items: ProductItem[],
  total: number,
  shipping: number = 0,
  tax: number = 0,
  coupon?: string
): void => {
  event('purchase', {
    transaction_id: transactionId,
    currency: 'USD',
    value: total,
    shipping,
    tax,
    coupon,
    items,
  });
};

// Refund
export const refund = (
  transactionId: string,
  items?: ProductItem[],
  total?: number
): void => {
  const params: Record<string, unknown> = {
    transaction_id: transactionId,
    currency: 'USD',
  };
  if (total !== undefined) params.value = total;
  if (items) params.items = items;

  event('refund', params);
};

// ============================================
// User Engagement Events
// ============================================

// Search
export const search = (searchTerm: string): void => {
  event('search', {
    search_term: searchTerm,
  });
};

// Sign up
export const signUp = (method: string): void => {
  event('sign_up', {
    method,
  });
};

// Login
export const login = (method: string): void => {
  event('login', {
    method,
  });
};

// Add to wishlist
export const addToWishlist = (item: ProductItem): void => {
  event('add_to_wishlist', {
    currency: 'USD',
    value: item.price,
    items: [item],
  });
};

// Share
export const share = (
  method: string,
  contentType: string,
  itemId: string
): void => {
  event('share', {
    method,
    content_type: contentType,
    item_id: itemId,
  });
};

// Newsletter signup
export const newsletterSignup = (email?: string): void => {
  event('newsletter_signup', {
    email_provided: !!email,
  });
};

// Contact form submission
export const contactFormSubmit = (): void => {
  event('contact_form_submit');
};

// Review submitted
export const reviewSubmit = (productId: string, rating: number): void => {
  event('review_submit', {
    product_id: productId,
    rating,
  });
};

// Apply coupon
export const applyCoupon = (couponCode: string, success: boolean): void => {
  event('apply_coupon', {
    coupon_code: couponCode,
    success,
  });
};
