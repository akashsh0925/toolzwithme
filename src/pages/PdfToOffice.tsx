import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileOutput, Copy, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

async function loadPdfJs(): Promise<any> {
  // @ts-ignore - dynamic import from CDN
  const pdfjsLib = await import(/* @vite-ignore */ 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs');
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';
  return pdfjsLib;
}

const PdfToOffice = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [format, setFormat] = useState<"txt" | "html">("txt");

  const handleFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") { toast.error("Please select a PDF"); return; }
    setFile(f);
    setExtractedText("");
  }, []);

  const extract = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setExtractedText("");

    try {
      const pdfjs = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const pageTexts: string[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setProgress(Math.round((i / totalPages) * 100));
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item: any) => item.str).join(" ");
        pageTexts.push(text);
      }

      let output: string;
      if (format === "html") {
        const pagesHtml = pageTexts
          .map((text, i) => `<div class="page"><h2>Page ${i + 1}</h2><p>${text || "<em>No text content (scanned page — use OCR tool)</em>"}</p></div>`)
          .join("\n");
        output = `<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>${file.name}</title>\n<style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px}.page{border-bottom:1px solid #ddd;padding:20px 0;margin-bottom:20px}h2{color:#333;font-size:14px}</style>\n</head><body>\n<h1>${file.name}</h1>\n${pagesHtml}\n</body></html>`;
      } else {
        output = pageTexts
          .map((text, i) => `--- Page ${i + 1} ---\n${text || "[No text — scanned page, use OCR tool]"}`)
          .join("\n\n");
      }

      setExtractedText(output);

      const totalChars = pageTexts.join("").length;
      if (totalChars < 50) {
        toast.info("Very little text found — this may be a scanned PDF. Try the OCR tool instead.");
      } else {
        toast.success(`Extracted text from ${totalPages} pages`);
      }
    } catch (e: any) {
      toast.error(e.message);
    }
    setProcessing(false);
  }, [file, format]);

  const copyText = () => {
    navigator.clipboard.writeText(extractedText);
    toast.success("Copied to clipboard");
  };

  const downloadResult = useCallback(() => {
    const ext = format === "html" ? "html" : "txt";
    const mime = format === "html" ? "text/html" : "text/plain";
    const blob = new Blob([extractedText], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (file?.name || "document").replace(".pdf", `.${ext}`);
    a.click();
    URL.revokeObjectURL(url);
  }, [extractedText, format, file]);

  return (
    <ToolLayout title="PDF to Office" toolName="pdf-to-office">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">PDF to Text / HTML</h2>
          <p className="text-sm text-muted-foreground">
            Extract text from digital PDFs. For scanned PDFs, use the OCR tool.
          </p>
        </div>

        <div
          onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => document.getElementById("pdf-office-input")?.click()}
        >
          <input id="pdf-office-input" type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <FileOutput className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          {file ? <p className="text-sm text-foreground font-medium">{file.name}</p> : <p className="text-sm text-muted-foreground">Drop a PDF here</p>}
        </div>

        {file && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button variant={format === "txt" ? "default" : "outline"} size="sm" onClick={() => setFormat("txt")}>Plain Text</Button>
              <Button variant={format === "html" ? "default" : "outline"} size="sm" onClick={() => setFormat("html")}>HTML</Button>
            </div>
            <Button onClick={extract} disabled={processing} className="w-full">
              <FileOutput className="w-4 h-4 mr-2" />
              {processing ? "Extracting…" : `Extract as ${format.toUpperCase()}`}
            </Button>
          </div>
        )}

        {processing && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">Extracting text… {progress}%</p>
          </div>
        )}

        {extractedText && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-display font-semibold text-foreground">Extracted Content</h3>
              </div>
              <div className="flex gap-1.5">
                <Button variant="ghost" size="sm" onClick={copyText}>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={downloadResult}>
                  <Download className="w-3.5 h-3.5 mr-1" /> .{format}
                </Button>
              </div>
            </div>
            <textarea
              readOnly
              value={extractedText}
              className="w-full h-64 resize-y rounded-lg border border-border bg-background text-foreground font-mono text-sm p-3"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfToOffice;
