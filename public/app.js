document.getElementById("pdfForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const pdfName = document.getElementById("pdfName").value;
  const htmlContent = document.getElementById("htmlContent").value;
  const generateBtn = document.getElementById("generateBtn");
  const status = document.getElementById("status");

  // Reset status
  status.style.display = "none";
  status.className = "status";

  // Disable button and show loading
  generateBtn.disabled = true;
  generateBtn.textContent = "Gerando PDF...";
  status.className = "status loading";
  status.textContent = "Processando seu HTML e gerando o PDF...";
  status.style.display = "block";

  try {
    const response = await fetch("/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pdfName: pdfName,
        htmlContent: htmlContent,
      }),
    });

    if (
      response.ok &&
      response.headers.get("content-type")?.includes("application/pdf")
    ) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = pdfName + ".pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      status.className = "status success";
      status.textContent =
        "PDF gerado com sucesso! O download deve começar automaticamente.";
    } else {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Falha ao gerar PDF");
    }
  } catch (error) {
    status.className = "status error";
    status.textContent = "Erro ao gerar PDF: " + error.message;
    console.error("Erro:", error);
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Gerar PDF";
  }
});

// Função para carregar exemplo no textarea
function loadExample() {
  const exampleHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Minha Apostila</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6;
        }
        h1 { 
            color: #333; 
            border-bottom: 3px solid #007bff;
            padding-bottom: 10px;
        }
        h2 { 
            color: #555; 
            margin-top: 30px;
        }
        .highlight { 
            background-color: #ffff99; 
            padding: 2px 4px;
            border-radius: 3px;
        }
        .important-box {
            background-color: #e7f3ff;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin: 20px 0;
        }
        ul li {
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <h1>Capítulo 1: Introdução ao Assunto</h1>
    <p>Este é um <span class="highlight">exemplo</span> de como estruturar seu conteúdo de estudo.</p>
    
    <h2>Tópicos Importantes</h2>
    <ul>
        <li><strong>Conceito fundamental:</strong> Definição básica do assunto</li>
        <li><strong>Aplicações práticas:</strong> Onde e como usar</li>
        <li><strong>Exemplos:</strong> Casos de uso reais</li>
    </ul>

    <div class="important-box">
        <strong>💡 Dica Important:</strong> Use esta estrutura como base para organizar seus estudos de forma clara e objetiva.
    </div>

    <h2>Conclusão</h2>
    <p>Personalize este template conforme suas necessidades de estudo.</p>
</body>
</html>`;

  document.getElementById("htmlContent").value = exampleHtml;
}

// Adicionar botão para carregar exemplo (opcional)
document.addEventListener("DOMContentLoaded", function () {
  // Adicionar botão de exemplo após o textarea
  const textarea = document.getElementById("htmlContent");
  const exampleBtn = document.createElement("button");
  exampleBtn.type = "button";
  exampleBtn.textContent = "📝 Carregar Exemplo";
  exampleBtn.style.marginTop = "10px";
  exampleBtn.style.width = "auto";
  exampleBtn.style.padding = "8px 16px";
  exampleBtn.style.fontSize = "14px";
  exampleBtn.onclick = loadExample;

  textarea.parentNode.appendChild(exampleBtn);
});
