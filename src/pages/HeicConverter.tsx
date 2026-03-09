import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Upload, Download, Image, CheckCircle, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface ConvertedFile {
  name: string;
  blob: Blob;
  url: string;
  size: number;
}

const HeicConverter = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<"image/jpeg" | "image/png">("image/jpeg");
  const [quality, setQuality] = useState(0.9);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ConvertedFile[]>([]);

  const handleFiles = useCallback((fileList: FileList) => {
    const heicFiles = Array.from(fileList).filter(
      (f) => f.name.toLowerCase().endsWith(".heic") || f.name.toLowerCase().endsWith(".heif") || f.type === "image/heic" || f.type === "image/heif"
    );
    if (heicFiles.length === 0) {
      toast.error("Please select HEIC/HEIF files");
      return;
    }
    setFiles((prev) => [...prev, ...heicFiles]);
    setResults([]);
  }, []);

  const convert = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress(0);
    const converted: ConvertedFile[] = [];

    try {
      const heic2any = (await import("heic2any")).default;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(Math.round(((i) / files.length) * 100));

        try {
          const result = await heic2any({
            blob: file,
            toType: format,
            quality,
          });

          const blob = Array.isArray(result) ? result[0] : result;
          const ext = format === "image/jpeg" ? "jpg" : "png";
          const name = file.name.replace(/\.heic$/i, "").replace(/\.heif$/i, "") + `.${ext}`;
          const url = URL.createObjectURL(blob);

          converted.push({ name, blob, url, size: blob.size });
        } catch (e: any) {
          toast.error(`Failed to convert ${file.name}: ${e.message}`);
        }
      }

      setResults(converted);
      setProgress(100);
      if (converted.length > 0) toast.success(`Converted ${converted.length} file(s)!`);
    } catch (e: any) {
      toast.error("Conversion failed: " + e.message);
    }
    setProcessing(false);
  }, [files, format, quality]);

  const downloadAll = useCallback(() => {
    results.forEach((r) => {
      const a = document.createElement("a");
      a.href = r.url;
      a.download = r.name;
      a.click();
    });
  }, [results]);

  return (
    <ToolLayout title="HEIC Converter" toolName="heic-converter">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">HEIC to JPG/PNG</h2>
          <p className="text-sm text-muted-foreground">Convert iPhone HEIC photos to standard formats — all in your browser.</p>
        </div>

        <div
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => document.getElementById("heic-input")?.click()}
        >
          <input id="heic-input" type="file" accept=".heic,.heif" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          <Image className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          {files.length > 0 ? (
            <p className="text-sm text-foreground font-medium">{files.length} file(s) selected</p>
          ) : (
            <p className="text-sm text-muted-foreground">Drop HEIC/HEIF files here or click to browse</p>
          )}
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
            {/* File list */}
            <div className="space-y-1.5 max-h-40 overflow-auto">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs p-2 rounded bg-secondary/50">
                  <span className="flex-1 truncate font-mono">{f.name}</span>
                  <span className="text-muted-foreground">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                  <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Options */}
            <div className="flex gap-4 items-end">
              <div className="space-y-1.5">
                <Label className="text-xs">Format</Label>
                <div className="flex gap-1.5">
                  <Button variant={format === "image/jpeg" ? "default" : "outline"} size="sm" onClick={() => setFormat("image/jpeg")}>JPG</Button>
                  <Button variant={format === "image/png" ? "default" : "outline"} size="sm" onClick={() => setFormat("image/png")}>PNG</Button>
                </div>
              </div>
              {format === "image/jpeg" && (
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs">Quality: {Math.round(quality * 100)}%</Label>
                  <Slider value={[quality]} onValueChange={([v]) => setQuality(v)} min={0.1} max={1} step={0.05} />
                </div>
              )}
            </div>

            <Button onClick={convert} disabled={processing} className="w-full">
              {processing ? "Converting…" : `Convert ${files.length} file(s)`}
            </Button>

            {processing && <Progress value={progress} className="h-2" />}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-semibold text-foreground">Converted Files</h3>
              <Button size="sm" onClick={downloadAll}>
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download All
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {results.map((r, i) => (
                <div key={i} className="rounded-lg border border-border bg-card overflow-hidden">
                  <img src={r.url} alt={r.name} className="w-full h-32 object-cover bg-secondary" />
                  <div className="p-2">
                    <p className="text-xs font-mono truncate">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{(r.size / 1024).toFixed(0)} KB</p>
                    <a href={r.url} download={r.name} className="text-xs text-primary hover:underline">Download</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default HeicConverter;
