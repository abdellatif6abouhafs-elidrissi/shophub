import mongoose, { Document, Model, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IGiftCardDocument extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  purchasedBy?: mongoose.Types.ObjectId;
  recipientEmail?: string;
  recipientName?: string;
  senderName?: string;
  personalMessage?: string;
  isActive: boolean;
  expiresAt?: Date;
  redeemedBy?: mongoose.Types.ObjectId;
  transactions: {
    type: 'purchase' | 'redemption' | 'refund';
    amount: number;
    orderId?: mongoose.Types.ObjectId;
    date: Date;
    note?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const giftCardSchema = new Schema<IGiftCardDocument>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    initialBalance: {
      type: Number,
      required: true,
      min: [5, 'Minimum gift card value is $5'],
      max: [500, 'Maximum gift card value is $500'],
    },
    currentBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    purchasedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    recipientEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    recipientName: {
      type: String,
      trim: true,
    },
    senderName: {
      type: String,
      trim: true,
    },
    personalMessage: {
      type: String,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
    },
    redeemedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    transactions: [
      {
        type: {
          type: String,
          enum: ['purchase', 'redemption', 'refund'],
          required: true,
        },
        amount: { type: Number, required: true },
        orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
        date: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Generate unique gift card code
giftCardSchema.statics.generateCode = function (): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += characters.charAt(crypto.randomInt(0, characters.length));
  }
  return code;
};

// Check if gift card is valid
giftCardSchema.methods.isValid = function (): boolean {
  if (!this.isActive) return false;
  if (this.currentBalance <= 0) return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
};

// Use gift card balance
giftCardSchema.methods.useBalance = async function (
  amount: number,
  orderId?: mongoose.Types.ObjectId
): Promise<number> {
  if (!this.isValid()) {
    throw new Error('Gift card is not valid');
  }

  const amountToUse = Math.min(amount, this.currentBalance);
  this.currentBalance -= amountToUse;

  this.transactions.push({
    type: 'redemption',
    amount: -amountToUse,
    orderId,
    date: new Date(),
  });

  await this.save();
  return amountToUse;
};

// Refund to gift card
giftCardSchema.methods.refund = async function (
  amount: number,
  orderId?: mongoose.Types.ObjectId,
  note?: string
): Promise<void> {
  this.currentBalance += amount;

  this.transactions.push({
    type: 'refund',
    amount,
    orderId,
    date: new Date(),
    note,
  });

  await this.save();
};

// Indexes
giftCardSchema.index({ code: 1 });
giftCardSchema.index({ purchasedBy: 1 });
giftCardSchema.index({ recipientEmail: 1 });
giftCardSchema.index({ isActive: 1, expiresAt: 1 });

interface IGiftCardModel extends Model<IGiftCardDocument> {
  generateCode(): string;
}

const GiftCard: IGiftCardModel =
  (mongoose.models.GiftCard as IGiftCardModel) ||
  mongoose.model<IGiftCardDocument, IGiftCardModel>('GiftCard', giftCardSchema);

export default GiftCard;
