import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { notifyOrderPlaced, notifyLowStock } from '@/lib/notifications';

// GET - Fetch user's orders or all orders (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    // Build query based on role
    const query: Record<string, unknown> =
      session.user.role === 'admin' ? {} : { user: session.user.id };

    if (status) {
      query.orderStatus = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST - Create new order
const addressSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
});

const cartItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  image: z.string().optional(),
  quantity: z.number().min(1),
  variant: z.object({
    name: z.string(),
    value: z.string(),
  }).optional(),
});

const createOrderSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  paymentMethod: z.enum(['stripe', 'paypal', 'cod']),
  notes: z.string().optional(),
  items: z.array(cartItemSchema).optional(), // Accept items from client
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const validation = createOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    // Use items from request body (client cart) if provided
    let orderItems = [];

    if (validation.data.items && validation.data.items.length > 0) {
      // Use client-side cart items
      for (const item of validation.data.items) {
        // Verify product exists and has stock
        const product = await Product.findById(item.productId);
        if (!product) {
          return NextResponse.json(
            { success: false, error: `Product not found: ${item.name}` },
            { status: 400 }
          );
        }
        if (product.stock < item.quantity) {
          return NextResponse.json(
            { success: false, error: `Not enough stock for ${item.name}` },
            { status: 400 }
          );
        }
        orderItems.push({
          product: item.productId,
          name: item.name,
          image: item.image || product.images?.[0] || '',
          price: item.price,
          quantity: item.quantity,
          variant: item.variant,
        });
      }
    } else {
      // Fallback to server-side cart (MongoDB)
      const cart = await Cart.findOne({ user: session.user.id }).populate({
        path: 'items.product',
        select: 'name price images stock',
      });

      if (!cart || cart.items.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Cart is empty' },
          { status: 400 }
        );
      }

      for (const item of cart.items) {
        const product = item.product as unknown as {
          _id: string;
          name: string;
          price: number;
          images: string[];
          stock: number;
        };

        if (product.stock < item.quantity) {
          return NextResponse.json(
            { success: false, error: `Not enough stock for ${product.name}` },
            { status: 400 }
          );
        }

        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images[0] || '',
          price: product.price,
          quantity: item.quantity,
          variant: item.variant,
        });
      }

      // Clear server-side cart after order
      await Cart.findOneAndDelete({ user: session.user.id });
    }

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shippingCost + tax;

    // Create order
    const order = await Order.create({
      user: session.user.id,
      items: orderItems,
      shippingAddress: validation.data.shippingAddress,
      billingAddress: validation.data.billingAddress || validation.data.shippingAddress,
      paymentMethod: validation.data.paymentMethod,
      paymentStatus: validation.data.paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: 'pending',
      subtotal,
      shippingCost,
      tax,
      discount: 0,
      total,
      notes: validation.data.notes,
    });

    // Update product stock and check for low stock
    const LOW_STOCK_THRESHOLD = 10;
    for (const item of orderItems) {
      const updatedProduct = await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      // Notify admin if stock is low
      if (updatedProduct && updatedProduct.stock <= LOW_STOCK_THRESHOLD && updatedProduct.stock > 0) {
        try {
          await notifyLowStock(
            updatedProduct._id.toString(),
            updatedProduct.name,
            updatedProduct.stock
          );
        } catch (notifyError) {
          console.error('Failed to send low stock notification:', notifyError);
        }
      }
    }

    // Send order confirmation email
    try {
      const user = await User.findById(session.user.id);
      if (user?.email) {
        await sendOrderConfirmationEmail(
          user.email,
          user.name || validation.data.shippingAddress.fullName,
          order.orderNumber,
          {
            items: orderItems.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              image: item.image,
            })),
            subtotal,
            shippingCost,
            tax,
            discount: 0,
            total,
            shippingAddress: validation.data.shippingAddress,
            paymentMethod: validation.data.paymentMethod,
          }
        );
      }
    } catch (emailError) {
      // Log email error but don't fail the order
      console.error('Failed to send order confirmation email:', emailError);
    }

    // Send notification to admin about new order
    try {
      await notifyOrderPlaced(order._id.toString(), order.orderNumber, session.user.id, total);
    } catch (notifyError) {
      console.error('Failed to send order notification:', notifyError);
    }

    return NextResponse.json(
      { success: true, data: order },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
