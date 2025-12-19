import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// GET - Fetch user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    let cart = await Cart.findOne({ user: session.user.id })
      .populate({
        path: 'items.product',
        select: 'name slug price images stock',
      })
      .lean();

    if (!cart) {
      cart = {
        _id: null,
        user: session.user.id,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      } as never;
    }

    return NextResponse.json({ success: true, data: cart });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1).default(1),
  variant: z
    .object({
      name: z.string(),
      value: z.string(),
    })
    .optional(),
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

    const validation = addToCartSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { productId, quantity, variant } = validation.data;

    await connectDB();

    // Check if product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { success: false, error: 'Not enough stock available' },
        { status: 400 }
      );
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      cart = new Cart({
        user: session.user.id,
        items: [],
      });
    }

    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        JSON.stringify(item.variant) === JSON.stringify(variant)
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { success: false, error: 'Not enough stock available' },
          { status: 400 }
        );
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        variant,
      });
    }

    await cart.save();

    // Populate and return
    await cart.populate({
      path: 'items.product',
      select: 'name slug price images stock',
    });

    return NextResponse.json({ success: true, data: cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

// PUT - Update cart item quantity
const updateCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(0),
  variant: z
    .object({
      name: z.string(),
      value: z.string(),
    })
    .optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const validation = updateCartSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { productId, quantity, variant } = validation.data;

    await connectDB();

    const cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        JSON.stringify(item.variant) === JSON.stringify(variant)
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    if (quantity === 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Check stock
      const product = await Product.findById(productId);
      if (product && quantity > product.stock) {
        return NextResponse.json(
          { success: false, error: 'Not enough stock available' },
          { status: 400 }
        );
      }
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name slug price images stock',
    });

    return NextResponse.json({ success: true, data: cart });
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// DELETE - Clear cart
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    await Cart.findOneAndDelete({ user: session.user.id });

    return NextResponse.json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
