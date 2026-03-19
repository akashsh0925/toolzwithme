import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PDFDropzone } from "@/components/pdf/PDFDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Download, ImageIcon } from "lucide-react";
import { ProgressBar } from "@/components/pdf/ProgressBar";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function PdfToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [scale, setScale] = useState(2);
  const [images, setImages] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const convert = async () => {
    if (!file) return;
    setProcessing(true); setImages([]); setProgress(0);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const results: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        results.push(canvas.toDataURL(format === "jpeg" ? "image/jpeg" : "image/png", 0.92));
        setProgress((i / pdf.numPages) * 100);
      }
      setImages(results);
      toast({ title: `Converted ${results.length} pages to images` });
    } catch (e: any) {
      toast({ title: "Conversion failed", description: e.message, variant: "destructive" });
    } finally { setProcessing(false); }
  };

  const downloadAll = () => {
    images.forEach((src, i) => {
      const a = document.createElement("a");
      a.href = src; a.download = `page-${i + 1}.${format}`; a.click();
    });
  };

  return (
    <ToolLayout toolId="pdf-to-image" title="PDF to Image" description="Convert PDF pages to PNG or JPG images.">
      <div className="max-w-3xl mx-auto space-y-6">
        <PDFDropzone onFileSelect={f => { setFile(f); setImages([]); }} isProcessing={processing} />
        {file && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Format</Label>
                  <Select value={format} onValueChange={v => setFormat(v as any)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Scale: {scale}x</Label>
                  <Slider value={[scale]} onValueChange={v => setScale(v[0])} min={1} max={4} step={0.5} className="mt-3" />
                </div>
              </div>
              <Button onClick={convert} disabled={processing} className="w-full">
                <ImageIcon className="w-4 h-4 mr-2" />
                {processing ? "Converting..." : "Convert to Images"}
              </Button>
            </CardContent>
          </Card>
        )}
        {processing && <ProgressBar progress={progress} />}
        {images.length > 0 && (
          <div className="space-y-4">
            <Button onClick={downloadAll} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" /> Download All ({images.length})
            </Button>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((src, i) => (
                <Card key={i} className="overflow-hidden">
                  <img src={src} alt={`Page ${i + 1}`} className="w-full" />
                  <CardContent className="p-2 text-center text-xs text-muted-foreground">Page {i + 1}</CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
