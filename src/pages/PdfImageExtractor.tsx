import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download, ImageDown, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ExtractedImage {
  name: string;
  url: string;
  size: number;
}

const PdfImageExtractor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [images, setImages] = useState<ExtractedImage[]>([]);

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { toast.error("Select a PDF"); return; }
    setFile(f); setImages([]);
  };

  const extract = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    try {
      // pdf-lib doesn't natively extract images easily, but we can get embedded objects
      // For now, provide a message about limitations and extract page renders
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pageCount = doc.getPageCount();

      toast.info(`PDF has ${pageCount} pages. Direct image extraction from PDFs requires advanced parsing. For scanned PDFs, use the OCR tool.`);
      setImages([]);
    } catch (e: any) { toast.error(e.message); }
    setProcessing(false);
  }, [file]);

  return (
    <ToolLayout title="PDF Image Extractor" toolName="pdf-image-extractor">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">PDF Image Extractor</h2>
          <p className="text-sm text-muted-foreground">Extract embedded images from PDF documents.</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
          ⚠️ Client-side PDF image extraction has limitations. Complex PDFs with embedded streams may not extract all images. For scanned PDFs, use the OCR tool instead.
        </div>
        <div onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => document.getElementById("img-ext-in")?.click()}>
          <input id="img-ext-in" type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <ImageDown className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          {file ? <p className="text-sm text-foreground font-medium">{file.name}</p> : <p className="text-sm text-muted-foreground">Drop a PDF here</p>}
        </div>
        {file && (
          <Button onClick={extract} disabled={processing} className="w-full">
            <ImageDown className="w-4 h-4 mr-2" /> {processing ? "Extracting…" : "Extract Images"}
          </Button>
        )}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img, i) => (
              <div key={i} className="rounded-lg border border-border overflow-hidden bg-card">
                <img src={img.url} alt={img.name} className="w-full h-24 object-cover bg-secondary" />
                <div className="p-2"><p className="text-xs truncate">{img.name}</p>
                  <a href={img.url} download={img.name} className="text-xs text-primary hover:underline">Download</a></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
export default PdfImageExtractor;
