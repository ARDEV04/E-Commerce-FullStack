import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@shophub.com";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "ShopHub";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendOrderConfirmation(
  to: string,
  orderId: string,
  total: number
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Order Confirmed – ${APP_NAME} #${orderId.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#1a1a1a">Order Confirmed!</h2>
        <p>Thank you for your order. We've received your payment of <strong>$${total.toFixed(2)}</strong>.</p>
        <p>Order ID: <strong>#${orderId.slice(-8).toUpperCase()}</strong></p>
        <a href="${APP_URL}/orders/${orderId}" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px">Track Your Order</a>
        <p style="margin-top:32px;color:#666;font-size:14px">Thank you for shopping with ${APP_NAME}.</p>
      </div>
    `,
  });
}

export async function sendSellerOrderNotification(
  to: string,
  orderId: string,
  productTitle: string
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `New Order Received – ${APP_NAME}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#1a1a1a">New Order!</h2>
        <p>You have received a new order for <strong>${productTitle}</strong>.</p>
        <a href="${APP_URL}/seller/orders/${orderId}" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px">View Order</a>
      </div>
    `,
  });
}

export async function sendSellerApprovalEmail(to: string, approved: boolean) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Seller Application ${approved ? "Approved" : "Rejected"} – ${APP_NAME}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#1a1a1a">Seller Application Update</h2>
        <p>Your seller application has been <strong>${approved ? "approved" : "rejected"}</strong>.</p>
        ${approved ? `<a href="${APP_URL}/seller/dashboard" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px">Go to Seller Dashboard</a>` : ""}
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Reset your password – ${APP_NAME}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#1a1a1a">Reset Your Password</h2>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${APP_URL}/reset-password?token=${token}" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px">Reset Password</a>
      </div>
    `,
  });
}
