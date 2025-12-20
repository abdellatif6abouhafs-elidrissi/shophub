import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { z } from 'zod';

// GET - Fetch all categories (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const includeAll = searchParams.get('includeAll') === 'true';

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    // If includeAll, return all categories without pagination (for dropdowns)
    if (includeAll) {
      const categories = await Category.find(query)
        .populate('parent', 'name slug')
        .sort({ name: 1 })
        .lean();

      return NextResponse.json({
        success: true,
        data: categories,
      });
    }

    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      Category.find(query)
        .populate('parent', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Category.countDocuments(query),
    ]);

    // Get product counts for each category
    const categoryIds = categories.map((c) => c._id);
    const productCounts = await Product.aggregate([
      { $match: { category: { $in: categoryIds } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const productCountMap: Record<string, number> = {};
    productCounts.forEach((p) => {
      productCountMap[p._id.toString()] = p.count;
    });

    const categoriesWithStats = categories.map((category) => ({
      ...category,
      productCount: productCountMap[category._id.toString()] || 0,
    }));

    return NextResponse.json({
      success: true,
      data: categoriesWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create new category (admin only)
const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  image: z.string().url().optional().or(z.literal('')),
  parent: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const validation = createCategorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${validation.data.name}$`, 'i') },
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const categoryData: Record<string, unknown> = {
      name: validation.data.name,
      description: validation.data.description,
      image: validation.data.image,
      isActive: validation.data.isActive ?? true,
    };

    if (validation.data.parent) {
      categoryData.parent = validation.data.parent;
    }

    const category = await Category.create(categoryData);

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
