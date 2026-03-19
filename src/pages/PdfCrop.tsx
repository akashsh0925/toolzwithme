import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PDFDropzone } from "@/components/pdf/PDFDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crop, Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useToast } from "@/hooks/use-toast";

export default function PdfCrop() {
  const [file, setFile] = useState<File | null>(null);
  const [margins, setMargins] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleFile = async (f: File) => {
    setFile(f);
    const bytes = await f.arrayBuffer();
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    setPageCount(doc.getPageCount());
  };

  const crop = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

      for (let i = 0; i < doc.getPageCount(); i++) {
        const page = doc.getPage(i);
        const { width, height } = page.getSize();
        page.setCropBox(
          margins.left,
          margins.bottom,
          width - margins.left - margins.right,
          height - margins.top - margins.bottom
        );
      }

      const out = await doc.save();
      const blob = new Blob([out.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `cropped-${file.name}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "PDF cropped successfully!" });
    } catch (e: any) {
      toast({ title: "Crop failed", description: e.message, variant: "destructive" });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout title="PDF Crop" toolName="pdf-crop">
      <div className="max-w-2xl mx-auto space-y-6">
        <PDFDropzone onFileSelect={handleFile} isProcessing={processing} />
        {pageCount > 0 && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">{pageCount} pages — set margin offsets in points (72 pts = 1 inch)</p>
              <div className="grid grid-cols-2 gap-4">
                {(["top", "right", "bottom", "left"] as const).map(side => (
                  <div key={side}>
                    <Label className="capitalize">{side} (pts)</Label>
                    <Input type="number" min={0} value={margins[side]}
                      onChange={e => setMargins(prev => ({ ...prev, [side]: Number(e.target.value) }))}
                      className="mt-1" />
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <div className="w-32 h-40 border-2 border-dashed border-border rounded relative">
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Preview</div>
                  <div className="absolute border-2 border-primary/50 bg-primary/5 rounded"
                    style={{
                      top: `${Math.min(margins.top / 3, 40)}%`,
                      right: `${Math.min(margins.right / 3, 40)}%`,
                      bottom: `${Math.min(margins.bottom / 3, 40)}%`,
                      left: `${Math.min(margins.left / 3, 40)}%`,
                    }} />
                </div>
              </div>
              <Button onClick={crop} disabled={processing} className="w-full">
                <Crop className="w-4 h-4 mr-2" />
                {processing ? "Cropping..." : "Crop PDF"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
