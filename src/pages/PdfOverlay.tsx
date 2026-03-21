import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Download, Layers } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useToast } from "@/hooks/use-toast";

export default function PdfOverlay() {
  const [baseFile, setBaseFile] = useState<File | null>(null);
  const [overlayFile, setOverlayFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const process = async () => {
    if (!baseFile || !overlayFile) return;
    setProcessing(true);
    try {
      const [baseBytes, overlayBytes] = await Promise.all([baseFile.arrayBuffer(), overlayFile.arrayBuffer()]);
      const baseDoc = await PDFDocument.load(baseBytes);
      const overlayDoc = await PDFDocument.load(overlayBytes);

      const overlayPages = overlayDoc.getPages();
      const basePages = baseDoc.getPages();

      for (let i = 0; i < basePages.length; i++) {
        const overlayIdx = Math.min(i, overlayPages.length - 1);
        const [embedded] = await baseDoc.embedPdf(overlayDoc, [overlayIdx]);
        const page = basePages[i];
        const { width, height } = page.getSize();
        page.drawPage(embedded, { x: 0, y: 0, width, height });
      }

      const out = await baseDoc.save();
      const blob = new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `overlay_${baseFile.name}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Done", description: "Overlay applied successfully." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout title="Overlay PDFs" toolName="pdf-overlay">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-border">
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Layer one PDF on top of another — great for applying letterheads, templates, or watermark PDFs.
            </p>
            <div className="space-y-2">
              <Label>Base PDF (background)</Label>
              <input type="file" accept=".pdf" onChange={e => setBaseFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
            </div>
            <div className="space-y-2">
              <Label>Overlay PDF (foreground)</Label>
              <input type="file" accept=".pdf" onChange={e => setOverlayFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
            </div>
            <Button onClick={process} disabled={processing || !baseFile || !overlayFile} className="w-full">
              <Layers className="w-4 h-4 mr-2" />{processing ? "Processing…" : "Apply Overlay & Download"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}
