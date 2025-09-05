import { PDFDocument, StandardFonts } from "pdf-lib";

export default async function generateTaskPdf(reportText) {
  // 1️⃣ Create PDF document
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 11;

  // 2️⃣ Add first page
  let page = pdfDoc.addPage();
  let { width, height } = page.getSize();
  let y = height - 50;

  const leftMargin = 50;
  const maxWidth = width - 100;
  const lineHeight = 15;

  // 3️⃣ Function to draw text with wrapping and new pages
  function drawWrappedText(text, x, y) {
    const words = text.split(" ");
    let line = "";

    for (const word of words) {
      const testLine = line + word + " ";
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (textWidth > maxWidth) {
        // Draw the line on current page
        page.drawText(line, { x, y, size: fontSize, font });

        // Start new line
        line = word + " ";
        y -= lineHeight;

        // Check if we need a new page
        if (y < 50) {
          page = pdfDoc.addPage(); // Add new page
          ({ width, height } = page.getSize());
          y = height - 50;
        }
      } else {
        line = testLine;
      }
    }

    // Draw any remaining text
    if (line) {
      page.drawText(line, { x, y, size: fontSize, font });
      y -= lineHeight;
    }

    return y;
  }

  // 4️⃣ Split report into lines and draw them
  const lines = reportText.split("\n");
  for (const line of lines) {
    y = drawWrappedText(line, leftMargin, y);
  }

  // 5️⃣ Save PDF as Uint8Array (ready for upload)
  const pdfBytes = await pdfDoc.save();
  return pdfBytes; // Do NOT wrap in Buffer here
}
