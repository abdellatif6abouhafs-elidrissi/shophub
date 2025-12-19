import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'ShopHub <onboarding@resend.dev>';
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'ShopHub';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Email sending error:', error);
      return false;
    }

    console.log('Email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .wrapper { background-color: #f5f5f5; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 40px 30px; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>${APP_NAME}</h1>
            </div>
            <div class="content">
              <h2 style="margin-top: 0;">Password Reset Request</h2>
              <p>Hi ${name},</p>
              <p>You requested to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
              <p style="color: #666; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html,
  });
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderDetails {
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount?: number;
  total: number;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
}

export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderNumber: string,
  orderDetails: OrderDetails
) {
  const itemsHtml = orderDetails.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
            <div style="display: flex; align-items: center;">
              ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;">` : ''}
              <div>
                <p style="margin: 0; font-weight: 500;">${item.name}</p>
                <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Qty: ${item.quantity}</p>
              </div>
            </div>
          </td>
          <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
    )
    .join('');

  const paymentMethodLabel = {
    stripe: 'Credit Card',
    paypal: 'PayPal',
    cod: 'Cash on Delivery',
  }[orderDetails.paymentMethod] || orderDetails.paymentMethod;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .wrapper { background-color: #f5f5f5; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .success-icon { width: 60px; height: 60px; background: white; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; }
          .content { padding: 30px; }
          .order-number { background: #f0fdf4; border: 2px dashed #10b981; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0; }
          .order-number span { font-size: 24px; font-weight: bold; color: #059669; letter-spacing: 2px; }
          table { width: 100%; border-collapse: collapse; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .summary-row.total { border-top: 2px solid #333; margin-top: 10px; padding-top: 15px; font-size: 18px; font-weight: bold; }
          .address-box { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="success-icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h1>Order Confirmed!</h1>
            </div>

            <div class="content">
              <p>Hi ${name},</p>
              <p>Thank you for your order! We've received your order and it's being processed.</p>

              <div class="order-number">
                <p style="margin: 0 0 5px; color: #666; font-size: 14px;">Order Number</p>
                <span>${orderNumber}</span>
              </div>

              <h3 style="margin-bottom: 15px; color: #333;">Order Summary</h3>
              <table>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <div class="summary-row">
                  <span style="color: #666;">Subtotal</span>
                  <span>$${orderDetails.subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                  <span style="color: #666;">Shipping</span>
                  <span>${orderDetails.shippingCost === 0 ? '<span style="color: #10b981;">FREE</span>' : '$' + orderDetails.shippingCost.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                  <span style="color: #666;">Tax</span>
                  <span>$${orderDetails.tax.toFixed(2)}</span>
                </div>
                ${orderDetails.discount && orderDetails.discount > 0 ? `
                <div class="summary-row">
                  <span style="color: #10b981;">Discount</span>
                  <span style="color: #10b981;">-$${orderDetails.discount.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="summary-row total">
                  <span>Total</span>
                  <span>$${orderDetails.total.toFixed(2)}</span>
                </div>
              </div>

              <div class="address-box">
                <h4 style="margin: 0 0 10px; color: #333;">Shipping Address</h4>
                <p style="margin: 0; color: #666;">
                  ${orderDetails.shippingAddress.fullName}<br>
                  ${orderDetails.shippingAddress.street}<br>
                  ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.zipCode}<br>
                  ${orderDetails.shippingAddress.country}
                </p>
              </div>

              <div class="address-box" style="background: #eff6ff;">
                <h4 style="margin: 0 0 10px; color: #333;">Payment Method</h4>
                <p style="margin: 0; color: #666;">${paymentMethodLabel}</p>
              </div>

              <p style="color: #666;">We'll send you another email with tracking information once your order ships.</p>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile/orders" class="button">View Order</a>
              </div>
            </div>

            <div class="footer">
              <p>If you have any questions, please contact our support team.</p>
              <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Order Confirmed! #${orderNumber}`,
    html,
  });
}

export async function sendOrderStatusEmail(
  email: string,
  name: string,
  orderNumber: string,
  status: string,
  trackingNumber?: string
) {
  const statusConfig: Record<string, { color: string; icon: string; message: string }> = {
    confirmed: {
      color: '#10b981',
      icon: '<polyline points="20 6 9 17 4 12"></polyline>',
      message: 'Your order has been confirmed and is being prepared for shipment.',
    },
    processing: {
      color: '#f59e0b',
      icon: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
      message: 'Your order is now being processed and will be shipped soon.',
    },
    shipped: {
      color: '#3b82f6',
      icon: '<rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>',
      message: `Your order has been shipped and is on its way!${trackingNumber ? ` Your tracking number is: <strong>${trackingNumber}</strong>` : ''}`,
    },
    delivered: {
      color: '#10b981',
      icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
      message: 'Your order has been delivered. We hope you enjoy your purchase!',
    },
    cancelled: {
      color: '#ef4444',
      icon: '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>',
      message: 'Your order has been cancelled. If you have any questions, please contact our support team.',
    },
  };

  const config = statusConfig[status] || {
    color: '#6b7280',
    icon: '<circle cx="12" cy="12" r="10"></circle>',
    message: 'Your order status has been updated.',
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .wrapper { background-color: #f5f5f5; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .status-icon { width: 60px; height: 60px; background: white; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; }
          .content { padding: 30px; }
          .status-badge { display: inline-block; padding: 8px 20px; background: ${config.color}15; color: ${config.color}; border-radius: 20px; font-weight: 600; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; }
          .order-number { color: #666; font-size: 14px; margin: 15px 0; }
          .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="status-icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${config.color}" stroke-width="2">
                  ${config.icon}
                </svg>
              </div>
              <h1>Order ${status.charAt(0).toUpperCase() + status.slice(1)}</h1>
            </div>

            <div class="content">
              <p>Hi ${name},</p>

              <div style="text-align: center; margin: 30px 0;">
                <span class="status-badge">${status}</span>
                <p class="order-number">Order #${orderNumber}</p>
              </div>

              <p>${config.message}</p>

              ${trackingNumber ? `
              <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 5px; color: #666; font-size: 14px;">Tracking Number</p>
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #3b82f6; letter-spacing: 2px;">${trackingNumber}</p>
              </div>
              ` : ''}

              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile/orders" class="button">View Order Details</a>
              </div>
            </div>

            <div class="footer">
              <p>If you have any questions, please contact our support team.</p>
              <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Order #${orderNumber} - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    html,
  });
}

// New: Order Shipped Email with Tracking
export async function sendOrderShippedEmail(
  email: string,
  name: string,
  orderNumber: string,
  trackingNumber: string,
  carrier?: string
) {
  return sendOrderStatusEmail(email, name, orderNumber, 'shipped', trackingNumber);
}
