import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Check, AlertCircle, Minimize2, Maximize2, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

const SAMPLE = `{
  "name": "ToolzWithMe",
  "version": "1.0.0",
  "tools": [
    { "id": 1, "title": "JSON Toolkit", "category": "text" },
    { "id": 2, "title": "Markdown Editor", "category": "text" }
  ],
  "config": {
    "theme": "dark",
    "privacyFirst": true
  }
}`;

const JsonToolkit = () => {
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState(2);

  const validate = useCallback(() => {
    try {
      JSON.parse(input);
      setError(null);
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    }
  }, [input]);

  const format = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indent);
      setOutput(formatted);
      setInput(formatted);
      setError(null);
      toast.success("Formatted");
    } catch (e: any) {
      setError(e.message);
    }
  }, [input, indent]);

  const minify = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setInput(minified);
      setError(null);
      toast.success("Minified");
    } catch (e: any) {
      setError(e.message);
    }
  }, [input]);

  const toCSV = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      if (arr.length === 0) { setOutput(""); return; }
      const keys = Object.keys(arr[0]);
      const header = keys.join(",");
      const rows = arr.map((obj: any) => keys.map((k) => {
        const val = obj[k];
        const str = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
        return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(","));
      const csv = [header, ...rows].join("\n");
      setOutput(csv);
      setError(null);
      toast.success("Converted to CSV");
    } catch (e: any) {
      setError(e.message);
    }
  }, [input]);

  const copyOutput = useCallback(() => {
    navigator.clipboard.writeText(output || input);
    toast.success("Copied");
  }, [output, input]);

  const downloadOutput = useCallback((ext: string) => {
    const blob = new Blob([output || input], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded");
  }, [output, input]);

  // Count stats
  let stats = { keys: 0, depth: 0, size: new Blob([input]).size };
  try {
    const countKeys = (obj: any, d = 0): { keys: number; depth: number } => {
      if (typeof obj !== "object" || obj === null) return { keys: 0, depth: d };
      const ks = Object.keys(obj);
      let maxD = d;
      ks.forEach((k) => {
        const r = countKeys(obj[k], d + 1);
        maxD = Math.max(maxD, r.depth);
      });
      return { keys: ks.length, depth: maxD };
    };
    const p = JSON.parse(input);
    const r = countKeys(p);
    stats.keys = r.keys;
    stats.depth = r.depth;
  } catch {}

  return (
    <ToolLayout title="JSON Toolkit" toolName="json-toolkit">
      <div className="flex flex-col h-[calc(100vh-3rem)]">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-border bg-card/50">
          <Button variant="outline" size="sm" onClick={format}>
            <Maximize2 className="w-3.5 h-3.5 mr-1.5" /> Format
          </Button>
          <Button variant="outline" size="sm" onClick={minify}>
            <Minimize2 className="w-3.5 h-3.5 mr-1.5" /> Minify
          </Button>
          <Button variant="outline" size="sm" onClick={() => { validate() && toast.success("Valid JSON!"); }}>
            <Check className="w-3.5 h-3.5 mr-1.5" /> Validate
          </Button>
          <Button variant="outline" size="sm" onClick={toCSV}>
            <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" /> → CSV
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-mono">
              {stats.size}B · {stats.keys} keys · depth {stats.depth}
            </span>
            <Button variant="ghost" size="sm" onClick={copyOutput}>
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => downloadOutput("json")}>
              <Download className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Error bar */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-destructive/10 text-destructive text-xs font-mono">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              className="flex-1 resize-none bg-background text-foreground font-mono text-sm p-4 focus:outline-none"
              placeholder="Paste your JSON here…"
              spellCheck={false}
            />
          </div>
          {output && output !== input && (
            <div className="w-1/2 border-l border-border flex flex-col">
              <div className="px-3 py-1 border-b border-border bg-secondary/50">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-display">Output</span>
              </div>
              <textarea
                readOnly
                value={output}
                className="flex-1 resize-none bg-background text-foreground font-mono text-sm p-4 focus:outline-none opacity-90"
              />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default JsonToolkit;
