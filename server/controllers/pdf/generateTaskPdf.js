import { PDFDocument, StandardFonts } from "pdf-lib";

export default async function generateTaskPdf(reportText) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 11;

  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  let y = height - 50;

  const leftMargin = 50;
  const maxWidth = width - 100;
  const lineHeight = 15;

  function drawWrappedText(text, x, y) {
    const words = text.split(" ");
    let line = "";
    for (const word of words) {
      const testLine = line + word + " ";
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (textWidth > maxWidth) {
        page.drawText(line, { x, y, size: fontSize, font });
        line = word + " ";
        y -= lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) {
      page.drawText(line, { x, y, size: fontSize, font });
      y -= lineHeight;
    }
    return y;
  }

  // Draw report text line by line
  const lines = reportText.split("\n");
  for (const line of lines) {
    if (y < 50) {
      page = pdfDoc.addPage();
      y = height - 50;
    }
    y = drawWrappedText(line, leftMargin, y);
  }

  const pdfBytes = await pdfDoc.save();
  console.log('pdfBytes', pdfBytes);
  return Buffer.from(pdfBytes); // Return buffer directly for Cloudinary
}
