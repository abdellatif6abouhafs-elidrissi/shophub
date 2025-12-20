import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import StockAlert from '@/models/StockAlert';
import Product from '@/models/Product';

// POST - Subscribe to stock alert
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, productId } = await request.json();

    if (!email || !productId) {
      return NextResponse.json(
        { success: false, error: 'Email and product ID are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product is already in stock
    if (product.stock > 0) {
      return NextResponse.json(
        { success: false, error: 'Product is already in stock' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existingAlert = await StockAlert.findOne({
      email: email.toLowerCase(),
      product: productId,
      isNotified: false,
    });

    if (existingAlert) {
      return NextResponse.json(
        { success: false, error: 'You are already subscribed to this alert' },
        { status: 400 }
      );
    }

    // Create stock alert
    const stockAlert = await StockAlert.create({
      email: email.toLowerCase(),
      product: productId,
      productName: product.name,
    });

    return NextResponse.json({
      success: true,
      message: 'You will be notified when this product is back in stock',
      data: stockAlert,
    });
  } catch (error: any) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'You are already subscribed to this alert' },
        { status: 400 }
      );
    }

    console.error('Stock alert error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create stock alert' },
      { status: 500 }
    );
  }
}

// GET - Check if user is subscribed to a product alert
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const productId = searchParams.get('productId');

    if (!email || !productId) {
      return NextResponse.json(
        { success: false, error: 'Email and product ID are required' },
        { status: 400 }
      );
    }

    const alert = await StockAlert.findOne({
      email: email.toLowerCase(),
      product: productId,
      isNotified: false,
    });

    return NextResponse.json({
      success: true,
      isSubscribed: !!alert,
    });
  } catch (error) {
    console.error('Check alert error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check alert status' },
      { status: 500 }
    );
  }
}

// DELETE - Unsubscribe from stock alert
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const productId = searchParams.get('productId');

    if (!email || !productId) {
      return NextResponse.json(
        { success: false, error: 'Email and product ID are required' },
        { status: 400 }
      );
    }

    await StockAlert.findOneAndDelete({
      email: email.toLowerCase(),
      product: productId,
    });

    return NextResponse.json({
      success: true,
      message: 'Unsubscribed from stock alert',
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
