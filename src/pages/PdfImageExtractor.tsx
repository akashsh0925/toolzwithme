import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download, ImageDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface ExtractedImage {
  name: string;
  url: string;
  width: number;
  height: number;
}

async function loadPdfJs(): Promise<any> {
  // @ts-ignore - dynamic import from CDN
  const pdfjsLib = await import(/* @vite-ignore */ 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs');
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';
  return pdfjsLib;
}

const PdfImageExtractor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState<ExtractedImage[]>([]);

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { toast.error("Select a PDF"); return; }
    setFile(f); setImages([]);
  };

  const extract = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setImages([]);

    try {
      const pdfjs = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const extracted: ExtractedImage[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setProgress(Math.round((i / totalPages) * 100));
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;

        const url = canvas.toDataURL("image/png");
        extracted.push({
          name: `page-${i}.png`,
          url,
          width: Math.round(viewport.width),
          height: Math.round(viewport.height),
        });
      }

      setImages(extracted);
      toast.success(`Rendered ${extracted.length} page(s) as images`);
    } catch (e: any) { toast.error(e.message); }
    setProcessing(false);
  }, [file]);

  const downloadAll = () => {
    images.forEach((img) => {
      const a = document.createElement("a");
      a.href = img.url;
      a.download = img.name;
      a.click();
    });
  };

  return (
    <ToolLayout title="PDF Image Extractor" toolName="pdf-image-extractor">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">PDF Image Extractor</h2>
          <p className="text-sm text-muted-foreground">Render each PDF page as a high-resolution PNG image.</p>
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
            <ImageDown className="w-4 h-4 mr-2" /> {processing ? "Rendering…" : "Extract as Images"}
          </Button>
        )}

        {processing && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">Rendering pages… {progress}%</p>
          </div>
        )}

        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{images.length} page(s) extracted</p>
              <Button variant="outline" size="sm" onClick={downloadAll}>
                <Download className="w-3.5 h-3.5 mr-1" /> Download All
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img) => (
                <div key={img.name} className="rounded-lg border border-border overflow-hidden bg-card">
                  <img src={img.url} alt={img.name} className="w-full h-32 object-cover bg-secondary" />
                  <div className="p-2 flex items-center justify-between">
                    <p className="text-xs truncate">{img.name}</p>
                    <a href={img.url} download={img.name} className="text-xs text-primary hover:underline shrink-0 ml-1">Save</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
export default PdfImageExtractor;
