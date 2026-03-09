import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, ImagePlus, Trash2, RotateCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ProcessedImage {
  name: string;
  url: string;
  size: number;
}

const ImageBatch = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(0.85);
  const [resizeMode, setResizeMode] = useState<"none" | "percentage" | "dimensions">("none");
  const [resizePercent, setResizePercent] = useState(50);
  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(600);
  const [rotation, setRotation] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessedImage[]>([]);

  const handleFiles = useCallback((fileList: FileList) => {
    const imgs = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (imgs.length === 0) { toast.error("Please select image files"); return; }
    setFiles((prev) => [...prev, ...imgs]);
    setResults([]);
  }, []);

  const processImages = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress(0);
    const processed: ProcessedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      setProgress(Math.round((i / files.length) * 100));
      const file = files[i];

      try {
        const img = new window.Image();
        const url = URL.createObjectURL(file);
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
        });

        let w = img.naturalWidth;
        let h = img.naturalHeight;

        if (resizeMode === "percentage") {
          w = Math.round(w * resizePercent / 100);
          h = Math.round(h * resizePercent / 100);
        } else if (resizeMode === "dimensions") {
          const ratio = Math.min(resizeWidth / w, resizeHeight / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        const canvas = document.createElement("canvas");

        // Handle rotation
        if (rotation === 90 || rotation === 270) {
          canvas.width = h;
          canvas.height = w;
        } else {
          canvas.width = w;
          canvas.height = h;
        }

        const ctx = canvas.getContext("2d")!;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        if (rotation === 90 || rotation === 270) {
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
        } else {
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
        }
        ctx.restore();

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), outputFormat, quality);
        });

        const ext = outputFormat === "image/jpeg" ? "jpg" : outputFormat === "image/png" ? "png" : "webp";
        const name = file.name.replace(/\.[^.]+$/, "") + `.${ext}`;
        const resultUrl = URL.createObjectURL(blob);

        processed.push({ name, url: resultUrl, size: blob.size });
        URL.revokeObjectURL(url);
      } catch (e: any) {
        toast.error(`Failed: ${file.name}`);
      }
    }

    setResults(processed);
    setProgress(100);
    setProcessing(false);
    if (processed.length > 0) toast.success(`Processed ${processed.length} image(s)!`);
  }, [files, outputFormat, quality, resizeMode, resizePercent, resizeWidth, resizeHeight, rotation]);

  const downloadAll = useCallback(() => {
    results.forEach((r) => {
      const a = document.createElement("a");
      a.href = r.url;
      a.download = r.name;
      a.click();
    });
  }, [results]);

  return (
    <ToolLayout title="Image Batch Processor" toolName="image-batch">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">Batch Image Processor</h2>
          <p className="text-sm text-muted-foreground">Resize, rotate & convert multiple images at once.</p>
        </div>

        <div
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => document.getElementById("batch-input")?.click()}
        >
          <input id="batch-input" type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          <ImagePlus className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          {files.length > 0 ? (
            <p className="text-sm text-foreground font-medium">{files.length} image(s) selected</p>
          ) : (
            <p className="text-sm text-muted-foreground">Drop images here or click to browse</p>
          )}
        </div>

        {files.length > 0 && (
          <>
            {/* File list */}
            <div className="space-y-1 max-h-32 overflow-auto">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs p-1.5 rounded bg-secondary/50">
                  <span className="flex-1 truncate font-mono">{f.name}</span>
                  <span className="text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
                  <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg border border-border bg-card">
              <div className="space-y-1.5">
                <Label className="text-xs">Output Format</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image/jpeg">JPG</SelectItem>
                    <SelectItem value="image/png">PNG</SelectItem>
                    <SelectItem value="image/webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {outputFormat !== "image/png" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Quality: {Math.round(quality * 100)}%</Label>
                  <Slider value={[quality]} onValueChange={([v]) => setQuality(v)} min={0.1} max={1} step={0.05} />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">Resize</Label>
                <Select value={resizeMode} onValueChange={(v) => setResizeMode(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No resize</SelectItem>
                    <SelectItem value="percentage">By percentage</SelectItem>
                    <SelectItem value="dimensions">Fit dimensions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {resizeMode === "percentage" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Scale: {resizePercent}%</Label>
                  <Slider value={[resizePercent]} onValueChange={([v]) => setResizePercent(v)} min={10} max={200} step={5} />
                </div>
              )}

              {resizeMode === "dimensions" && (
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Max W</Label>
                    <Input type="number" value={resizeWidth} onChange={(e) => setResizeWidth(Number(e.target.value))} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Max H</Label>
                    <Input type="number" value={resizeHeight} onChange={(e) => setResizeHeight(Number(e.target.value))} />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">Rotate</Label>
                <div className="flex gap-1.5">
                  {[0, 90, 180, 270].map((a) => (
                    <Button key={a} variant={rotation === a ? "default" : "outline"} size="sm" onClick={() => setRotation(a)}>
                      {a === 0 ? "None" : `${a}°`}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={processImages} disabled={processing} className="w-full">
              {processing ? "Processing…" : `Process ${files.length} image(s)`}
            </Button>

            {processing && <Progress value={progress} className="h-2" />}
          </>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-semibold text-foreground">Results</h3>
              <Button size="sm" onClick={downloadAll}>
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download All
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {results.map((r, i) => (
                <div key={i} className="rounded-lg border border-border bg-card overflow-hidden">
                  <img src={r.url} alt={r.name} className="w-full h-24 object-cover bg-secondary" />
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

export default ImageBatch;
