import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISettingsDocument extends Document {
  _id: mongoose.Types.ObjectId;
  key: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettingsDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'json'],
      default: 'string',
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

settingsSchema.index({ key: 1 });
settingsSchema.index({ category: 1 });

const Settings: Model<ISettingsDocument> =
  mongoose.models.Settings || mongoose.model<ISettingsDocument>('Settings', settingsSchema);

export default Settings;

// Default settings
export const defaultSettings = [
  {
    key: 'store_name',
    value: 'ShopHub',
    type: 'string',
    category: 'general',
    description: 'Your store name',
  },
  {
    key: 'store_email',
    value: 'contact@shophub.com',
    type: 'string',
    category: 'general',
    description: 'Store contact email',
  },
  {
    key: 'store_phone',
    value: '',
    type: 'string',
    category: 'general',
    description: 'Store contact phone',
  },
  {
    key: 'store_address',
    value: '',
    type: 'string',
    category: 'general',
    description: 'Store address',
  },
  {
    key: 'currency',
    value: 'USD',
    type: 'string',
    category: 'general',
    description: 'Store currency',
  },
  {
    key: 'tax_rate',
    value: 0,
    type: 'number',
    category: 'checkout',
    description: 'Tax rate percentage',
  },
  {
    key: 'free_shipping_threshold',
    value: 100,
    type: 'number',
    category: 'checkout',
    description: 'Minimum order amount for free shipping',
  },
  {
    key: 'shipping_cost',
    value: 10,
    type: 'number',
    category: 'checkout',
    description: 'Default shipping cost',
  },
  {
    key: 'enable_reviews',
    value: true,
    type: 'boolean',
    category: 'features',
    description: 'Enable product reviews',
  },
  {
    key: 'enable_coupons',
    value: true,
    type: 'boolean',
    category: 'features',
    description: 'Enable coupon codes',
  },
  {
    key: 'enable_wishlist',
    value: true,
    type: 'boolean',
    category: 'features',
    description: 'Enable wishlist feature',
  },
  {
    key: 'maintenance_mode',
    value: false,
    type: 'boolean',
    category: 'advanced',
    description: 'Enable maintenance mode',
  },
];
