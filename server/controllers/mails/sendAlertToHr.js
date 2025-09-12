import nodemailer from "nodemailer";

export async function sendAlertToHr(employee, task, phase, delayPercent, hr) {
  if (!hr?.email) return false; // HR email check

  const emailText = `
CRITICAL ALERT: MAJOR TASK DELAY

This is an automated notification that a major task delay has occurred.

Incident Details:
- Employee: ${employee.name} (ID: ${employee._id})
- Task: ${task.title}
- Phase: ${phase.title}
- Severity: MAJOR DELAY
- Delay Percentage: ${delayPercent.toFixed(2)}%
- Phase Due Date: ${phase.dueDate.toDateString()}
- Completion Date: ${new Date().toDateString()}

Please review the employee's performance history and take appropriate action.
`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"AI HR Assistant" <${process.env.EMAIL_USER}>`,
      to: hr.email,
      subject: `Critical Alert: Major Delay by ${employee.name}`,
      text: emailText,
      html: `<p><strong>CRITICAL ALERT: MAJOR TASK DELAY</strong></p>
             <p>Employee: ${employee.name} (ID: ${employee._id})</p>
             <p>Task: ${task.title}</p>
             <p>Phase: ${phase.title}</p>
             <p>Severity: MAJOR DELAY</p>
             <p>Delay Percentage: ${delayPercent.toFixed(2)}%</p>
             <p>Phase Due Date: ${phase.dueDate.toDateString()}</p>
             <p>Completion Date: ${new Date().toDateString()}</p>
             <p>Please review the employee's performance history.</p>`
    });
    return true;
  } catch (err) {
    console.error("Failed to send HR alert email:", err);
    return false;
  }
}
