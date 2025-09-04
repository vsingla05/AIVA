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
      subject: `New Task Assigned: ${task.title}`,
      html: `
        <h3>Hello ${employee.name},</h3>
        <p>You have been assigned a new task:</p>
        <ul>
          <li><strong>Task:</strong> ${task.title}</li>
          <li><strong>Deadline:</strong> ${task.deadline?.toISOString() || "N/A"}</li>
          <li><strong>Priority:</strong> ${task.priority || "N/A"}</li>
          <li><strong>Estimated Hours:</strong> ${task.estimatedHours || "N/A"}</li>
        </ul>
        <p>📄 View the PDF report: <a href="${pdfUrl}" target="_blank">Click Here</a></p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

export default sendTaskEmail;
