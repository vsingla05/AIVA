import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// ✅ Create reusable transporter
const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE || "Gmail", // e.g., Gmail, Outlook, etc.
  host: process.env.SMTP_HOST || undefined,     // optional (for Mailtrap or other SMTPs)
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
  },
});

/**
 * Send a styled email
 * @param {string} to - recipient email(s)
 * @param {string} subject - email subject
 * @param {string} text - plain text fallback
 * @param {string} html - HTML content
 */
export async function sendMail(to, subject, text, html) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || process.env.SMTP_USER,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    throw new Error("Email sending failed: " + error.message);
  }
}
