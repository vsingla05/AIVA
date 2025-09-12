import nodemailer from "nodemailer";
import { Employee } from "../../models/employees/index.js";

export async function sendNotification(employeeId, aiResponse) {
  const employee = await Employee.findById(employeeId);
  if (!employee) return;

  const { employeeMessage, actionItem, escalation } = aiResponse;

  // --- 1. Email notification ---
  if (employee.email) {
    const transporter = nodemailer.createTransport({
      service: "gmail", // change to your provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"AI HR Assistant" <${process.env.EMAIL_USER}>`,
      to: employee.email,
      subject: "⚠️ Phase Delay Notification",
      text: `${employeeMessage}\n\nSuggested Action: ${actionItem}${
        escalation ? "\n\n⚠️ HR will be notified." : ""
      }`,
    });
  }

  // --- 2. Internal DB alert ---
  employee.alerts = employee.alerts || [];
  employee.alerts.push({
    message: employeeMessage,
    createdAt: new Date(),
  });
  await employee.save();

  // --- 3. Optionally push to Slack/Teams ---
  if (process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🚨 Delay Alert for *${employee.name}* \n${employeeMessage}\nAction: ${actionItem}`,
      }),
    });
  }

  return true;
}
