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

// Email Verification
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationUrl: string
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
          .icon { width: 60px; height: 60px; background: white; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; }
          .content { padding: 40px 30px; text-align: center; }
          .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 25px 0; }
          .button:hover { opacity: 0.9; }
          .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; }
          .link-text { word-break: break-all; font-size: 12px; color: #666; background: #f3f4f6; padding: 10px; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <h2 style="margin-top: 0; color: #333;">Welcome to ${APP_NAME}!</h2>
              <p style="color: #666;">Hi ${name},</p>
              <p style="color: #666;">Thank you for signing up! Please verify your email address by clicking the button below:</p>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              <p style="color: #888; font-size: 14px;">This link will expire in 24 hours.</p>
              <div class="link-text">
                <p style="margin: 0 0 5px; font-weight: 500;">Can't click the button? Copy this link:</p>
                ${verificationUrl}
              </div>
            </div>
            <div class="footer">
              <p>If you didn't create an account with ${APP_NAME}, you can safely ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Verify your email for ${APP_NAME}`,
    html,
  });
}

// Welcome Email (after verification)
export async function sendWelcomeEmail(email: string, name: string) {
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
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .feature { display: flex; align-items: flex-start; margin-bottom: 20px; }
          .feature-icon { width: 40px; height: 40px; background: #eff6ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>Welcome to ${APP_NAME}! 🎉</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px;">Hi ${name},</p>
              <p>Your email has been verified and your account is now fully activated. Here's what you can do:</p>

              <div class="feature">
                <div class="feature-icon">🛍️</div>
                <div>
                  <h4 style="margin: 0 0 5px;">Browse Products</h4>
                  <p style="margin: 0; color: #666; font-size: 14px;">Explore our wide range of products and find what you need.</p>
                </div>
              </div>

              <div class="feature">
                <div class="feature-icon">❤️</div>
                <div>
                  <h4 style="margin: 0 0 5px;">Save to Wishlist</h4>
                  <p style="margin: 0; color: #666; font-size: 14px;">Save your favorite items for later.</p>
                </div>
              </div>

              <div class="feature">
                <div class="feature-icon">📦</div>
                <div>
                  <h4 style="margin: 0 0 5px;">Track Orders</h4>
                  <p style="margin: 0; color: #666; font-size: 14px;">Keep track of your orders and delivery status.</p>
                </div>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" class="button">Start Shopping</a>
              </div>
            </div>
            <div class="footer">
              <p>Need help? Contact our support team anytime.</p>
              <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Welcome to ${APP_NAME}! 🎉`,
    html,
  });
}

// Refund Request Confirmation Email
export async function sendRefundRequestEmail(
  email: string,
  name: string,
  requestNumber: string,
  orderNumber: string,
  refundAmount: number,
  items: Array<{ name: string; quantity: number }>
) {
  const itemsList = items.map(item => `<li>${item.name} (x${item.quantity})</li>`).join('');

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
          .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .icon { width: 60px; height: 60px; background: white; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; }
          .content { padding: 30px; }
          .request-box { background: #f0f9ff; border: 2px dashed #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .request-number { font-size: 20px; font-weight: bold; color: #1d4ed8; letter-spacing: 2px; }
          .info-box { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; }
          ul { padding-left: 20px; }
          li { margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
              </div>
              <h1>Refund Request Received</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>We've received your refund request and it's now being reviewed by our team.</p>

              <div class="request-box">
                <p style="margin: 0 0 5px; color: #666; font-size: 14px;">Request Number</p>
                <span class="request-number">${requestNumber}</span>
              </div>

              <div class="info-box">
                <h4 style="margin: 0 0 15px; color: #333;">Request Details</h4>
                <p style="margin: 5px 0; color: #666;"><strong>Order:</strong> #${orderNumber}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Refund Amount:</strong> $${refundAmount.toFixed(2)}</p>
                <p style="margin: 10px 0 5px; color: #666;"><strong>Items:</strong></p>
                <ul style="color: #666;">${itemsList}</ul>
              </div>

              <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>What happens next?</strong><br>
                  Our team will review your request within 1-3 business days. You'll receive an email once a decision has been made.
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile/refunds" class="button">View Request Status</a>
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
    subject: `Refund Request Received - ${requestNumber}`,
    html,
  });
}

// Refund Status Update Email
export async function sendRefundStatusEmail(
  email: string,
  name: string,
  requestNumber: string,
  status: 'approved' | 'rejected' | 'completed',
  refundAmount: number,
  rejectionReason?: string
) {
  const statusConfig = {
    approved: {
      color: '#10b981',
      title: 'Refund Approved',
      icon: '<polyline points="20 6 9 17 4 12"></polyline>',
      message: `Great news! Your refund request has been approved. We will process a refund of <strong>$${refundAmount.toFixed(2)}</strong> to your original payment method.`,
    },
    rejected: {
      color: '#ef4444',
      title: 'Refund Request Declined',
      icon: '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>',
      message: `We're sorry, but your refund request has been declined.${rejectionReason ? `<br><br><strong>Reason:</strong> ${rejectionReason}` : ''}`,
    },
    completed: {
      color: '#10b981',
      title: 'Refund Completed',
      icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
      message: `Your refund of <strong>$${refundAmount.toFixed(2)}</strong> has been processed successfully. Please allow 5-10 business days for the funds to appear in your account.`,
    },
  };

  const config = statusConfig[status];

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
          .icon { width: 60px; height: 60px; background: white; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; }
          .content { padding: 30px; }
          .status-badge { display: inline-block; padding: 8px 20px; background: ${config.color}15; color: ${config.color}; border-radius: 20px; font-weight: 600; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; }
          .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${config.color}" stroke-width="2">
                  ${config.icon}
                </svg>
              </div>
              <h1>${config.title}</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>

              <div style="text-align: center; margin: 30px 0;">
                <span class="status-badge">${status}</span>
                <p style="color: #666; font-size: 14px; margin-top: 10px;">Request #${requestNumber}</p>
              </div>

              <p>${config.message}</p>

              ${status === 'completed' ? `
              <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 5px; color: #666; font-size: 14px;">Refund Amount</p>
                <p style="margin: 0; font-size: 28px; font-weight: bold; color: #10b981;">$${refundAmount.toFixed(2)}</p>
              </div>
              ` : ''}

              ${status === 'rejected' ? `
              <p style="color: #666; font-size: 14px;">If you believe this decision was made in error, please contact our support team with additional information.</p>
              ` : ''}

              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile/refunds" class="button">View Details</a>
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
    subject: `Refund ${status.charAt(0).toUpperCase() + status.slice(1)} - ${requestNumber}`,
    html,
  });
}

// Low Stock Alert Email (for admins)
export async function sendLowStockAlertEmail(
  email: string,
  products: Array<{ name: string; stock: number; sku?: string }>
) {
  const productsList = products.map(p => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${p.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${p.sku || 'N/A'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <span style="background: ${p.stock === 0 ? '#fef2f2' : '#fef3c7'}; color: ${p.stock === 0 ? '#dc2626' : '#d97706'}; padding: 4px 12px; border-radius: 12px; font-weight: 600;">
          ${p.stock}
        </span>
      </td>
    </tr>
  `).join('');

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
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f9fafb; padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600; }
          .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>Low Stock Alert</h1>
            </div>
            <div class="content">
              <p>The following products are running low on stock and may need to be restocked:</p>

              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th style="text-align: center;">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  ${productsList}
                </tbody>
              </table>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/products" class="button">Manage Inventory</a>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated alert from ${APP_NAME}.</p>
              <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Low Stock Alert - ${products.length} Product(s) Need Attention`,
    html,
  });
}

// Back in Stock Notification Email
export async function sendBackInStockEmail(
  email: string,
  productName: string,
  productSlug: string,
  productImage?: string
) {
  const productUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products/${productSlug}`;

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
          .icon { width: 60px; height: 60px; background: white; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; }
          .content { padding: 30px; text-align: center; }
          .product-box { background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .product-image { width: 150px; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; }
          .product-name { font-size: 18px; font-weight: bold; color: #333; margin: 0; }
          .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h1>Rj3 Disponible! 🎉</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; color: #666;">Khabar Mzyan!</p>
              <p>Product li knti kattsna rj3 disponible daba!</p>

              <div class="product-box">
                ${productImage ? `<img src="${productImage}" alt="${productName}" class="product-image" />` : ''}
                <p class="product-name">${productName}</p>
              </div>

              <p style="color: #666;">Sir daba chri 9bel ma ysali!</p>

              <a href="${productUrl}" class="button">Chri Daba</a>

              <p style="margin-top: 30px; font-size: 14px; color: #999;">
                Stock mahdoud, sir daba!
              </p>
            </div>
            <div class="footer">
              <p>Hadi email automatique mn ${APP_NAME}.</p>
              <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `🎉 ${productName} Rj3 Disponible!`,
    html,
  });
}

// Abandoned Cart Reminder Email
interface AbandonedCartItem {
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
}

interface AbandonedCartEmailOptions {
  to: string;
  items: AbandonedCartItem[];
  totalAmount: number;
  reminderNumber: number;
  discountCode?: string;
  discountPercent?: number;
}

export async function sendAbandonedCartEmail({
  to,
  items,
  totalAmount,
  reminderNumber,
  discountCode,
  discountPercent,
}: AbandonedCartEmailOptions) {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center;">
            ${item.productImage ? `<img src="${item.productImage}" alt="${item.productName}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;">` : ''}
            <div>
              <p style="margin: 0; font-weight: 500;">${item.productName}</p>
              <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Qty: ${item.quantity}</p>
            </div>
          </div>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const subjects = {
    1: 'Nssiti chi haja f cart dyalk! 🛒',
    2: '10% OFF - Cart dyalk kattsnak! 🎁',
    3: 'Akhir chance! 15% OFF - Cart dyalk ghadi ytsala! ⏰',
  };

  const messages = {
    1: 'Nssiti chi hajat f cart dyalk. Rj3 w kmmel l\'achat dyalk!',
    2: 'Cart dyalk mazal kattsnak! Hak <strong>10% OFF</strong> bach tkemmel l\'achat dyalk.',
    3: 'Hadi akhir chance! Cart dyalk ghadi ytsala. Hak <strong>15% OFF</strong> exclusif!',
  };

  const subject = subjects[reminderNumber as keyof typeof subjects] || subjects[1];
  const message = messages[reminderNumber as keyof typeof messages] || messages[1];

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
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .icon { width: 60px; height: 60px; background: white; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; }
          .content { padding: 30px; }
          table { width: 100%; border-collapse: collapse; }
          .discount-box { background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
          .discount-code { font-size: 28px; font-weight: bold; color: white; letter-spacing: 3px; background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 8px; display: inline-block; margin-top: 10px; }
          .total-box { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
          .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
          .urgency { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <h1>Cart Dyalk Kattsnak! 🛒</h1>
            </div>
            <div class="content">
              <p>${message}</p>

              ${discountCode ? `
              <div class="discount-box">
                <p style="margin: 0; color: white; font-size: 14px;">Code Exclusif Dyalk:</p>
                <div class="discount-code">${discountCode}</div>
                <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">${discountPercent}% OFF !</p>
              </div>
              ` : ''}

              <h3 style="margin-bottom: 15px; color: #333;">Hajat f Cart:</h3>
              <table>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div class="total-box">
                <p style="margin: 0 0 5px; color: #666; font-size: 14px;">Total</p>
                <p style="margin: 0; font-size: 28px; font-weight: bold; color: #333;">$${totalAmount.toFixed(2)}</p>
                ${discountPercent ? `<p style="margin: 5px 0 0; color: #10b981; font-size: 14px;">Ghadi trb7 $${(totalAmount * discountPercent / 100).toFixed(2)} m3a code dyalk!</p>` : ''}
              </div>

              ${reminderNumber >= 3 ? `
              <div class="urgency">
                <p style="margin: 0; color: #92400e;">⚠️ <strong>Akhir chance!</strong> Had l'offre ghadi ttsala daba. Ma tfoutihlach!</p>
              </div>
              ` : ''}

              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart" class="button">Kmmel L'Achat 🛍️</a>
              </div>

              <p style="margin-top: 30px; text-align: center; font-size: 14px; color: #999;">
                Ila 3ndek chi sou2al, twasl m3ana!
              </p>
            </div>
            <div class="footer">
              <p>Ma bghitich t'recevoir had emails? <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe" style="color: #3b82f6;">Unsubscribe</a></p>
              <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject,
    html,
  });
}

// Gift Card Email
interface GiftCardEmailOptions {
  to: string;
  recipientName: string;
  senderName: string;
  amount: number;
  code: string;
  message?: string;
  expiresAt: Date;
}

export async function sendGiftCardEmail({
  to,
  recipientName,
  senderName,
  amount,
  code,
  message,
  expiresAt,
}: GiftCardEmailOptions) {
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
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .gift-icon { font-size: 60px; margin-bottom: 15px; }
          .content { padding: 30px; text-align: center; }
          .gift-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 30px; margin: 20px 0; color: white; position: relative; overflow: hidden; }
          .gift-card::before { content: ''; position: absolute; top: -50%; right: -50%; width: 100%; height: 100%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); }
          .gift-card .amount { font-size: 48px; font-weight: bold; margin: 10px 0; }
          .gift-card .code { background: rgba(255,255,255,0.2); padding: 15px 25px; border-radius: 8px; font-size: 20px; letter-spacing: 3px; font-weight: bold; margin-top: 15px; display: inline-block; }
          .message-box { background: #faf5ff; border-left: 4px solid #8b5cf6; padding: 20px; margin: 20px 0; text-align: left; border-radius: 0 8px 8px 0; }
          .message-box .from { color: #6d28d9; font-weight: 600; margin-bottom: 10px; }
          .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 20px; }
          .expires { color: #666; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="gift-icon">🎁</div>
              <h1>3ndek Hadiya!</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px; color: #666;">Salam ${recipientName}!</p>
              <p style="color: #333;">${senderName} sift lik Gift Card mn ${APP_NAME}!</p>

              <div class="gift-card">
                <p style="margin: 0; opacity: 0.9; font-size: 14px;">${APP_NAME} Gift Card</p>
                <div class="amount">$${amount.toFixed(2)}</div>
                <p style="margin: 5px 0 0; opacity: 0.9; font-size: 14px;">Code dyalk:</p>
                <div class="code">${code}</div>
              </div>

              ${message ? `
              <div class="message-box">
                <p class="from">Message mn ${senderName}:</p>
                <p style="margin: 0; color: #4a5568; font-style: italic;">"${message}"</p>
              </div>
              ` : ''}

              <p style="color: #666;">Sta3mel had code f checkout bach tnq9es mn prix dyal commande dyalk!</p>

              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" class="button">Tshopping Daba! 🛍️</a>

              <p class="expires">Had gift card valide 7ta l ${expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div class="footer">
              <p>Kifash tsta3mel: Zid l code f checkout page w ghadi ytnq9es mn total dyalk.</p>
              <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `🎁 ${senderName} sift lik $${amount} Gift Card!`,
    html,
  });
}
