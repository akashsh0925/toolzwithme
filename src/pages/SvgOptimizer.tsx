import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download, Code, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const SvgOptimizer = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFile = useCallback(async (f: File) => {
    if (!f.name.endsWith(".svg")) { toast.error("Please select an SVG file"); return; }
    const text = await f.text();
    setInput(text);
    setFileName(f.name);
    setOutput("");
  }, []);

  const optimize = useCallback(() => {
    if (!input) return;
    let svg = input;
    // Remove comments
    svg = svg.replace(/<!--[\s\S]*?-->/g, "");
    // Remove editor metadata
    svg = svg.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");
    svg = svg.replace(/\s(inkscape|sodipodi|xmlns:inkscape|xmlns:sodipodi|xmlns:rdf|xmlns:cc|xmlns:dc):[^\s=]*="[^"]*"/g, "");
    // Remove empty groups
    svg = svg.replace(/<g\s*>\s*<\/g>/g, "");
    // Minimize whitespace
    svg = svg.replace(/\s+/g, " ").replace(/>\s+</g, "><");
    // Remove unnecessary attributes
    svg = svg.replace(/\s(id|class)="[^"]*"/g, "");
    // Clean up
    svg = svg.trim();
    setOutput(svg);
    const saved = Math.round((1 - svg.length / input.length) * 100);
    toast.success(`Optimized! Saved ${Math.max(0, saved)}%`);
  }, [input]);

  const downloadResult = () => {
    const blob = new Blob([output], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = fileName.replace(".svg", "_opt.svg"); a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout title="SVG Optimizer" toolName="svg-optimizer">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">SVG Optimizer</h2>
          <p className="text-sm text-muted-foreground">Minify and clean SVG files by removing editor metadata and whitespace.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = ".svg"; i.onchange = () => i.files?.[0] && handleFile(i.files[0]); i.click(); }}>
            <Upload className="w-4 h-4 mr-1.5" /> Upload SVG
          </Button>
          <span className="text-xs text-muted-foreground self-center">or paste SVG code below</span>
        </div>
        <textarea value={input} onChange={(e) => { setInput(e.target.value); setOutput(""); }}
          placeholder="Paste SVG code here…"
          className="w-full h-48 resize-y rounded-lg border border-border bg-background text-foreground font-mono text-xs p-3 focus:outline-none" />
        {input && (
          <div className="flex gap-2 items-center">
            <Button onClick={optimize}><Code className="w-4 h-4 mr-1.5" /> Optimize</Button>
            <span className="text-xs text-muted-foreground">{input.length} bytes</span>
          </div>
        )}
        {output && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{output.length} bytes ({Math.round((1 - output.length / input.length) * 100)}% smaller)</span>
              <Button size="sm" onClick={downloadResult}><Download className="w-3.5 h-3.5 mr-1" /> Download</Button>
            </div>
            <textarea readOnly value={output}
              className="w-full h-48 resize-y rounded-lg border border-border bg-secondary/30 text-foreground font-mono text-xs p-3" />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
export default SvgOptimizer;
