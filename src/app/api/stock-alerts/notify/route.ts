import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import StockAlert from '@/models/StockAlert';
import Product from '@/models/Product';
import { sendBackInStockEmail } from '@/lib/email';

// POST - Notify subscribers when product is back in stock
// This is called when admin updates product stock
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can trigger notifications
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Only notify if product is now in stock
    if (product.stock <= 0) {
      return NextResponse.json(
        { success: false, error: 'Product is still out of stock' },
        { status: 400 }
      );
    }

    // Find all pending alerts for this product
    const pendingAlerts = await StockAlert.find({
      product: productId,
      isNotified: false,
    });

    if (pendingAlerts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending alerts for this product',
        notified: 0,
      });
    }

    // Send emails to all subscribers
    let notifiedCount = 0;
    const errors: string[] = [];

    for (const alert of pendingAlerts) {
      try {
        const emailSent = await sendBackInStockEmail(
          alert.email,
          product.name,
          product.slug,
          product.images[0]
        );

        if (emailSent) {
          // Mark alert as notified
          await StockAlert.findByIdAndUpdate(alert._id, {
            isNotified: true,
            notifiedAt: new Date(),
          });
          notifiedCount++;
        } else {
          errors.push(`Failed to send email to ${alert.email}`);
        }
      } catch (error: any) {
        errors.push(`Error sending to ${alert.email}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Notified ${notifiedCount} subscribers`,
      notified: notifiedCount,
      total: pendingAlerts.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Notify stock alert error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
