// User Types
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddress {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

// Product Types
export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: ICategory | string;
  brand?: string;
  stock: number;
  sku: string;
  tags: string[];
  variants?: IProductVariant[];
  ratings: {
    average: number;
    count: number;
  };
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductVariant {
  name: string;
  options: string[];
  price?: number;
  stock?: number;
}

// Category Types
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: ICategory | string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Types
export interface ICartItem {
  product: IProduct | string;
  quantity: number;
  price: number;
  variant?: {
    name: string;
    value: string;
  };
}

export interface ICart {
  _id: string;
  user: IUser | string;
  items: ICartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface IOrder {
  _id: string;
  orderNumber: string;
  user: IUser | string;
  items: IOrderItem[];
  shippingAddress: IAddress;
  billingAddress?: IAddress;
  paymentMethod: 'stripe' | 'paypal' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId?: string;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  product: IProduct | string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: {
    name: string;
    value: string;
  };
}

// Review Types
export interface IReview {
  _id: string;
  user: IUser | string;
  product: IProduct | string;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter Types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  rating?: number;
  inStock?: boolean;
  search?: string;
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'popular' | 'rating';
  page?: number;
  limit?: number;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Checkout Types
export interface CheckoutData {
  shippingAddress: IAddress;
  billingAddress?: IAddress;
  paymentMethod: 'stripe' | 'paypal' | 'cod';
  notes?: string;
}
