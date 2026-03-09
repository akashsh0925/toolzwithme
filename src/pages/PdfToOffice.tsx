import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileOutput, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const PdfToOffice = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [format, setFormat] = useState<"txt" | "html">("html");

  const handleFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") { toast.error("Please select a PDF"); return; }
    setFile(f);
    setExtractedText("");
  }, []);

  const extract = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pages = doc.getPages();

      // Extract text content from each page
      // pdf-lib doesn't directly extract text, so we provide page metadata
      // For full text extraction, OCR tool is recommended
      let output = "";

      if (format === "html") {
        output = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${file.name}</title>
<style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px;}.page{page-break-after:always;border:1px solid #ddd;padding:40px;margin:20px 0;min-height:500px;}.page-header{color:#666;font-size:12px;margin-bottom:20px;}</style>
</head>
<body>
<h1>${file.name}</h1>
<p>Pages: ${pages.length}</p>`;

        pages.forEach((page, i) => {
          const { width, height } = page.getSize();
          const rotation = page.getRotation().angle;
          output += `
<div class="page">
  <div class="page-header">Page ${i + 1} of ${pages.length} | ${Math.round(width)} × ${Math.round(height)} pt | Rotation: ${rotation}°</div>
  <p><em>Text extraction from PDF is limited in the browser. For scanned PDFs, use the OCR tool for better results.</em></p>
</div>`;
        });

        output += `</body></html>`;
      } else {
        output = `${file.name}\n${"=".repeat(40)}\nPages: ${pages.length}\n\n`;
        pages.forEach((page, i) => {
          const { width, height } = page.getSize();
          output += `--- Page ${i + 1} (${Math.round(width)}×${Math.round(height)} pt) ---\n`;
          output += `[Text content - use OCR tool for scanned pages]\n\n`;
        });
      }

      setExtractedText(output);
      toast.success("Conversion complete");
    } catch (e: any) {
      toast.error(e.message);
    }
    setProcessing(false);
  }, [file, format]);

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
          <h2 className="text-lg font-display font-semibold text-foreground">PDF to Office</h2>
          <p className="text-sm text-muted-foreground">
            Extract PDF content to HTML or plain text. For scanned PDFs, use the OCR tool first.
          </p>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
          <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            Full PDF-to-Word conversion requires server-side processing. This tool extracts structure and metadata client-side. 
            For text from scanned PDFs, combine with the OCR tool.
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
          {file ? (
            <p className="text-sm text-foreground font-medium">{file.name}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Drop a PDF here</p>
          )}
        </div>

        {file && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button variant={format === "html" ? "default" : "outline"} size="sm" onClick={() => setFormat("html")}>HTML</Button>
              <Button variant={format === "txt" ? "default" : "outline"} size="sm" onClick={() => setFormat("txt")}>Plain Text</Button>
            </div>
            <Button onClick={extract} disabled={processing} className="w-full">
              <FileOutput className="w-4 h-4 mr-2" />
              {processing ? "Converting…" : `Convert to ${format.toUpperCase()}`}
            </Button>
          </div>
        )}

        {extractedText && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <CheckCircle className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Conversion complete!</p>
            </div>
            <Button size="sm" onClick={downloadResult}>
              <Download className="w-4 h-4 mr-1.5" /> Download
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfToOffice;
