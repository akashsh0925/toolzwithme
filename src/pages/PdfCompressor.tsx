import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download, Minimize2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const PdfCompressor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ bytes: Uint8Array; saved: number } | null>(null);
  const [mode, setMode] = useState<"web" | "print" | "max">("web");

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { toast.error("Please select a PDF"); return; }
    setFile(f); setResult(null);
  };

  const compress = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      // Re-save with optimizations (pdf-lib strips unused objects on save)
      const newBytes = await doc.save({
        useObjectStreams: mode !== "print",
        addDefaultPage: false,
      });
      const saved = Math.round((1 - newBytes.length / bytes.byteLength) * 100);
      setResult({ bytes: new Uint8Array(newBytes), saved: Math.max(0, saved) });
      toast.success(`Compressed! ${saved > 0 ? `Saved ${saved}%` : "Already optimized"}`);
    } catch (e: any) { toast.error(e.message); }
    setProcessing(false);
  }, [file, mode]);

  const download = () => {
    if (!result || !file) return;
    const blob = new Blob([result.bytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = file.name.replace(".pdf", "_compressed.pdf"); a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout title="PDF Compressor" toolName="pdf-compressor">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">PDF Compressor</h2>
          <p className="text-sm text-muted-foreground">Reduce PDF file size by optimizing internal structure.</p>
        </div>
        <div onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => document.getElementById("compress-input")?.click()}>
          <input id="compress-input" type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          {file ? <p className="text-sm text-foreground font-medium">{file.name} ({(file.size/1024).toFixed(0)} KB)</p> : <p className="text-sm text-muted-foreground">Drop a PDF here</p>}
        </div>
        {file && (
          <div className="space-y-3">
            <div className="flex gap-2">
              {(["web", "print", "max"] as const).map(m => (
                <Button key={m} variant={mode === m ? "default" : "outline"} size="sm" onClick={() => setMode(m)} className="capitalize">{m === "max" ? "Maximum" : m === "web" ? "Web/Email" : "Print"}</Button>
              ))}
            </div>
            <Button onClick={compress} disabled={processing} className="w-full">
              <Minimize2 className="w-4 h-4 mr-2" /> {processing ? "Compressing…" : "Compress PDF"}
            </Button>
          </div>
        )}
        {result && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <CheckCircle className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Saved {result.saved}%</p>
              <p className="text-xs text-muted-foreground">{(result.bytes.length/1024).toFixed(0)} KB</p>
            </div>
            <Button size="sm" onClick={download}><Download className="w-4 h-4 mr-1.5" /> Download</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
export default PdfCompressor;
