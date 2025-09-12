import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function sendTaskEmail(employee, task, pdfUrl) {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: employee.email,
      subject: `📌 New Task Assigned: ${task.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #2F4F4F;">Hello ${employee.name},</h2>
          <p>You have been assigned a new task. Here are the details:</p>
          <table style="border-collapse: collapse; width: 100%;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">Task:</td>
              <td style="padding: 8px;">${task.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Deadline:</td>
              <td style="padding: 8px;">${task.dueDate ? task.dueDate.toISOString().split("T")[0] : "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Priority:</td>
              <td style="padding: 8px;">${task.priority || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Estimated Hours:</td>
              <td style="padding: 8px;">${task.estimatedHours || "N/A"}</td>
            </tr>
          </table>
          ${pdfUrl ? `<p>📄 View the PDF report: <a href="${pdfUrl}" target="_blank">Click Here</a></p>` : ""}
          <p>Best regards,<br>AIVA Task Management System</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

export default sendTaskEmail;
