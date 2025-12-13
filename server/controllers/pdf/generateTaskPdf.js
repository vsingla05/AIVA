import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

async function markdownToHtml(markdown) {
  try {
    const { marked } = await import("marked").catch(() => ({ marked: null }));
    if (marked) {
      return marked.parse ? marked.parse(markdown) : marked(markdown);
    }
  } catch (e) {
    // fallback
  }

  return `<pre style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
${escapeHtml(markdown)}
</pre>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default async function generateTaskPdf(markdown, options = {}) {
  if (!markdown) throw new Error("No markdown provided to generate PDF");

  const htmlBody = await markdownToHtml(markdown);

  const html = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body { 
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; 
          padding: 20px; 
          line-height: 1.4; 
          color: #111; 
        }
        pre { 
          white-space: pre-wrap; 
          word-wrap: break-word; 
        }
        h1, h2, h3 { color: #222; }
      </style>
    </head>
    <body>
      ${htmlBody}
    </body>
  </html>
  `;

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: "new",
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: ["networkidle0"] });

    const buffer = await page.pdf({
      format: options.format || "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
    });

    // Optional debug save
    if (process.env.NODE_ENV !== "production" && options.debugSavePath) {
      const debugPath = path.resolve(options.debugSavePath);
      await fs.promises.mkdir(path.dirname(debugPath), { recursive: true });
      await fs.promises.writeFile(debugPath, buffer);
      console.log("Saved debug PDF to", debugPath);
    }

    return buffer;
  } finally {
    await browser.close();
  }
}
