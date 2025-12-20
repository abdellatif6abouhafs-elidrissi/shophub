import dbConnect from '@/lib/db';
import Notification, { NotificationType } from '@/models/Notification';

interface CreateNotificationParams {
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isAdmin?: boolean;
  metadata?: Record<string, unknown>;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    await dbConnect();

    const notification = await Notification.create({
      user: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      isAdmin: params.isAdmin || false,
      metadata: params.metadata,
    });

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
}

// Helper functions for common notifications

export async function notifyOrderPlaced(orderId: string, orderNumber: string, userId: string, total: number) {
  // Notify user
  await createNotification({
    userId,
    type: 'order_placed',
    title: 'Order Placed Successfully',
    message: `Your order #${orderNumber} has been placed. Total: $${total.toFixed(2)}`,
    link: `/profile/orders/${orderId}`,
  });

  // Notify admin
  await createNotification({
    type: 'order_placed',
    title: 'New Order Received',
    message: `New order #${orderNumber} received. Total: $${total.toFixed(2)}`,
    link: `/admin/orders/${orderId}`,
    isAdmin: true,
    metadata: { orderId, orderNumber, total },
  });
}

export async function notifyOrderStatusChange(
  orderId: string,
  orderNumber: string,
  userId: string,
  status: string
) {
  const statusMessages: Record<string, { title: string; message: string; type: NotificationType }> = {
    confirmed: {
      title: 'Order Confirmed',
      message: `Your order #${orderNumber} has been confirmed and is being prepared.`,
      type: 'order_confirmed',
    },
    processing: {
      title: 'Order Processing',
      message: `Your order #${orderNumber} is now being processed.`,
      type: 'order_confirmed',
    },
    shipped: {
      title: 'Order Shipped',
      message: `Your order #${orderNumber} has been shipped and is on its way!`,
      type: 'order_shipped',
    },
    delivered: {
      title: 'Order Delivered',
      message: `Your order #${orderNumber} has been delivered. Enjoy!`,
      type: 'order_delivered',
    },
    cancelled: {
      title: 'Order Cancelled',
      message: `Your order #${orderNumber} has been cancelled.`,
      type: 'order_cancelled',
    },
  };

  const statusInfo = statusMessages[status];
  if (statusInfo) {
    await createNotification({
      userId,
      type: statusInfo.type,
      title: statusInfo.title,
      message: statusInfo.message,
      link: `/profile/orders/${orderId}`,
    });
  }
}

export async function notifyPaymentReceived(orderId: string, orderNumber: string, userId: string, amount: number) {
  await createNotification({
    userId,
    type: 'payment_received',
    title: 'Payment Received',
    message: `Payment of $${amount.toFixed(2)} received for order #${orderNumber}.`,
    link: `/profile/orders/${orderId}`,
  });

  await createNotification({
    type: 'payment_received',
    title: 'Payment Received',
    message: `Payment of $${amount.toFixed(2)} received for order #${orderNumber}.`,
    link: `/admin/orders/${orderId}`,
    isAdmin: true,
  });
}

export async function notifyLowStock(productId: string, productName: string, stock: number) {
  await createNotification({
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: `"${productName}" is running low on stock. Only ${stock} items left.`,
    link: `/admin/products/${productId}/edit`,
    isAdmin: true,
    metadata: { productId, productName, stock },
  });
}

export async function notifyNewUser(userId: string, userName: string, email: string) {
  await createNotification({
    type: 'new_user',
    title: 'New User Registration',
    message: `${userName} (${email}) has registered.`,
    link: `/admin/users`,
    isAdmin: true,
    metadata: { userId, userName, email },
  });
}

export async function notifyNewReview(
  productId: string,
  productName: string,
  userId: string,
  userName: string,
  rating: number
) {
  await createNotification({
    type: 'new_review',
    title: 'New Product Review',
    message: `${userName} left a ${rating}-star review on "${productName}".`,
    link: `/admin/products/${productId}`,
    isAdmin: true,
    metadata: { productId, productName, userId, userName, rating },
  });
}

export async function sendPromoNotification(
  userIds: string[],
  title: string,
  message: string,
  link?: string
) {
  const notifications = userIds.map((userId) => ({
    user: userId,
    type: 'promo' as NotificationType,
    title,
    message,
    link,
    isAdmin: false,
  }));

  await dbConnect();
  await Notification.insertMany(notifications);
}
