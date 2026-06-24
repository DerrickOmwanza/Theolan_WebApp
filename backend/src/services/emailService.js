import nodemailer from 'nodemailer';
import logger from '../middlewares/logger.js';

// ============================================================
// Email Service Configuration
// ============================================================

const EMAIL_HOST = process.env.SMTP_HOST || 'smtp.sendgrid.net';
const EMAIL_PORT = parseInt(process.env.SMTP_PORT) || 587;
const EMAIL_USER = process.env.SMTP_USER || 'apikey';
const EMAIL_PASS = process.env.SMTP_PASS || process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@theolan.co.ke';

// Create transporter
const createTransporter = () => {
  if (!EMAIL_PASS) {
    logger.warn('Email service not configured - SMTP_PASS not set');
    return null;
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
};

// ============================================================
// Email Templates
// ============================================================

const templates = {
  quotation: (data) => ({
    subject: `Quotation #${data.reference_number} - The Olan Glass and Aluminium`,
    html: `
      <h2>Quotation Details</h2>
      <p><strong>Reference:</strong> ${data.reference_number}</p>
      <p><strong>Product:</strong> ${data.product_summary}</p>
      <p><strong>Total:</strong> KES ${data.total_price_kes?.toLocaleString()}</p>
      <p><strong>Quote Range:</strong> KES ${data.estimate_min_kes?.toLocaleString()} - ${data.estimate_max_kes?.toLocaleString()}</p>
      ${data.pdf_url ? `<p><a href="${data.pdf_url}">Download PDF</a></p>` : ''}
      <p>Thank you for choosing The Olan Glass and Aluminium.</p>
    `
  }),

  orderStatus: (data) => ({
    subject: `Order Update: ${data.status} - ${data.reference_number}`,
    html: `
      <h2>Order Status Update</h2>
      <p><strong>Order:</strong> ${data.reference_number}</p>
      <p><strong>Status:</strong> ${data.status}</p>
      <p><strong>Payment:</strong> ${data.payment_status}</p>
      ${data.notes ? `<p>${data.notes}</p>` : ''}
      <p>Track your order at <a href="https://theolan.co.ke/orders/${data.id}">theolan.co.ke</a></p>
    `
  }),

  adminAlert: (data) => ({
    subject: `Admin Alert: ${data.title}`,
    html: `
      <h2>${data.title}</h2>
      <p>${data.message}</p>
      ${data.action_url ? `<p><a href="${data.action_url}">View Details</a></p>` : ''}
    `
  })
};

// ============================================================
// Email Service
// ============================================================

const EmailService = {
  /**
   * Send quotation email to client.
   */
  sendQuotation: async (to, data) => {
    const transporter = createTransporter();
    if (!transporter) {
      logger.warn('Email not sent - transporter not configured', { to, type: 'quotation' });
      return { success: false, message: 'Email service not configured' };
    }

    const { subject, html } = templates.quotation(data);

    try {
      const result = await transporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        html
      });

      logger.info('Quotation email sent', { to, messageId: result.messageId });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error('Failed to send quotation email', { error: error.message, to });
      return { success: false, error: error.message };
    }
  },

  /**
   * Send order status update email.
   */
  sendOrderUpdate: async (to, data) => {
    const transporter = createTransporter();
    if (!transporter) {
      logger.warn('Email not sent - transporter not configured', { to, type: 'order_update' });
      return { success: false, message: 'Email service not configured' };
    }

    const { subject, html } = templates.orderStatus(data);

    try {
      const result = await transporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        html
      });

      logger.info('Order update email sent', { to, orderId: data.id });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error('Failed to send order update email', { error: error.message, to });
      return { success: false, error: error.message };
    }
  },

  /**
   * Send admin alert email.
   */
  sendAdminAlert: async (to, data) => {
    const transporter = createTransporter();
    if (!transporter) {
      logger.warn('Email not sent - transporter not configured', { to, type: 'admin_alert' });
      return { success: false, message: 'Email service not configured' };
    }

    const { subject, html } = templates.adminAlert(data);

    try {
      const result = await transporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        html
      });

      logger.info('Admin alert email sent', { to });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error('Failed to send admin alert email', { error: error.message, to });
      return { success: false, error: error.message };
    }
  }
};

export default EmailService;
