import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PDFDropzone } from "@/components/pdf/PDFDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Maximize } from "lucide-react";
import { PDFDocument, PageSizes } from "pdf-lib";
import { ProgressBar } from "@/components/pdf/ProgressBar";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const SIZES: Record<string, [number, number]> = {
  "A4 Portrait": [PageSizes.A4[0], PageSizes.A4[1]],
  "A4 Landscape": [PageSizes.A4[1], PageSizes.A4[0]],
  "Letter Portrait": [PageSizes.Letter[0], PageSizes.Letter[1]],
  "Letter Landscape": [PageSizes.Letter[1], PageSizes.Letter[0]],
  "Legal Portrait": [PageSizes.Legal[0], PageSizes.Legal[1]],
  "Legal Landscape": [PageSizes.Legal[1], PageSizes.Legal[0]],
  "A3 Portrait": [PageSizes.A3[0], PageSizes.A3[1]],
  "A3 Landscape": [PageSizes.A3[1], PageSizes.A3[0]],
  "A5 Portrait": [PageSizes.A5[0], PageSizes.A5[1]],
  "A5 Landscape": [PageSizes.A5[1], PageSizes.A5[0]],
};

export default function PdfPageSize() {
  const [file, setFile] = useState<File | null>(null);
  const [targetSize, setTargetSize] = useState("A4 Portrait");
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
      const [targetW, targetH] = SIZES[targetSize];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;

        const imgBytes = await fetch(canvas.toDataURL("image/png")).then(r => r.arrayBuffer());
        const img = await outDoc.embedPng(new Uint8Array(imgBytes));

        const p = outDoc.addPage([targetW, targetH]);
        // Fit image within target page maintaining aspect ratio
        const scaleX = targetW / viewport.width;
        const scaleY = targetH / viewport.height;
        const s = Math.min(scaleX, scaleY);
        const drawW = viewport.width * s;
        const drawH = viewport.height * s;
        p.drawImage(img, {
          x: (targetW - drawW) / 2,
          y: (targetH - drawH) / 2,
          width: drawW, height: drawH,
        });
        setProgress((i / pdf.numPages) * 100);
      }

      const out = await outDoc.save();
      const blob = new Blob([out.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `resized-${file.name}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: `Converted to ${targetSize}!` });
    } catch (e: any) {
      toast({ title: "Conversion failed", description: e.message, variant: "destructive" });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout toolId="pdf-page-size" title="PDF Page Size Converter" description="Convert PDF pages to a different page size.">
      <div className="max-w-2xl mx-auto space-y-6">
        <PDFDropzone onFileSelect={f => setFile(f)} isProcessing={processing} />
        {file && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Target Page Size</Label>
                <Select value={targetSize} onValueChange={setTargetSize}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(SIZES).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={convert} disabled={processing} className="w-full">
                <Maximize className="w-4 h-4 mr-2" />
                {processing ? "Converting..." : "Convert Page Size"}
              </Button>
            </CardContent>
          </Card>
        )}
        {processing && <ProgressBar progress={progress} />}
      </div>
    </ToolLayout>
  );
}
