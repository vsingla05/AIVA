import nodemailer from "nodemailer";

export async function sendAlertEmail({ to, subject, message, html }) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    const mailOptions = {
      from: `"Task Management System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: message,
      html: html || `<p>${message}</p>`,
    };

    await transporter.sendMail(mailOptions);

    console.log("📨 Email sent successfully to:", to);
    return true;
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    return false;
  }
}
