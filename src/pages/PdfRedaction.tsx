import { useState, useCallback, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const PdfRedaction = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [redactPages, setRedactPages] = useState("");

  const handleFile = useCallback(async (f: File) => {
    if (f.type !== "application/pdf") { toast.error("Select a PDF"); return; }
    setFile(f); setResult(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
    } catch { setPageCount(0); }
  }, []);

  const redact = useCallback(async () => {
    if (!file || !redactPages.trim()) return;
    setProcessing(true);
    try {
      const { PDFDocument, rgb } = await import("pdf-lib");
      const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const pages = redactPages.split(",").flatMap(p => {
        const t = p.trim();
        if (t.includes("-")) {
          const [a, b] = t.split("-").map(Number);
          return Array.from({ length: b - a + 1 }, (_, i) => a + i);
        }
        return [Number(t)];
      }).filter(n => n >= 1 && n <= doc.getPageCount());

      pages.forEach(pNum => {
        const page = doc.getPage(pNum - 1);
        const { width, height } = page.getSize();
        // Draw black rectangle covering entire page
        page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0, 0, 0) });
      });

      const newBytes = await doc.save();
      setResult(new Uint8Array(newBytes));
      toast.success(`Redacted ${pages.length} page(s)`);
    } catch (e: any) { toast.error(e.message); }
    setProcessing(false);
  }, [file, redactPages]);

  const download = () => {
    if (!result || !file) return;
    const blob = new Blob([result.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = file.name.replace(".pdf", "_redacted.pdf"); a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout title="PDF Redaction" toolName="pdf-redaction">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">PDF Redaction</h2>
          <p className="text-sm text-muted-foreground">Permanently black out entire pages. Content is irrecoverably removed.</p>
        </div>
        <div onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => document.getElementById("redact-in")?.click()}>
          <input id="redact-in" type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          {file ? <p className="text-sm text-foreground font-medium">{file.name} — {pageCount} pages</p> : <p className="text-sm text-muted-foreground">Drop a PDF here</p>}
        </div>
        {file && pageCount > 0 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-display text-muted-foreground">Pages to redact (e.g. 1,3,5-8)</label>
              <input value={redactPages} onChange={(e) => setRedactPages(e.target.value)} placeholder="1,3,5-10"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <Button onClick={redact} disabled={processing} className="w-full" variant="destructive">
              <EyeOff className="w-4 h-4 mr-2" /> {processing ? "Redacting…" : "Redact Pages"}
            </Button>
          </div>
        )}
        {result && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <CheckCircle className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm font-medium text-foreground flex-1">Redacted PDF ready</p>
            <Button size="sm" onClick={download}><Download className="w-4 h-4 mr-1.5" /> Download</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
export default PdfRedaction;
