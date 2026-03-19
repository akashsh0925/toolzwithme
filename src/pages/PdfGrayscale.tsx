import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PDFDropzone } from "@/components/pdf/PDFDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";
import { ProgressBar } from "@/components/pdf/ProgressBar";
import { PDFDocument } from "pdf-lib";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function PdfGrayscale() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const convert = async () => {
    if (!file) return;
    setProcessing(true); setProgress(0);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const outDoc = await PDFDocument.create();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;

        // Convert to grayscale
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let j = 0; j < data.length; j += 4) {
          const gray = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2];
          data[j] = data[j + 1] = data[j + 2] = gray;
        }
        ctx.putImageData(imageData, 0, 0);

        const imgBytes = await fetch(canvas.toDataURL("image/png")).then(r => r.arrayBuffer());
        const img = await outDoc.embedPng(new Uint8Array(imgBytes));
        const p = outDoc.addPage([viewport.width, viewport.height]);
        p.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height });
        setProgress((i / pdf.numPages) * 100);
      }

      const out = await outDoc.save();
      const blob = new Blob([out.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `grayscale-${file.name}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Converted to grayscale!" });
    } catch (e: any) {
      toast({ title: "Conversion failed", description: e.message, variant: "destructive" });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout toolId="pdf-grayscale" title="PDF Grayscale" description="Convert color PDFs to grayscale.">
      <div className="max-w-2xl mx-auto space-y-6">
        <PDFDropzone onFileSelect={f => { setFile(f); }} isProcessing={processing} />
        {file && !processing && (
          <Button onClick={convert} className="w-full">
            <Download className="w-4 h-4 mr-2" /> Convert to Grayscale
          </Button>
        )}
        {processing && <ProgressBar progress={progress} />}
      </div>
    </ToolLayout>
  );
}
