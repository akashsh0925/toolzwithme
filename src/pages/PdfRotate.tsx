import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PDFDropzone } from "@/components/pdf/PDFDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, RotateCw } from "lucide-react";
import { PDFDocument, degrees } from "pdf-lib";
import { useToast } from "@/hooks/use-toast";

export default function PdfRotate() {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState("90");
  const [pageRange, setPageRange] = useState("all");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const rotate = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const pages = doc.getPages();

      const indices = pageRange === "all"
        ? pages.map((_, i) => i)
        : parsePageRange(pageRange, pages.length);

      const deg = parseInt(angle);
      for (const i of indices) {
        if (i >= 0 && i < pages.length) {
          const current = pages[i].getRotation().angle;
          pages[i].setRotation(degrees(current + deg));
        }
      }

      const out = await doc.save();
      const blob = new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `rotated_${file.name}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Done", description: "Pages rotated successfully." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout title="PDF Rotate" toolName="pdf-rotate">
      <div className="max-w-2xl mx-auto space-y-6">
        <PDFDropzone onFileSelect={setFile} isProcessing={processing} />
        {file && (
          <Card className="border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rotation Angle</Label>
                  <Select value={angle} onValueChange={setAngle}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90° Clockwise</SelectItem>
                      <SelectItem value="180">180°</SelectItem>
                      <SelectItem value="270">270° Clockwise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pages</Label>
                  <Input value={pageRange} onChange={e => setPageRange(e.target.value)} placeholder="all or 1,3,5-8" />
                </div>
              </div>
              <Button onClick={rotate} disabled={processing} className="w-full">
                <RotateCw className="w-4 h-4 mr-2" />{processing ? "Rotating…" : "Rotate & Download"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}

function parsePageRange(range: string, total: number): number[] {
  const indices: number[] = [];
  for (const part of range.split(",")) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [s, e] = trimmed.split("-").map(Number);
      for (let i = s; i <= Math.min(e, total); i++) indices.push(i - 1);
    } else {
      const n = parseInt(trimmed);
      if (n >= 1 && n <= total) indices.push(n - 1);
    }
  }
  return indices;
}
