import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileImage, X, GripVertical, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ImageItem {
  id: string; file: File; preview: string;
}

const ImageToPdf = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [pageSize, setPageSize] = useState<"fit" | "a4" | "letter">("a4");

  const addFiles = (files: FileList) => {
    const items = Array.from(files).filter(f => f.type.startsWith("image/")).map(f => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file: f,
      preview: URL.createObjectURL(f),
    }));
    if (items.length === 0) { toast.error("Select image files"); return; }
    setImages(prev => [...prev, ...items]);
    setResult(null);
  };

  const remove = (id: string) => {
    setImages(prev => {
      const item = prev.find(i => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(i => i.id !== id);
    });
    setResult(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  };

  const convert = useCallback(async () => {
    if (images.length === 0) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.create();

      for (const item of images) {
        const bytes = new Uint8Array(await item.file.arrayBuffer());
        let img;
        if (item.file.type === "image/png") {
          img = await doc.embedPng(bytes);
        } else {
          // Convert non-JPEG/PNG to JPEG via canvas
          if (item.file.type !== "image/jpeg" && item.file.type !== "image/jpg") {
            const bitmap = await createImageBitmap(item.file);
            const canvas = document.createElement("canvas");
            canvas.width = bitmap.width; canvas.height = bitmap.height;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(bitmap, 0, 0);
            const blob = await new Promise<Blob>((res) => canvas.toBlob(b => res(b!), "image/jpeg", 0.92));
            const jpgBytes = new Uint8Array(await blob.arrayBuffer());
            img = await doc.embedJpg(jpgBytes);
          } else {
            img = await doc.embedJpg(bytes);
          }
        }

        let pageWidth: number, pageHeight: number;
        if (pageSize === "fit") {
          pageWidth = img.width; pageHeight = img.height;
        } else {
          pageWidth = pageSize === "a4" ? 595.28 : 612;
          pageHeight = pageSize === "a4" ? 841.89 : 792;
        }

        const page = doc.addPage([pageWidth, pageHeight]);

        // Scale image to fit within page with margins
        const margin = pageSize === "fit" ? 0 : 36;
        const maxW = pageWidth - margin * 2;
        const maxH = pageHeight - margin * 2;
        const scale = Math.min(maxW / img.width, maxH / img.height, 1);
        const drawW = img.width * scale;
        const drawH = img.height * scale;

        page.drawImage(img, {
          x: (pageWidth - drawW) / 2,
          y: (pageHeight - drawH) / 2,
          width: drawW,
          height: drawH,
        });
      }

      const pdfBytes = await doc.save();
      setResult(new Uint8Array(pdfBytes));
      toast.success(`Created PDF with ${images.length} page(s)`);
    } catch (e: any) { toast.error(e.message); }
    setProcessing(false);
  }, [images, pageSize]);

  const download = () => {
    if (!result) return;
    const blob = new Blob([result.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = "images_combined.pdf"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout title="Image to PDF" toolName="image-to-pdf">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">Image to PDF</h2>
          <p className="text-sm text-muted-foreground">Combine multiple images into a single PDF. Drag to reorder.</p>
        </div>

        <div onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.multiple = true; i.onchange = () => i.files && addFiles(i.files); i.click(); }}>
          <FileImage className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Drop images or click to browse (PNG, JPG, WebP, etc.)</p>
        </div>

        {images.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              {images.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg border border-border bg-card">
                  <button onClick={() => moveUp(idx)} className="text-muted-foreground hover:text-foreground" title="Move up">
                    <GripVertical className="w-4 h-4" />
                  </button>
                  <img src={item.preview} alt="" className="w-10 h-10 rounded object-cover border border-border" />
                  <p className="text-sm text-foreground flex-1 truncate">{item.file.name}</p>
                  <span className="text-xs text-muted-foreground">{(item.file.size / 1024).toFixed(0)} KB</span>
                  <button onClick={() => remove(item.id)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-display text-muted-foreground uppercase">Page Size</label>
              <div className="flex gap-2">
                {(["a4", "letter", "fit"] as const).map(s => (
                  <Button key={s} size="sm" variant={pageSize === s ? "default" : "outline"} onClick={() => setPageSize(s)} className="capitalize">
                    {s === "fit" ? "Fit to Image" : s.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={convert} disabled={processing} className="w-full">
              <FileImage className="w-4 h-4 mr-2" /> {processing ? "Converting…" : `Create PDF (${images.length} images)`}
            </Button>
          </div>
        )}

        {result && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <CheckCircle className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm font-medium text-foreground flex-1">PDF ready — {(result.length / 1024).toFixed(0)} KB</p>
            <Button size="sm" onClick={download}><Download className="w-4 h-4 mr-1.5" /> Download</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
export default ImageToPdf;
