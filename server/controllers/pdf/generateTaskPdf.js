import { PDFDocument, StandardFonts } from "pdf-lib";

export default async function generateTaskPdf(fullReport) {
  // ⚡ Remove SECTION A regex since your prompt doesn’t have that
  const reportText = fullReport.trim();

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

  // 3️⃣ Draw text with wrapping
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

        if (y < 50) {
          page = pdfDoc.addPage();
          ({ width, height } = page.getSize());
          y = height - 50;
        }
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

  // 4️⃣ Split into lines and draw
  const lines = reportText.split("\n");
  for (const line of lines) {
    y = drawWrappedText(line, leftMargin, y);
  }

  // 5️⃣ Save PDF as Uint8Array
  return await pdfDoc.save();
}
