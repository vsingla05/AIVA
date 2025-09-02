import fs from "fs";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default async function generateTaskPdf(employeeName, employeeEmail, phases, outputPath) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;

  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  let y = height - 50;

  const leftMargin = 50;
  const rightMargin = width - 50;
  const rowHeight = 20;

  // Header
  page.drawText(`Employee Task Report`, { x: leftMargin, y, size: 16, font });
  y -= 25;
  page.drawText(`Name: ${employeeName}`, { x: leftMargin, y, size: fontSize, font });
  y -= 18;
  page.drawText(`Email: ${employeeEmail}`, { x: leftMargin, y, size: fontSize, font });
  y -= 25;

  for (const phase of phases) {
    // Phase title
    page.drawText(`Phase: ${phase.title}`, { x: leftMargin, y, size: 14, font });
    y -= rowHeight;

    // Table header
    const columns = ["Task", "Description", "Deadline", "Status"];
    const colWidths = [120, 220, 80, 80];
    let x = leftMargin;

    // Draw column titles
    for (let i = 0; i < columns.length; i++) {
      page.drawText(columns[i], { x, y, size: fontSize, font });
      x += colWidths[i];
    }
    y -= rowHeight;

    // Draw rows
    for (const task of phase.tasks) {
      x = leftMargin;

      const values = [
        task.title,
        task.description,
        new Date(task.dueDate).toLocaleDateString("en-GB"),
        task.status,
      ];

      for (let i = 0; i < values.length; i++) {
        page.drawText(values[i], { x, y, size: fontSize, font });
        x += colWidths[i];
      }
      y -= rowHeight;

      // Add new page if needed
      if (y < 50) {
        y = height - 50;
        page = pdfDoc.addPage();
      }
    }

    y -= rowHeight; // space after phase
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`PDF generated at ${outputPath}`);
  return outputPath;
}
