import nodemailer from "nodemailer";

async function sendTaskEmail(employee, task) {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // or any email service
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
        <li><strong>Deadline:</strong> ${task.dueDate.toISOString()}</li>
        <li><strong>Priority:</strong> ${task.priority}</li>
        <li><strong>Estimated Hours:</strong> ${task.estimatedHours}</li>
      </ul>
      <p>Please complete it on time.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export default sendTaskEmail;