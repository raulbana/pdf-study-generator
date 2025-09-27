import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import readline from "readline";
import os from "os";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (q) => new Promise((resolve) => rl.question(q, resolve));

(async () => {
  try {
    const pdfName = await question("Digite o nome do PDF (sem extensão): ");
    const htmlInput = await question(
      "Cole ou digite o HTML (uma linha, ou cole e pressione Enter):\n"
    );

    rl.close();

    const tempHtmlPath = path.join(
      os.tmpdir(),
      `temp_apostila_${Date.now()}.html`
    );
    fs.writeFileSync(tempHtmlPath, htmlInput, "utf8");

    console.log(`HTML salvo temporariamente em: ${tempHtmlPath}`);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(`file://${tempHtmlPath}`, { waitUntil: "networkidle0" });

    const pdfPath = `${pdfName}.pdf`;
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();
    console.log(`PDF gerado com sucesso: ${pdfPath}`);
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    rl.close();
  }
})();
