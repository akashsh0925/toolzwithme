import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Copy, Minimize2, Maximize2 } from "lucide-react";
import { toast } from "sonner";

const CssMinifier = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const minify = () => {
    let css = input;
    css = css.replace(/\/\*[\s\S]*?\*\//g, ""); // comments
    css = css.replace(/\s+/g, " "); // collapse whitespace
    css = css.replace(/\s*([{}:;,>~+])\s*/g, "$1"); // remove space around selectors
    css = css.replace(/;}/g, "}"); // remove last semicolon
    css = css.trim();
    setOutput(css);
    const pct = input.length > 0 ? Math.round((1 - css.length / input.length) * 100) : 0;
    toast.success(`Minified: ${input.length} → ${css.length} bytes (${pct}% smaller)`);
  };

  const beautify = () => {
    let css = input;
    css = css.replace(/\{/g, " {\n  ");
    css = css.replace(/;/g, ";\n  ");
    css = css.replace(/\}/g, "\n}\n\n");
    css = css.replace(/  \n}/g, "\n}");
    css = css.trim();
    setOutput(css);
    toast.success("Beautified");
  };

  return (
    <ToolLayout title="CSS Minifier" toolName="css-minifier">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">CSS Minifier / Beautifier</h2>
          <p className="text-sm text-muted-foreground">Minify or beautify your CSS code.</p>
        </div>
        <textarea value={input} onChange={(e) => { setInput(e.target.value); setOutput(""); }} rows={10}
          placeholder="Paste your CSS here…"
          className="w-full resize-y rounded-lg border border-border bg-background text-foreground font-mono text-sm p-3 focus:outline-none" />
        <div className="flex gap-2">
          <Button onClick={minify} className="flex-1"><Minimize2 className="w-4 h-4 mr-1.5" /> Minify</Button>
          <Button onClick={beautify} variant="outline" className="flex-1"><Maximize2 className="w-4 h-4 mr-1.5" /> Beautify</Button>
        </div>
        {output && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{output.length} bytes</span>
              <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }}><Copy className="w-3.5 h-3.5" /></Button>
            </div>
            <textarea readOnly value={output} rows={10} className="w-full resize-y rounded-lg border border-border bg-secondary/30 text-foreground font-mono text-sm p-3" />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
export default CssMinifier;
