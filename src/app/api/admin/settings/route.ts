import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Settings, { defaultSettings } from '@/models/Settings';
import { z } from 'zod';

// GET - Fetch all settings (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if settings exist, if not create defaults
    const existingSettings = await Settings.find();

    if (existingSettings.length === 0) {
      await Settings.insertMany(defaultSettings);
    }

    const settings = await Settings.find().sort({ category: 1, key: 1 }).lean();

    // Group by category
    const groupedSettings: Record<string, Array<{
      key: string;
      value: unknown;
      type: string;
      description?: string;
    }>> = {};

    settings.forEach((setting) => {
      if (!groupedSettings[setting.category]) {
        groupedSettings[setting.category] = [];
      }
      groupedSettings[setting.category].push({
        key: setting.key,
        value: setting.value,
        type: setting.type,
        description: setting.description,
      });
    });

    return NextResponse.json({
      success: true,
      data: groupedSettings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update settings (admin only)
const updateSettingsSchema = z.record(z.string(), z.unknown());

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const validation = updateSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid settings data' },
        { status: 400 }
      );
    }

    await connectDB();

    // Update each setting
    const updates = Object.entries(validation.data).map(async ([key, value]) => {
      await Settings.findOneAndUpdate(
        { key },
        { $set: { value } },
        { upsert: true }
      );
    });

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// POST - Reset settings to defaults (admin only)
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Delete all settings and recreate defaults
    await Settings.deleteMany({});
    await Settings.insertMany(defaultSettings);

    return NextResponse.json({
      success: true,
      message: 'Settings reset to defaults',
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset settings' },
      { status: 500 }
    );
  }
}
