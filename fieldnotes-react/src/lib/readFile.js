export const SUPPORTED_EXTENSIONS = ["pdf", "docx", "txt", "md", "markdown", "csv", "json"];

export async function extractFileText(file, extension) {
  if (extension === "pdf") {
    const pdfjs = await import("pdfjs-dist/build/pdf");
    const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.js?url")).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => item.str).join(" "));
    }
    return pages.join("\n");
  }
  if (extension === "docx") {
    const mammoth = (await import("mammoth/mammoth.browser")).default;
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return result.value;
  }
  return file.text();
}
