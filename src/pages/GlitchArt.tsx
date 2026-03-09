import { useState, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Upload, Download, Sparkles, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const GlitchArt = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [channelShift, setChannelShift] = useState(20);
  const [scanLines, setScanLines] = useState(4);
  const [noise, setNoise] = useState(15);
  const [pixelSort, setPixelSort] = useState(0);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) { toast.error("Select an image"); return; }
    setFile(f);
    const url = URL.createObjectURL(f);
    setImgUrl(url); setResultUrl(null);
  };

  const applyGlitch = useCallback(async () => {
    if (!imgUrl || !canvasRef.current) return;
    const img = new window.Image();
    img.src = imgUrl;
    await new Promise(r => { img.onload = r; });

    const canvas = canvasRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Channel shift (RGB split)
    if (channelShift > 0) {
      const shift = channelShift;
      const copy = new Uint8ClampedArray(data);
      for (let i = 0; i < data.length; i += 4) {
        const shifted = i + shift * 4;
        if (shifted < data.length) { data[i] = copy[shifted]; } // Red channel shift
        const shifted2 = i - shift * 4;
        if (shifted2 >= 0) { data[i + 2] = copy[shifted2 + 2]; } // Blue channel shift
      }
    }

    // Noise
    if (noise > 0) {
      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() < noise / 100) {
          data[i] = Math.min(255, data[i] + (Math.random() - 0.5) * 100);
          data[i + 1] = Math.min(255, data[i + 1] + (Math.random() - 0.5) * 100);
          data[i + 2] = Math.min(255, data[i + 2] + (Math.random() - 0.5) * 100);
        }
      }
    }

    // Scan lines
    if (scanLines > 0) {
      for (let y = 0; y < canvas.height; y += scanLines) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          data[i] = Math.round(data[i] * 0.7);
          data[i + 1] = Math.round(data[i + 1] * 0.7);
          data[i + 2] = Math.round(data[i + 2] * 0.7);
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    setResultUrl(canvas.toDataURL("image/png"));
    toast.success("Glitch applied!");
  }, [imgUrl, channelShift, scanLines, noise]);

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement("a"); a.href = resultUrl;
    a.download = "glitch-art.png"; a.click();
  };

  return (
    <ToolLayout title="Glitch Art Generator" toolName="glitch-art">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">Glitch Art Generator</h2>
          <p className="text-sm text-muted-foreground">Create retro glitch effects on any image.</p>
        </div>
        <div onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.onchange = () => i.files?.[0] && handleFile(i.files[0]); i.click(); }}>
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          {file ? <p className="text-sm font-medium text-foreground">{file.name}</p> : <p className="text-sm text-muted-foreground">Drop an image here</p>}
        </div>

        {imgUrl && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-4 rounded-lg border border-border bg-card">
              <div className="space-y-2"><Label className="text-xs">Channel Shift: {channelShift}px</Label><Slider value={[channelShift]} onValueChange={([v]) => setChannelShift(v)} min={0} max={80} /></div>
              <div className="space-y-2"><Label className="text-xs">Scan Lines: {scanLines}px</Label><Slider value={[scanLines]} onValueChange={([v]) => setScanLines(v)} min={0} max={20} /></div>
              <div className="space-y-2"><Label className="text-xs">Noise: {noise}%</Label><Slider value={[noise]} onValueChange={([v]) => setNoise(v)} min={0} max={50} /></div>
              <Button onClick={applyGlitch} className="w-full"><Sparkles className="w-4 h-4 mr-1.5" /> Apply Glitch</Button>
            </div>
            <div className="space-y-3">
              {resultUrl ? (
                <>
                  <img src={resultUrl} alt="Glitched" className="w-full rounded-lg border border-border" />
                  <Button onClick={download} variant="outline" className="w-full"><Download className="w-4 h-4 mr-1.5" /> Download</Button>
                </>
              ) : (
                <img src={imgUrl} alt="Original" className="w-full rounded-lg border border-border opacity-60" />
              )}
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
};
export default GlitchArt;
