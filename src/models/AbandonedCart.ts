import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAbandonedCartItem {
  product: mongoose.Types.ObjectId;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface IAbandonedCartDocument extends Document {
  _id: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  email: string;
  items: IAbandonedCartItem[];
  totalAmount: number;
  remindersSent: number;
  lastReminderAt?: Date;
  isRecovered: boolean;
  recoveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const abandonedCartSchema = new Schema<IAbandonedCartDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productName: { type: String, required: true },
        productImage: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    remindersSent: {
      type: Number,
      default: 0,
    },
    lastReminderAt: {
      type: Date,
    },
    isRecovered: {
      type: Boolean,
      default: false,
    },
    recoveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding carts to remind
abandonedCartSchema.index({ email: 1, isRecovered: 1 });
abandonedCartSchema.index({ createdAt: 1, remindersSent: 1, isRecovered: 1 });
abandonedCartSchema.index({ user: 1, isRecovered: 1 });

const AbandonedCart: Model<IAbandonedCartDocument> =
  mongoose.models.AbandonedCart ||
  mongoose.model<IAbandonedCartDocument>('AbandonedCart', abandonedCartSchema);

export default AbandonedCart;
