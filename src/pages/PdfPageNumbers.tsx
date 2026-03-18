import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Download, Hash, CheckCircle } from "lucide-react";
import { toast } from "sonner";

type Position = "bottom-center" | "bottom-left" | "bottom-right" | "top-center" | "top-left" | "top-right";

const PdfPageNumbers = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [position, setPosition] = useState<Position>("bottom-center");
  const [startNum, setStartNum] = useState(1);
  const [fontSize, setFontSize] = useState(11);
  const [format, setFormat] = useState<"number" | "of" | "dash">("number");

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { toast.error("Select a PDF"); return; }
    setFile(f); setResult(null);
  };

  const apply = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const total = pages.length;

      pages.forEach((page, idx) => {
        const num = startNum + idx;
        const { width, height } = page.getSize();
        let label = "";
        if (format === "number") label = `${num}`;
        else if (format === "of") label = `${num} of ${total + startNum - 1}`;
        else label = `— ${num} —`;

        const textWidth = font.widthOfTextAtSize(label, fontSize);
        const margin = 36;

        let x: number, y: number;
        if (position.includes("left")) x = margin;
        else if (position.includes("right")) x = width - textWidth - margin;
        else x = (width - textWidth) / 2;

        if (position.startsWith("top")) y = height - margin;
        else y = margin - fontSize;

        page.drawText(label, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
      });

      const newBytes = await doc.save();
      setResult(new Uint8Array(newBytes));
      toast.success(`Added page numbers to ${total} page(s)`);
    } catch (e: any) { toast.error(e.message); }
    setProcessing(false);
  }, [file, position, startNum, fontSize, format]);

  const download = () => {
    if (!result || !file) return;
    const blob = new Blob([result.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = file.name.replace(".pdf", "_numbered.pdf"); a.click();
    URL.revokeObjectURL(url);
  };

  const positions: { value: Position; label: string }[] = [
    { value: "top-left", label: "Top Left" }, { value: "top-center", label: "Top Center" }, { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" }, { value: "bottom-center", label: "Bottom Center" }, { value: "bottom-right", label: "Bottom Right" },
  ];

  return (
    <ToolLayout title="Page Number Stamper" toolName="pdf-page-numbers">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">Page Number Stamper</h2>
          <p className="text-sm text-muted-foreground">Add page numbers with customizable position and format.</p>
        </div>

        <div onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => document.getElementById("pn-input")?.click()}>
          <input id="pn-input" type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          {file ? <p className="text-sm text-foreground font-medium">{file.name}</p> : <p className="text-sm text-muted-foreground">Drop a PDF here</p>}
        </div>

        {file && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-display text-muted-foreground uppercase">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {positions.map(p => (
                  <Button key={p.value} size="sm" variant={position === p.value ? "default" : "outline"} onClick={() => setPosition(p.value)} className="text-xs">
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-display text-muted-foreground uppercase">Format</label>
              <div className="flex gap-2">
                {([
                  { v: "number" as const, l: "1, 2, 3" },
                  { v: "of" as const, l: "1 of 10" },
                  { v: "dash" as const, l: "— 1 —" },
                ]).map(f => (
                  <Button key={f.v} size="sm" variant={format === f.v ? "default" : "outline"} onClick={() => setFormat(f.v)}>{f.l}</Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-display text-muted-foreground uppercase">Start Number</label>
                <Input type="number" min={1} value={startNum} onChange={(e) => setStartNum(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-display text-muted-foreground uppercase">Font Size</label>
                <Input type="number" min={6} max={72} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
              </div>
            </div>

            <Button onClick={apply} disabled={processing} className="w-full">
              <Hash className="w-4 h-4 mr-2" /> {processing ? "Adding…" : "Add Page Numbers"}
            </Button>
          </div>
        )}

        {result && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <CheckCircle className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm font-medium text-foreground flex-1">Numbered PDF ready</p>
            <Button size="sm" onClick={download}><Download className="w-4 h-4 mr-1.5" /> Download</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
export default PdfPageNumbers;
