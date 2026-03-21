import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PDFDropzone } from "@/components/pdf/PDFDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, LayoutGrid } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { useToast } from "@/hooks/use-toast";
import { ProgressBar } from "@/components/pdf/ProgressBar";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const A4_W = 595.28;
const A4_H = 841.89;

export default function PdfNup() {
  const [file, setFile] = useState<File | null>(null);
  const [nup, setNup] = useState("2");
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
      const n = parseInt(nup);
      const { cols, rows } = getGrid(n);
      const cellW = A4_W / cols;
      const cellH = A4_H / rows;

      let currentPage: ReturnType<typeof outDoc.addPage> | null = null;
      let slot = 0;

      for (let i = 1; i <= pdf.numPages; i++) {
        if (slot === 0) {
          currentPage = outDoc.addPage([A4_W, A4_H]);
        }
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });

        const scale = Math.min(cellW / viewport.width, cellH / viewport.height) * 2;
        const sv = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = sv.width; canvas.height = sv.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport: sv }).promise;

        const imgData = canvas.toDataURL("image/png");
        const img = await outDoc.embedPng(await fetch(imgData).then(r => r.arrayBuffer()));

        const col = slot % cols;
        const row = Math.floor(slot / cols);
        const x = col * cellW;
        const y = A4_H - (row + 1) * cellH;

        const fitScale = Math.min(cellW / img.width, cellH / img.height);
        const drawW = img.width * fitScale;
        const drawH = img.height * fitScale;
        const offsetX = x + (cellW - drawW) / 2;
        const offsetY = y + (cellH - drawH) / 2;

        currentPage!.drawImage(img, { x: offsetX, y: offsetY, width: drawW, height: drawH });

        slot++;
        if (slot >= n) slot = 0;
        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      const out = await outDoc.save();
      const blob = new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${n}up_${file.name}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Done", description: `Created ${n}-up layout.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout title="Multi-Page Layout (N-up)" toolName="pdf-nup">
      <div className="max-w-2xl mx-auto space-y-6">
        <PDFDropzone onFileSelect={setFile} isProcessing={processing} />
        {file && (
          <Card className="border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Pages per sheet</Label>
                <Select value={nup} onValueChange={setNup}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2-up (1×2)</SelectItem>
                    <SelectItem value="4">4-up (2×2)</SelectItem>
                    <SelectItem value="6">6-up (2×3)</SelectItem>
                    <SelectItem value="9">9-up (3×3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {processing && <ProgressBar progress={progress} />}
              <Button onClick={process} disabled={processing} className="w-full">
                <LayoutGrid className="w-4 h-4 mr-2" />{processing ? "Processing…" : "Create N-up & Download"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}

function getGrid(n: number) {
  switch (n) {
    case 2: return { cols: 1, rows: 2 };
    case 4: return { cols: 2, rows: 2 };
    case 6: return { cols: 2, rows: 3 };
    case 9: return { cols: 3, rows: 3 };
    default: return { cols: 1, rows: 1 };
  }
}
