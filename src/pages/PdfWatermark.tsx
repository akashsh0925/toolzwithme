import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Download, Droplets, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const PdfWatermark = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.15);
  const [fontSize, setFontSize] = useState(48);
  const [rotation, setRotation] = useState(-45);
  const [position, setPosition] = useState<"center" | "top" | "bottom">("center");

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { toast.error("Select a PDF"); return; }
    setFile(f); setResult(null);
  };

  const apply = useCallback(async () => {
    if (!file || !text.trim()) return;
    setProcessing(true);
    try {
      const { PDFDocument, rgb, degrees, StandardFonts } = await import("pdf-lib");
      const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        let x = (width - textWidth) / 2;
        let y = position === "center" ? height / 2
          : position === "top" ? height - textHeight - 40
          : 40;

        page.drawText(text, {
          x, y, size: fontSize, font,
          color: rgb(0.5, 0.5, 0.5),
          opacity,
          rotate: degrees(rotation),
        });
      }

      const newBytes = await doc.save();
      setResult(new Uint8Array(newBytes));
      toast.success(`Watermark applied to ${pages.length} page(s)`);
    } catch (e: any) { toast.error(e.message); }
    setProcessing(false);
  }, [file, text, opacity, fontSize, rotation, position]);

  const download = () => {
    if (!result || !file) return;
    const blob = new Blob([result.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = file.name.replace(".pdf", "_watermarked.pdf"); a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout title="PDF Watermark" toolName="pdf-watermark">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">PDF Watermark</h2>
          <p className="text-sm text-muted-foreground">Add a text watermark to every page of your PDF.</p>
        </div>

        <div onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => document.getElementById("wm-input")?.click()}>
          <input id="wm-input" type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          {file ? <p className="text-sm text-foreground font-medium">{file.name}</p> : <p className="text-sm text-muted-foreground">Drop a PDF here</p>}
        </div>

        {file && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-display text-muted-foreground uppercase">Watermark Text</label>
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="CONFIDENTIAL" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-display text-muted-foreground uppercase">Opacity</label>
                <Input type="number" min={0.01} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-display text-muted-foreground uppercase">Font Size</label>
                <Input type="number" min={8} max={200} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-display text-muted-foreground uppercase">Rotation (°)</label>
                <Input type="number" min={-180} max={180} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-display text-muted-foreground uppercase">Position</label>
              <div className="flex gap-2">
                {(["top", "center", "bottom"] as const).map(p => (
                  <Button key={p} size="sm" variant={position === p ? "default" : "outline"} onClick={() => setPosition(p)} className="capitalize">{p}</Button>
                ))}
              </div>
            </div>

            <Button onClick={apply} disabled={processing} className="w-full">
              <Droplets className="w-4 h-4 mr-2" /> {processing ? "Applying…" : "Apply Watermark"}
            </Button>
          </div>
        )}

        {result && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <CheckCircle className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm font-medium text-foreground flex-1">Watermarked PDF ready</p>
            <Button size="sm" onClick={download}><Download className="w-4 h-4 mr-1.5" /> Download</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
export default PdfWatermark;
