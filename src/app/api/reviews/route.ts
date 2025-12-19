import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product';
import mongoose from 'mongoose';

// GET reviews for a product
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'newest';

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Sort options
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'highest') sortOption = { rating: -1, createdAt: -1 };
    if (sort === 'lowest') sortOption = { rating: 1, createdAt: -1 };

    const [reviews, total] = await Promise.all([
      Review.find({ product: productId })
        .populate('user', 'name image')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ product: productId }),
    ]);

    // Get rating distribution
    const ratingStats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    ratingStats.forEach((stat) => {
      ratingDistribution[stat._id as keyof typeof ratingDistribution] = stat.count;
    });

    return NextResponse.json({
      success: true,
      data: reviews,
      ratingDistribution,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in to leave a review' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { productId, rating, title, comment } = body;

    // Validate input
    if (!productId || !rating || !title || !comment) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
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

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: session.user.id,
      product: productId,
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Create review
    const review = await Review.create({
      user: session.user.id,
      product: productId,
      rating,
      title,
      comment,
      isVerified: false, // Could be set to true if user purchased the product
    });

    // Populate user data
    await review.populate('user', 'name image');

    return NextResponse.json(
      { success: true, data: review },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating review:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
