import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Unlock, Upload, Download, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const PdfPasswordRemover = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const unlock = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();

      let pdfDoc;
      try {
        pdfDoc = await PDFDocument.load(bytes, {
          password: password || undefined,
          ignoreEncryption: false,
        });
      } catch (e: any) {
        if (e.message?.includes("password") || e.message?.includes("encrypted")) {
          setError("Incorrect password or unsupported encryption. Please check the password and try again.");
        } else {
          setError(e.message || "Failed to process PDF");
        }
        setProcessing(false);
        return;
      }

      // Re-save without encryption
      const newBytes = await pdfDoc.save();
      setResult(newBytes);
      toast.success("PDF unlocked successfully!");
    } catch (e: any) {
      setError(e.message || "Failed to process PDF");
    }
    setProcessing(false);
  }, [file, password]);

  const downloadResult = useCallback(() => {
    if (!result || !file) return;
    const blob = new Blob([result], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(".pdf", "_unlocked.pdf");
    a.click();
    URL.revokeObjectURL(url);
  }, [result, file]);

  return (
    <ToolLayout title="PDF Password Remover" toolName="pdf-password-remover">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">Remove PDF Password</h2>
          <p className="text-sm text-muted-foreground">
            Decrypt a password-protected PDF. You must know the password to unlock it.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => document.getElementById("pdf-input")?.click()}
        >
          <input
            id="pdf-input"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          {file ? (
            <p className="text-sm text-foreground font-medium">{file.name} ({(file.size / 1024).toFixed(0)} KB)</p>
          ) : (
            <p className="text-sm text-muted-foreground">Drop a PDF here or click to browse</p>
          )}
        </div>

        {file && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">PDF Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter the PDF password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Leave empty if the PDF only has owner restrictions (print/copy disabled).</p>
            </div>

            <Button onClick={unlock} disabled={processing} className="w-full">
              <Unlock className="w-4 h-4 mr-2" />
              {processing ? "Unlocking…" : "Unlock PDF"}
            </Button>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {result && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <CheckCircle className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">PDF unlocked!</p>
              <p className="text-xs text-muted-foreground">{(result.length / 1024).toFixed(0)} KB</p>
            </div>
            <Button size="sm" onClick={downloadResult}>
              <Download className="w-4 h-4 mr-1.5" /> Download
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfPasswordRemover;
