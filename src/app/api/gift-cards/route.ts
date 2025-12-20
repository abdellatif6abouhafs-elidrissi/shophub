import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import GiftCard from '@/models/GiftCard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendGiftCardEmail } from '@/lib/email';

// GET - Get user's gift cards or check balance
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    // Check specific gift card balance
    if (code) {
      const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });

      if (!giftCard) {
        return NextResponse.json(
          { success: false, error: 'Gift card not found' },
          { status: 404 }
        );
      }

      const isValid = giftCard.isActive &&
        giftCard.currentBalance > 0 &&
        (!giftCard.expiresAt || new Date() < giftCard.expiresAt);

      return NextResponse.json({
        success: true,
        data: {
          code: giftCard.code,
          balance: giftCard.currentBalance,
          currency: giftCard.currency,
          isValid,
          expiresAt: giftCard.expiresAt,
        },
      });
    }

    // Get user's gift cards
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const giftCards = await GiftCard.find({
      $or: [
        { purchasedBy: session.user.id },
        { redeemedBy: session.user.id },
      ],
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: giftCards,
    });
  } catch (error) {
    console.error('Gift card fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gift cards' },
      { status: 500 }
    );
  }
}

// POST - Purchase a new gift card
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    const body = await request.json();

    const {
      amount,
      recipientEmail,
      recipientName,
      senderName,
      personalMessage,
      deliveryDate,
    } = body;

    // Validate amount
    if (!amount || amount < 5 || amount > 500) {
      return NextResponse.json(
        { success: false, error: 'Gift card amount must be between $5 and $500' },
        { status: 400 }
      );
    }

    // Generate unique code
    let code: string;
    let isUnique = false;
    while (!isUnique) {
      code = GiftCard.generateCode();
      const existing = await GiftCard.findOne({ code });
      if (!existing) isUnique = true;
    }

    // Set expiration (1 year from now)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Create gift card
    const giftCard = await GiftCard.create({
      code: code!,
      initialBalance: amount,
      currentBalance: amount,
      purchasedBy: session?.user?.id,
      recipientEmail,
      recipientName,
      senderName: senderName || session?.user?.name || 'Someone special',
      personalMessage,
      expiresAt,
      transactions: [
        {
          type: 'purchase',
          amount,
          date: new Date(),
          note: 'Initial purchase',
        },
      ],
    });

    // Send email to recipient if email provided
    if (recipientEmail) {
      const sendDate = deliveryDate ? new Date(deliveryDate) : new Date();

      // If delivery date is in the future, we'd queue this
      // For now, send immediately
      if (sendDate <= new Date()) {
        await sendGiftCardEmail({
          to: recipientEmail,
          recipientName: recipientName || 'Friend',
          senderName: giftCard.senderName!,
          amount,
          code: giftCard.code,
          message: personalMessage,
          expiresAt,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: giftCard._id,
        code: giftCard.code,
        amount: giftCard.initialBalance,
        expiresAt: giftCard.expiresAt,
      },
    });
  } catch (error) {
    console.error('Gift card creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create gift card' },
      { status: 500 }
    );
  }
}
