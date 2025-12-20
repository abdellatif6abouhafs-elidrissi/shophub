import mongoose, { Document, Model, Schema } from 'mongoose';

export type NotificationType =
  | 'order_placed'
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'payment_received'
  | 'payment_failed'
  | 'low_stock'
  | 'new_review'
  | 'new_user'
  | 'promo'
  | 'system';

export interface INotificationDocument extends Document {
  _id: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId | string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  isAdmin: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    type: {
      type: String,
      enum: [
        'order_placed',
        'order_confirmed',
        'order_shipped',
        'order_delivered',
        'order_cancelled',
        'payment_received',
        'payment_failed',
        'low_stock',
        'new_review',
        'new_user',
        'promo',
        'system',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    link: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ isAdmin: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

// Auto-delete old notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification: Model<INotificationDocument> =
  mongoose.models.Notification || mongoose.model<INotificationDocument>('Notification', notificationSchema);

export default Notification;
