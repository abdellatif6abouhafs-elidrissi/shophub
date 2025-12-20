import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AbandonedCart from '@/models/AbandonedCart';
import { sendAbandonedCartEmail } from '@/lib/email';

// Timing for reminders (in hours)
const REMINDER_SCHEDULE = [
  1,   // First reminder: 1 hour after abandonment
  24,  // Second reminder: 24 hours after abandonment
  72,  // Third reminder: 72 hours (3 days) after abandonment
];

// POST - Send abandoned cart reminder emails (called by cron job)
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (for security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const now = new Date();
    let emailsSent = 0;
    const errors: string[] = [];

    // Find abandoned carts that need reminders
    for (let i = 0; i < REMINDER_SCHEDULE.length; i++) {
      const hoursAgo = REMINDER_SCHEDULE[i];
      const reminderNumber = i + 1;

      // Calculate the time window for this reminder
      const targetTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
      const windowStart = new Date(targetTime.getTime() - 30 * 60 * 1000); // 30 min buffer before
      const windowEnd = new Date(targetTime.getTime() + 30 * 60 * 1000); // 30 min buffer after

      // Find carts that:
      // 1. Were created in the time window
      // 2. Haven't been recovered
      // 3. Haven't received this reminder yet
      const cartsToRemind = await AbandonedCart.find({
        createdAt: { $gte: windowStart, $lte: windowEnd },
        isRecovered: false,
        remindersSent: reminderNumber - 1,
      }).limit(50); // Limit to avoid timeout

      for (const cart of cartsToRemind) {
        try {
          // Determine discount based on reminder number
          let discountCode = '';
          let discountPercent = 0;

          if (reminderNumber === 2) {
            discountCode = 'COMEBACK10';
            discountPercent = 10;
          } else if (reminderNumber === 3) {
            discountCode = 'LASTCHANCE15';
            discountPercent = 15;
          }

          // Send email
          await sendAbandonedCartEmail({
            to: cart.email,
            items: cart.items,
            totalAmount: cart.totalAmount,
            reminderNumber,
            discountCode,
            discountPercent,
          });

          // Update cart
          cart.remindersSent = reminderNumber;
          cart.lastReminderAt = now;
          await cart.save();

          emailsSent++;
        } catch (error) {
          console.error(`Failed to send reminder to ${cart.email}:`, error);
          errors.push(cart.email);
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Send reminders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send reminders' },
      { status: 500 }
    );
  }
}

// GET - Get abandoned cart statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const stats = await AbandonedCart.aggregate([
      {
        $group: {
          _id: null,
          totalCarts: { $sum: 1 },
          recoveredCarts: {
            $sum: { $cond: ['$isRecovered', 1, 0] },
          },
          totalValue: { $sum: '$totalAmount' },
          recoveredValue: {
            $sum: { $cond: ['$isRecovered', '$totalAmount', 0] },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalCarts: 0,
      recoveredCarts: 0,
      totalValue: 0,
      recoveredValue: 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        recoveryRate: result.totalCarts > 0
          ? ((result.recoveredCarts / result.totalCarts) * 100).toFixed(1)
          : 0,
      },
    });
  } catch (error) {
    console.error('Abandoned cart stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}
