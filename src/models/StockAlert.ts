import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IStockAlertDocument extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  product: mongoose.Types.ObjectId;
  productName: string;
  isNotified: boolean;
  createdAt: Date;
  notifiedAt?: Date;
}

const stockAlertSchema = new Schema<IStockAlertDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    productName: {
      type: String,
      required: true,
    },
    isNotified: {
      type: Boolean,
      default: false,
    },
    notifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate subscriptions
stockAlertSchema.index({ email: 1, product: 1 }, { unique: true });

// Index for querying pending alerts
stockAlertSchema.index({ product: 1, isNotified: 1 });

const StockAlert: Model<IStockAlertDocument> =
  mongoose.models.StockAlert || mongoose.model<IStockAlertDocument>('StockAlert', stockAlertSchema);

export default StockAlert;
