import { PDFDocument, StandardFonts } from "pdf-lib";
import MarkdownIt from "markdown-it";
import puppeteer from "puppeteer";


export default async function generateTaskPdf(fullReport) {
  if (!fullReport || typeof fullReport !== "string") {
    throw new Error("Invalid report text provided");
  }

  // 🧩 Detect Markdown-like formatting
  const hasMarkdown =
    /[#*|_]/.test(fullReport) || fullReport.includes("**") || fullReport.includes("|");

  if (hasMarkdown) {
    console.log("🧾 Detected markdown report → Using Puppeteer HTML rendering");
    return await generateStyledMarkdownPdf(fullReport);
  } else {
    console.log("📄 Detected plain text → Using pdf-lib minimal rendering");
    return await generatePlainTextPdf(fullReport);
  }
}

/* ────────────────────────────────────────────────
   📄 1️⃣ Plain Text PDF (Your Version - pdf-lib)
──────────────────────────────────────────────── */
async function generatePlainTextPdf(reportText) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 11;

  let page = pdfDoc.addPage();
  let { width, height } = page.getSize();
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

        // New page if text goes below margin
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

  const lines = reportText.split("\n");
  for (const line of lines) {
    y = drawWrappedText(line, leftMargin, y);
  }

  return await pdfDoc.save();
}

/* ────────────────────────────────────────────────
   🧾 2️⃣ Styled Markdown PDF (My Version - Puppeteer)
──────────────────────────────────────────────── */
async function generateStyledMarkdownPdf(markdownText) {
  const md = new MarkdownIt();
  const htmlContent = md.render(markdownText);

  const styledHtml = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body {
          font-family: 'Helvetica', sans-serif;
          color: #222;
          margin: 40px;
          font-size: 12px;
        }
        h1, h2, h3 {
          color: #0056b3;
          margin-top: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        p {
          margin: 6px 0;
          line-height: 1.4;
        }
        strong {
          color: #333;
        }
        em {
          color: #555;
        }
        footer {
          text-align: center;
          margin-top: 30px;
          font-size: 10px;
          color: #888;
        }
      </style>
    </head>
    <body>
      ${htmlContent}
      <footer>
        Generated automatically by AIVA Project Management System
      </footer>
    </body>
  </html>`;

  // Launch Puppeteer to create PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(styledHtml, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
  });

  await browser.close();
  return pdfBuffer;
}
