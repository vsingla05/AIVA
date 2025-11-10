// 📁 /services/mails/taskMail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// 🧩 Reusable transporter setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use Gmail App Password, not your actual password
  },
});

/**
 * Sends task assignment email with task details & report link
 * @param {Object} employee - Employee object (name, email)
 * @param {Object} task - Task object (title, dueDate, priority, estimatedHours)
 * @param {string} pdfUrl - Cloudinary PDF link (optional)
 */
async function sendTaskEmail(employee, task, pdfUrl) {
  try {
    if (!employee?.email) throw new Error("Missing employee email");
    if (!task?.title) throw new Error("Missing task title");

    const mailOptions = {
      from: `"AIVA Task Manager" <${process.env.EMAIL_USER}>`,
      to: employee.email,
      subject: `📌 New Task Assigned: ${task.title}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 0 8px rgba(0,0,0,0.1); padding: 25px;">
            <h2 style="color: #2f4f4f;">👋 Hello ${employee.name},</h2>
            <p style="font-size: 15px;">You have been assigned a new task. Here are the details:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <tr>
                <td style="padding: 8px; font-weight: bold; border: 1px solid #eee;">Task:</td>
                <td style="padding: 8px; border: 1px solid #eee;">${task.title}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; border: 1px solid #eee;">Deadline:</td>
                <td style="padding: 8px; border: 1px solid #eee;">${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; border: 1px solid #eee;">Priority:</td>
                <td style="padding: 8px; border: 1px solid #eee;">${task.priority || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; border: 1px solid #eee;">Estimated Hours:</td>
                <td style="padding: 8px; border: 1px solid #eee;">${task.estimatedHours || "N/A"}</td>
              </tr>
            </table>

            ${
              pdfUrl
                ? `<p style="margin-top: 15px;">📄 View the detailed task report: 
                   <a href="${pdfUrl}" target="_blank" style="color: #007BFF; text-decoration: none;">Click Here</a></p>`
                : `<p><em>No report PDF available yet.</em></p>`
            }

            <p style="margin-top: 20px;">We’re confident in your ability to complete this task with excellence! 💪</p>
            
            <p style="font-size: 13px; color: #777; margin-top: 30px;">
              — AIVA Task Management System<br/>
              <a href="https://aiva-dashboard.vercel.app" style="color: #007BFF; text-decoration: none;">Visit Dashboard</a>
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${employee.name} (${employee.email}):`, info.messageId);
  } catch (err) {
    console.error(`❌ Failed to send email to ${employee?.name || "Unknown"}:`, err.message);
  }
}

export default sendTaskEmail;
