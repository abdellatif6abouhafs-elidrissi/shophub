import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ILoyaltyTransaction {
  type: 'earned' | 'redeemed' | 'expired' | 'bonus' | 'refund';
  points: number;
  description: string;
  orderId?: mongoose.Types.ObjectId;
  expiresAt?: Date;
  createdAt: Date;
}

export interface ILoyaltyPointsDocument extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  totalPoints: number;
  availablePoints: number;
  lifetimePoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  transactions: ILoyaltyTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

// Points earning rules
export const LOYALTY_RULES = {
  // Points per dollar spent
  pointsPerDollar: 10,

  // Tier thresholds (lifetime points)
  tiers: {
    bronze: { minPoints: 0, multiplier: 1, benefits: ['10 pts/$1', 'Birthday bonus'] },
    silver: { minPoints: 5000, multiplier: 1.25, benefits: ['12.5 pts/$1', 'Birthday bonus', 'Early access'] },
    gold: { minPoints: 15000, multiplier: 1.5, benefits: ['15 pts/$1', 'Birthday bonus', 'Early access', 'Free shipping'] },
    platinum: { minPoints: 30000, multiplier: 2, benefits: ['20 pts/$1', 'Birthday bonus', 'Early access', 'Free shipping', 'Exclusive offers'] },
  },

  // Points to dollar conversion (for redemption)
  pointsPerDollarRedemption: 100, // 100 points = $1

  // Minimum points to redeem
  minRedemption: 500, // Minimum 500 points ($5)

  // Points expiration (in days)
  expirationDays: 365,

  // Bonus points
  bonuses: {
    signup: 500, // Points for new account
    review: 50, // Points per review
    referral: 1000, // Points for referring a friend
    birthday: 500, // Birthday bonus
  },
};

const loyaltyPointsSchema = new Schema<ILoyaltyPointsDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    availablePoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    lifetimePoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },
    transactions: [
      {
        type: {
          type: String,
          enum: ['earned', 'redeemed', 'expired', 'bonus', 'refund'],
          required: true,
        },
        points: { type: Number, required: true },
        description: { type: String, required: true },
        orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
        expiresAt: { type: Date },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Calculate tier based on lifetime points
loyaltyPointsSchema.methods.updateTier = function (): void {
  const { tiers } = LOYALTY_RULES;

  if (this.lifetimePoints >= tiers.platinum.minPoints) {
    this.tier = 'platinum';
  } else if (this.lifetimePoints >= tiers.gold.minPoints) {
    this.tier = 'gold';
  } else if (this.lifetimePoints >= tiers.silver.minPoints) {
    this.tier = 'silver';
  } else {
    this.tier = 'bronze';
  }
};

// Add points
loyaltyPointsSchema.methods.addPoints = async function (
  points: number,
  description: string,
  type: 'earned' | 'bonus' | 'refund' = 'earned',
  orderId?: mongoose.Types.ObjectId
): Promise<void> {
  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + LOYALTY_RULES.expirationDays);

  // Add transaction
  this.transactions.push({
    type,
    points,
    description,
    orderId,
    expiresAt,
    createdAt: new Date(),
  });

  // Update totals
  this.totalPoints += points;
  this.availablePoints += points;

  if (type === 'earned' || type === 'bonus') {
    this.lifetimePoints += points;
    this.updateTier();
  }

  await this.save();
};

// Redeem points
loyaltyPointsSchema.methods.redeemPoints = async function (
  points: number,
  description: string,
  orderId?: mongoose.Types.ObjectId
): Promise<number> {
  if (points < LOYALTY_RULES.minRedemption) {
    throw new Error(`Minimum redemption is ${LOYALTY_RULES.minRedemption} points`);
  }

  if (points > this.availablePoints) {
    throw new Error('Insufficient points');
  }

  // Add transaction
  this.transactions.push({
    type: 'redeemed',
    points: -points,
    description,
    orderId,
    createdAt: new Date(),
  });

  // Update totals
  this.availablePoints -= points;

  await this.save();

  // Return dollar value
  return points / LOYALTY_RULES.pointsPerDollarRedemption;
};

// Get points multiplier based on tier
loyaltyPointsSchema.methods.getMultiplier = function (): number {
  return LOYALTY_RULES.tiers[this.tier as keyof typeof LOYALTY_RULES.tiers].multiplier;
};

// Calculate points for an order
loyaltyPointsSchema.statics.calculateOrderPoints = function (
  orderTotal: number,
  tier: string = 'bronze'
): number {
  const multiplier = LOYALTY_RULES.tiers[tier as keyof typeof LOYALTY_RULES.tiers]?.multiplier || 1;
  return Math.floor(orderTotal * LOYALTY_RULES.pointsPerDollar * multiplier);
};

// Indexes
loyaltyPointsSchema.index({ user: 1 });
loyaltyPointsSchema.index({ tier: 1 });
loyaltyPointsSchema.index({ 'transactions.expiresAt': 1 });

interface ILoyaltyPointsModel extends Model<ILoyaltyPointsDocument> {
  calculateOrderPoints(orderTotal: number, tier?: string): number;
}

const LoyaltyPoints: ILoyaltyPointsModel =
  (mongoose.models.LoyaltyPoints as ILoyaltyPointsModel) ||
  mongoose.model<ILoyaltyPointsDocument, ILoyaltyPointsModel>('LoyaltyPoints', loyaltyPointsSchema);

export default LoyaltyPoints;
