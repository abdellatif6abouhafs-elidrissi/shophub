import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import RefundRequest from '@/models/RefundRequest';
import Order from '@/models/Order';
import User from '@/models/User';
import { sendRefundStatusEmail } from '@/lib/email';

// Get a specific refund request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const guestEmail = searchParams.get('guestEmail');

    await connectDB();

    const refundRequest = await RefundRequest.findById(id)
      .populate('order')
      .populate('processedBy', 'name email')
      .lean();

    if (!refundRequest) {
      return NextResponse.json(
        { error: 'Refund request not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (session?.user?.role === 'admin') {
      // Admin can view any request
    } else if (session) {
      if (refundRequest.user?.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    } else if (guestEmail) {
      if (refundRequest.guestEmail !== guestEmail) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Please login or provide guest email' },
        { status: 401 }
      );
    }

    return NextResponse.json({ refundRequest });
  } catch (error) {
    console.error('Error fetching refund request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch refund request' },
      { status: 500 }
    );
  }
}

// Update refund request (Admin only - approve/reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, adminNotes, rejectionReason } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const refundRequest = await RefundRequest.findById(id);

    if (!refundRequest) {
      return NextResponse.json(
        { error: 'Refund request not found' },
        { status: 404 }
      );
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      pending: ['approved', 'rejected'],
      approved: ['processing', 'completed'],
      processing: ['completed'],
      rejected: [],
      completed: [],
    };

    if (!validTransitions[refundRequest.status].includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${refundRequest.status} to ${status}` },
        { status: 400 }
      );
    }

    // Require rejection reason
    if (status === 'rejected' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // Update refund request
    refundRequest.status = status;
    refundRequest.processedBy = session.user.id;

    if (adminNotes) {
      refundRequest.adminNotes = adminNotes;
    }

    if (status === 'rejected') {
      refundRequest.rejectionReason = rejectionReason;
      refundRequest.processedAt = new Date();
    }

    if (status === 'approved' || status === 'processing') {
      refundRequest.processedAt = new Date();
    }

    if (status === 'completed') {
      refundRequest.completedAt = new Date();

      // Update order payment status to refunded
      await Order.findByIdAndUpdate(refundRequest.order, {
        paymentStatus: 'refunded',
      });
    }

    await refundRequest.save();

    // Send status update email
    try {
      let customerEmail = refundRequest.guestEmail || '';
      let customerName = 'Customer';

      if (refundRequest.user) {
        const user = await User.findById(refundRequest.user);
        if (user) {
          customerEmail = user.email;
          customerName = user.name;
        }
      }

      if (customerEmail && ['approved', 'rejected', 'completed'].includes(status)) {
        await sendRefundStatusEmail(
          customerEmail,
          customerName,
          refundRequest.requestNumber,
          status as 'approved' | 'rejected' | 'completed',
          refundRequest.refundAmount,
          rejectionReason
        );
      }
    } catch (emailError) {
      console.error('Failed to send refund status email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: `Refund request ${status}`,
      refundRequest: {
        id: refundRequest._id,
        requestNumber: refundRequest.requestNumber,
        status: refundRequest.status,
      },
    });
  } catch (error) {
    console.error('Error updating refund request:', error);
    return NextResponse.json(
      { error: 'Failed to update refund request' },
      { status: 500 }
    );
  }
}

// Cancel refund request (Customer)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const guestEmail = searchParams.get('guestEmail');

    await connectDB();

    const refundRequest = await RefundRequest.findById(id);

    if (!refundRequest) {
      return NextResponse.json(
        { error: 'Refund request not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (session) {
      if (refundRequest.user?.toString() !== session.user.id && session.user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    } else if (guestEmail) {
      if (refundRequest.guestEmail !== guestEmail) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Please login or provide guest email' },
        { status: 401 }
      );
    }

    // Can only cancel pending requests
    if (refundRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only cancel pending refund requests' },
        { status: 400 }
      );
    }

    await RefundRequest.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Refund request cancelled',
    });
  } catch (error) {
    console.error('Error cancelling refund request:', error);
    return NextResponse.json(
      { error: 'Failed to cancel refund request' },
      { status: 500 }
    );
  }
}
