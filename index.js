import express from "express";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, "public")));

// Rota principal - redireciona para index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Rota para gerar PDF
app.post("/generate-pdf", async (req, res) => {
  let browser;
  try {
    const { pdfName, htmlContent } = req.body;

    if (!pdfName || !htmlContent) {
      return res.status(400).send("Nome do PDF e conteúdo HTML são obrigatórios");
    }

    // Sanitizar nome do arquivo (evita caracteres inválidos)
    const safeName = pdfName.replace(/[^a-zA-Z0-9-_]/g, "_") || "documento";

    console.log(`📄 Gerando PDF: ${safeName}.pdf (tamanho HTML: ${htmlContent.length} chars)`);

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // Injeta diretamente o HTML (evita problemas de file:// no Windows)
    await page.setContent(htmlContent, {
      waitUntil: "load",
      timeout: 30000
    });

    // Garantir uso de estilos de tela (para printBackground)
    await page.emulateMediaType("screen");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
      preferCSSPageSize: true
    });

    console.log(`✅ PDF gerado (${pdfBuffer.length} bytes)`);

    await browser.close();
    browser = null;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.end(pdfBuffer); // garante envio binário completo
  } catch (error) {
    console.error("❌ Erro ao gerar PDF:", error);
    if (browser) {
      try { await browser.close(); } catch {}
    }
    // Retornar JSON para o front distinguir erro (evita baixar PDF inválido)
    if (!res.headersSent) {
      return res.status(500).json({ error: "Erro interno: " + error.message });
    }
  }
});
// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).send("Página não encontrada");
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(
    `📁 Servindo arquivos estáticos da pasta: ${path.join(__dirname, "public")}`
  );
  console.log("📄 Acesse o navegador para usar o PDF Study Generator!");
});
