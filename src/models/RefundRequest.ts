import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IRefundItem {
  product: mongoose.Types.ObjectId | string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  refundQuantity: number;
}

export interface IRefundRequestDocument extends Document {
  _id: mongoose.Types.ObjectId;
  requestNumber: string;
  order: mongoose.Types.ObjectId | string;
  orderNumber: string;
  user?: mongoose.Types.ObjectId | string;
  guestEmail?: string;
  items: IRefundItem[];
  reason: 'defective' | 'wrong_item' | 'not_as_described' | 'changed_mind' | 'damaged_shipping' | 'other';
  reasonDetails: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  type: 'refund' | 'return' | 'exchange';
  refundAmount: number;
  refundMethod: 'original_payment' | 'store_credit';
  adminNotes?: string;
  rejectionReason?: string;
  processedBy?: mongoose.Types.ObjectId | string;
  processedAt?: Date;
  completedAt?: Date;
  images?: string[]; // Customer can upload images of defective/damaged items
  createdAt: Date;
  updatedAt: Date;
}

const refundItemSchema = new Schema<IRefundItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    refundQuantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const refundRequestSchema = new Schema<IRefundRequestDocument>(
  {
    requestNumber: {
      type: String,
      required: true,
      unique: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    guestEmail: {
      type: String,
      required: false,
    },
    items: {
      type: [refundItemSchema],
      required: true,
      validate: {
        validator: function (v: IRefundItem[]) {
          return v.length > 0;
        },
        message: 'Refund request must include at least one item',
      },
    },
    reason: {
      type: String,
      enum: ['defective', 'wrong_item', 'not_as_described', 'changed_mind', 'damaged_shipping', 'other'],
      required: true,
    },
    reasonDetails: {
      type: String,
      required: true,
      minlength: [10, 'Please provide more details about your request (at least 10 characters)'],
      maxlength: [1000, 'Details cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'processing', 'completed'],
      default: 'pending',
    },
    type: {
      type: String,
      enum: ['refund', 'return', 'exchange'],
      required: true,
    },
    refundAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    refundMethod: {
      type: String,
      enum: ['original_payment', 'store_credit'],
      default: 'original_payment',
    },
    adminNotes: String,
    rejectionReason: String,
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: Date,
    completedAt: Date,
    images: [String],
  },
  {
    timestamps: true,
  }
);

// Generate request number before validation
refundRequestSchema.pre('validate', async function () {
  if (!this.requestNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.requestNumber = `REF-${year}${month}-${random}`;
  }
});

// Indexes for faster queries
refundRequestSchema.index({ requestNumber: 1 });
refundRequestSchema.index({ order: 1 });
refundRequestSchema.index({ user: 1 });
refundRequestSchema.index({ guestEmail: 1 });
refundRequestSchema.index({ status: 1 });
refundRequestSchema.index({ createdAt: -1 });

const RefundRequest: Model<IRefundRequestDocument> =
  mongoose.models.RefundRequest || mongoose.model<IRefundRequestDocument>('RefundRequest', refundRequestSchema);

export default RefundRequest;
