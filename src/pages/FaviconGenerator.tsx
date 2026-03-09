import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download, Star, Copy } from "lucide-react";
import { toast } from "sonner";

interface GeneratedFavicon {
  size: number;
  url: string;
}

const FaviconGenerator = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [favicons, setFavicons] = useState<GeneratedFavicon[]>([]);
  const [htmlCode, setHtmlCode] = useState("");

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) { toast.error("Select an image"); return; }
    setFile(f); setImgUrl(URL.createObjectURL(f)); setFavicons([]);
  };

  const generate = useCallback(async () => {
    if (!imgUrl) return;
    const img = new window.Image();
    img.src = imgUrl;
    await new Promise(r => { img.onload = r; });

    const sizes = [16, 32, 48, 64, 128, 180, 192, 512];
    const results: GeneratedFavicon[] = [];

    for (const size of sizes) {
      const canvas = document.createElement("canvas");
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);
      const url = canvas.toDataURL("image/png");
      results.push({ size, url });
    }

    setFavicons(results);
    setHtmlCode(`<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png">`);
    toast.success(`Generated ${results.length} favicon sizes!`);
  }, [imgUrl]);

  return (
    <ToolLayout title="Favicon Generator" toolName="favicon-generator">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">Favicon Generator</h2>
          <p className="text-sm text-muted-foreground">Generate a complete favicon package from any image.</p>
        </div>
        <div onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.onchange = () => i.files?.[0] && handleFile(i.files[0]); i.click(); }}>
          <Star className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              {imgUrl && <img src={imgUrl} className="w-12 h-12 rounded object-cover" />}
              <p className="text-sm font-medium text-foreground">{file.name}</p>
            </div>
          ) : <p className="text-sm text-muted-foreground">Drop an image here (PNG, JPG, SVG)</p>}
        </div>
        {file && (
          <Button onClick={generate} className="w-full"><Star className="w-4 h-4 mr-1.5" /> Generate Favicons</Button>
        )}
        {favicons.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {favicons.map(f => (
                <div key={f.size} className="text-center">
                  <img src={f.url} alt={`${f.size}px`} className="mx-auto border border-border rounded bg-white" style={{ width: Math.min(f.size, 64), height: Math.min(f.size, 64) }} />
                  <p className="text-[10px] text-muted-foreground mt-1">{f.size}px</p>
                  <a href={f.url} download={`favicon-${f.size}x${f.size}.png`} className="text-[10px] text-primary hover:underline">Save</a>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-display text-muted-foreground uppercase">HTML Code</p>
                <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(htmlCode); toast.success("Copied"); }}>
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
              <pre className="text-xs font-mono bg-secondary/50 p-3 rounded-lg overflow-x-auto text-foreground">{htmlCode}</pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
export default FaviconGenerator;
