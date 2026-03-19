import { useState, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PDFDropzone } from "@/components/pdf/PDFDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, Stamp, Upload } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useToast } from "@/hooks/use-toast";

const POSITIONS = {
  "Top Left": (pw: number, ph: number, iw: number, ih: number) => ({ x: 20, y: ph - ih - 20 }),
  "Top Center": (pw: number, ph: number, iw: number, ih: number) => ({ x: (pw - iw) / 2, y: ph - ih - 20 }),
  "Top Right": (pw: number, ph: number, iw: number, ih: number) => ({ x: pw - iw - 20, y: ph - ih - 20 }),
  "Center": (pw: number, ph: number, iw: number, ih: number) => ({ x: (pw - iw) / 2, y: (ph - ih) / 2 }),
  "Bottom Left": (_pw: number, _ph: number, _iw: number, _ih: number) => ({ x: 20, y: 20 }),
  "Bottom Center": (pw: number, _ph: number, iw: number, _ih: number) => ({ x: (pw - iw) / 2, y: 20 }),
  "Bottom Right": (pw: number, _ph: number, iw: number, _ih: number) => ({ x: pw - iw - 20, y: 20 }),
};

export default function PdfImageStamp() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [stampImage, setStampImage] = useState<File | null>(null);
  const [stampPreview, setStampPreview] = useState("");
  const [position, setPosition] = useState<string>("Bottom Right");
  const [scale, setScale] = useState(0.3);
  const [opacity, setOpacity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleStampImage = (f: File) => {
    setStampImage(f);
    const reader = new FileReader();
    reader.onload = () => setStampPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const apply = async () => {
    if (!pdfFile || !stampImage) { toast({ title: "Need both PDF and stamp image", variant: "destructive" }); return; }
    setProcessing(true);
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const imgBytes = await stampImage.arrayBuffer();
      const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

      const isPng = stampImage.type === "image/png";
      const img = isPng
        ? await doc.embedPng(new Uint8Array(imgBytes))
        : await doc.embedJpg(new Uint8Array(imgBytes));

      const imgW = img.width * scale;
      const imgH = img.height * scale;
      const posFn = POSITIONS[position as keyof typeof POSITIONS];

      for (let i = 0; i < doc.getPageCount(); i++) {
        const page = doc.getPage(i);
        const { width, height } = page.getSize();
        const { x, y } = posFn(width, height, imgW, imgH);
        page.drawImage(img, { x, y, width: imgW, height: imgH, opacity });
      }

      const out = await doc.save();
      const blob = new Blob([out.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `stamped-${pdfFile.name}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Image stamp applied!" });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout title="PDF Image Stamp" toolName="pdf-image-stamp">
      <div className="max-w-2xl mx-auto space-y-6">
        <PDFDropzone onFileSelect={f => setPdfFile(f)} isProcessing={processing} />
        {pdfFile && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Stamp Image (PNG or JPG)</Label>
                <input ref={imageInput} type="file" accept="image/png,image/jpeg" className="hidden"
                  onChange={e => e.target.files?.[0] && handleStampImage(e.target.files[0])} />
                <Button variant="outline" className="w-full mt-1" onClick={() => imageInput.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  {stampImage ? stampImage.name : "Select stamp image"}
                </Button>
                {stampPreview && (
                  <div className="mt-2 flex justify-center">
                    <img src={stampPreview} alt="Stamp preview" className="max-h-24 rounded border border-border" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Position</Label>
                  <Select value={position} onValueChange={setPosition}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(POSITIONS).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Scale: {Math.round(scale * 100)}%</Label>
                  <Slider value={[scale]} onValueChange={v => setScale(v[0])} min={0.05} max={1} step={0.05} className="mt-3" />
                </div>
              </div>
              <div>
                <Label>Opacity: {Math.round(opacity * 100)}%</Label>
                <Slider value={[opacity]} onValueChange={v => setOpacity(v[0])} min={0.1} max={1} step={0.05} className="mt-2" />
              </div>
              <Button onClick={apply} disabled={processing || !stampImage} className="w-full">
                <Stamp className="w-4 h-4 mr-2" />
                {processing ? "Applying..." : "Apply Stamp"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
