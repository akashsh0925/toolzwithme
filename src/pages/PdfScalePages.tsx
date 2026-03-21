import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PDFDropzone } from "@/components/pdf/PDFDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Download, Maximize } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { useToast } from "@/hooks/use-toast";
import { ProgressBar } from "@/components/pdf/ProgressBar";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function PdfScalePages() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(100);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const process = async () => {
    if (!file) return;
    setProcessing(true); setProgress(0);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const outDoc = await PDFDocument.create();
      const scaleFactor = scale / 100;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        canvas.width = vp.width; canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport: vp }).promise;

        const imgData = canvas.toDataURL("image/png");
        const img = await outDoc.embedPng(await fetch(imgData).then(r => r.arrayBuffer()));

        // Keep original page dimensions
        const origW = vp.width / 2;
        const origH = vp.height / 2;
        const newPage = outDoc.addPage([origW, origH]);

        const drawW = origW * scaleFactor;
        const drawH = origH * scaleFactor;
        const x = (origW - drawW) / 2;
        const y = (origH - drawH) / 2;

        newPage.drawImage(img, { x, y, width: drawW, height: drawH });
        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      const out = await outDoc.save();
      const blob = new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `scaled_${file.name}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Done", description: `Scaled content to ${scale}%.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout title="Scale Pages" toolName="pdf-scale-pages">
      <div className="max-w-2xl mx-auto space-y-6">
        <PDFDropzone onFileSelect={setFile} isProcessing={processing} />
        {file && (
          <Card className="border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Scale: {scale}%</Label>
                <Slider value={[scale]} onValueChange={([v]) => setScale(v)} min={25} max={200} step={5} />
                <p className="text-xs text-muted-foreground">Scale content up or down while keeping the same page dimensions.</p>
              </div>
              {processing && <ProgressBar progress={progress} />}
              <Button onClick={process} disabled={processing} className="w-full">
                <Maximize className="w-4 h-4 mr-2" />{processing ? "Scaling…" : "Scale & Download"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
