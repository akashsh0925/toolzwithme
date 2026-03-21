import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PDFDropzone } from "@/components/pdf/PDFDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Download, FileX } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { useToast } from "@/hooks/use-toast";
import { ProgressBar } from "@/components/pdf/ProgressBar";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function PdfRemoveBlankPages() {
  const [file, setFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState(99);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ kept: number; removed: number } | null>(null);
  const { toast } = useToast();

  const process = async () => {
    if (!file) return;
    setProcessing(true); setProgress(0); setResult(null);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const srcDoc = await PDFDocument.load(bytes);
      const keepIndices: number[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width; canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport: vp }).promise;

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let whitePixels = 0;
        const totalPixels = canvas.width * canvas.height;
        for (let p = 0; p < data.length; p += 4) {
          if (data[p] > 250 && data[p + 1] > 250 && data[p + 2] > 250) whitePixels++;
        }
        const whitePct = (whitePixels / totalPixels) * 100;
        if (whitePct < threshold) keepIndices.push(i - 1);
        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      if (keepIndices.length === 0) {
        toast({ title: "All pages blank", description: "Every page appears blank at the current threshold.", variant: "destructive" });
        setProcessing(false);
        return;
      }

      const outDoc = await PDFDocument.create();
      const copied = await outDoc.copyPages(srcDoc, keepIndices);
      copied.forEach(p => outDoc.addPage(p));

      const removed = pdf.numPages - keepIndices.length;
      setResult({ kept: keepIndices.length, removed });

      const out = await outDoc.save();
      const blob = new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `no_blanks_${file.name}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Done", description: `Removed ${removed} blank page(s).` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout title="Remove Blank Pages" toolName="pdf-remove-blank-pages">
      <div className="max-w-2xl mx-auto space-y-6">
        <PDFDropzone onFileSelect={setFile} isProcessing={processing} />
        {file && (
          <Card className="border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Blank threshold: {threshold}% white</Label>
                <Slider value={[threshold]} onValueChange={([v]) => setThreshold(v)} min={80} max={100} step={1} />
                <p className="text-xs text-muted-foreground">Pages with more than {threshold}% white pixels are considered blank.</p>
              </div>
              {processing && <ProgressBar progress={progress} />}
              {result && (
                <p className="text-sm text-primary font-medium">Kept {result.kept} pages, removed {result.removed} blank page(s).</p>
              )}
              <Button onClick={process} disabled={processing} className="w-full">
                <FileX className="w-4 h-4 mr-2" />{processing ? "Scanning…" : "Detect & Remove Blank Pages"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
