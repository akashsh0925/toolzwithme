import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Copy, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function contrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const lum = (rgb: [number, number, number]) => {
    const [r, g, b] = rgb.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const l1 = lum(rgb1), l2 = lum(rgb2);
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const ColorConverter = () => {
  const [r, setR] = useState(230);
  const [g, setG] = useState(126);
  const [b, setB] = useState(34);
  const [hexInput, setHexInput] = useState("#e67e22");

  const hex = rgbToHex(r, g, b);
  const hsl = rgbToHsl(r, g, b);
  const contrastBlack = contrastRatio([r, g, b], [0, 0, 0]);
  const contrastWhite = contrastRatio([r, g, b], [255, 255, 255]);

  const updateFromHex = (h: string) => {
    setHexInput(h);
    const rgb = hexToRgb(h);
    if (rgb) { setR(rgb[0]); setG(rgb[1]); setB(rgb[2]); }
  };

  const formats = [
    { label: "HEX", value: hex },
    { label: "RGB", value: `rgb(${r}, ${g}, ${b})` },
    { label: "HSL", value: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)` },
    { label: "CSS", value: `--color: ${hsl[0]} ${hsl[1]}% ${hsl[2]}%;` },
  ];

  // Generate complementary colors
  const complement = rgbToHex(255 - r, 255 - g, 255 - b);

  return (
    <ToolLayout title="Color Converter" toolName="color-converter">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">Color Converter</h2>
          <p className="text-sm text-muted-foreground">Convert between HEX, RGB, HSL with contrast checking.</p>
        </div>
        <div className="flex gap-6 items-start">
          {/* Color preview */}
          <div className="w-32 h-32 rounded-xl border border-border shadow-lg shrink-0" style={{ backgroundColor: hex }} />
          <div className="flex-1 space-y-4">
            <div className="flex gap-2 items-end">
              <div className="space-y-1 flex-1">
                <Label className="text-xs">HEX</Label>
                <Input value={hexInput} onChange={(e) => updateFromHex(e.target.value)} className="font-mono" />
              </div>
              <input type="color" value={hex} onChange={(e) => updateFromHex(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-none" />
            </div>
            {[
              { label: "R", value: r, set: setR },
              { label: "G", value: g, set: setG },
              { label: "B", value: b, set: setB },
            ].map(c => (
              <div key={c.label} className="flex gap-3 items-center">
                <span className="w-4 text-xs font-mono text-muted-foreground">{c.label}</span>
                <Slider value={[c.value]} onValueChange={([v]) => { c.set(v); setHexInput(rgbToHex(c.label === "R" ? v : r, c.label === "G" ? v : g, c.label === "B" ? v : b)); }} min={0} max={255} className="flex-1" />
                <span className="w-8 text-xs font-mono text-right">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Formats */}
        <div className="grid grid-cols-2 gap-2">
          {formats.map(f => (
            <button key={f.label} onClick={() => { navigator.clipboard.writeText(f.value); toast.success("Copied"); }}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors text-left">
              <span className="text-[10px] uppercase text-muted-foreground font-display w-8">{f.label}</span>
              <code className="text-xs font-mono text-foreground flex-1 truncate">{f.value}</code>
              <Copy className="w-3 h-3 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
        {/* Contrast checker */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-border bg-black text-center">
            <p style={{ color: hex }} className="text-sm font-bold">On Black</p>
            <p className="text-xs text-muted-foreground">{contrastBlack.toFixed(1)}:1 {contrastBlack >= 4.5 ? "✓ AA" : contrastBlack >= 3 ? "~ AA Large" : "✗ Fail"}</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-white text-center">
            <p style={{ color: hex }} className="text-sm font-bold">On White</p>
            <p className="text-xs" style={{ color: "#666" }}>{contrastWhite.toFixed(1)}:1 {contrastWhite >= 4.5 ? "✓ AA" : contrastWhite >= 3 ? "~ AA Large" : "✗ Fail"}</p>
          </div>
        </div>
        {/* Complement */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Complement:</span>
          <div className="w-8 h-8 rounded border border-border" style={{ backgroundColor: complement }} />
          <code className="text-xs font-mono">{complement}</code>
        </div>
      </div>
    </ToolLayout>
  );
};
export default ColorConverter;
