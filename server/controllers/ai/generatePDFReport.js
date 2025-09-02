import PDFDocument from "pdfkit";
import fs from "fs";
import generateTaskReport from "./generateTaskReport";

export default async function generatePDFReport(taskId) {
  const report = await generateTaskReport(taskId);

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(`task-report-${taskId}.pdf`));

  doc.fontSize(16).text(`Task Report: ${report.taskTitle}`, { underline: true });
  doc.moveDown();

  doc.fontSize(12).text(`Assigned To: ${report.assignedTo}`);
  doc.text(`Assigned By: ${report.assignedBy}`);
  doc.text(`Due Date: ${report.dueDate}`);
  doc.text(`Status: ${report.status}`);
  doc.moveDown();

  doc.text("Phases:", { underline: true });
  report.phases.forEach((phase, idx) => {
    doc.text(`${idx + 1}. ${phase.title}`);
    doc.text(`   Due Date: ${phase.dueDate}`);
    doc.text(`   Status: ${phase.status}`);
    doc.text(`   Completed At: ${phase.completedAt || "N/A"}`);
    doc.text(`   Notes: ${phase.notes || "N/A"}`);
    doc.moveDown();
  });

  if (report.alerts.length > 0) {
    doc.text("Alerts:", { underline: true });
    report.alerts.forEach((alert, idx) => {
      doc.text(`${idx + 1}. ${alert.message} (Created At: ${alert.createdAt})`);
    });
  }

  doc.end();
  return `task-report-${taskId}.pdf`;
}
