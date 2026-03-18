import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download, Layers, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const PdfFlatten = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { toast.error("Select a PDF"); return; }
    setFile(f); setResult(null);
  };

  const flatten = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const form = doc.getForm();

      // Flatten all form fields — makes them non-editable
      form.flatten();

      const newBytes = await doc.save();
      setResult(new Uint8Array(newBytes));
      toast.success("PDF flattened — form fields are now static");
    } catch (e: any) {
      // If no form exists, just re-save
      if (e.message?.includes("no form")) {
        try {
          const { PDFDocument } = await import("pdf-lib");
          const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
          const newBytes = await doc.save();
          setResult(new Uint8Array(newBytes));
          toast.info("No form fields found — PDF re-saved");
        } catch (e2: any) { toast.error(e2.message); }
      } else {
        toast.error(e.message);
      }
    }
    setProcessing(false);
  }, [file]);

  const download = () => {
    if (!result || !file) return;
    const blob = new Blob([result.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = file.name.replace(".pdf", "_flattened.pdf"); a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout title="PDF Flatten" toolName="pdf-flatten">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">PDF Flatten</h2>
          <p className="text-sm text-muted-foreground">Flatten form fields and annotations — makes them permanent and non-editable.</p>
        </div>

        <div onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => document.getElementById("flat-input")?.click()}>
          <input id="flat-input" type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          {file ? <p className="text-sm text-foreground font-medium">{file.name} ({(file.size / 1024).toFixed(0)} KB)</p> : <p className="text-sm text-muted-foreground">Drop a PDF here</p>}
        </div>

        {file && (
          <Button onClick={flatten} disabled={processing} className="w-full">
            <Layers className="w-4 h-4 mr-2" /> {processing ? "Flattening…" : "Flatten PDF"}
          </Button>
        )}

        {result && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <CheckCircle className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Flattened PDF ready</p>
              <p className="text-xs text-muted-foreground">{(result.length / 1024).toFixed(0)} KB</p>
            </div>
            <Button size="sm" onClick={download}><Download className="w-4 h-4 mr-1.5" /> Download</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
export default PdfFlatten;
