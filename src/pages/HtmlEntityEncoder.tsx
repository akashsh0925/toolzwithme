import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Copy, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

const ENTITIES: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  "©": "&copy;", "®": "&reg;", "™": "&trade;", "€": "&euro;", "£": "&pound;",
  "¥": "&yen;", "—": "&mdash;", "–": "&ndash;", "…": "&hellip;",
  " ": "&nbsp;", "×": "&times;", "÷": "&divide;",
};
const REVERSE: Record<string, string> = Object.fromEntries(Object.entries(ENTITIES).map(([k, v]) => [v, k]));

const HtmlEntityEncoder = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const convert = () => {
    if (mode === "encode") {
      setOutput(input.split("").map(c => ENTITIES[c] || (c.charCodeAt(0) > 127 ? `&#${c.charCodeAt(0)};` : c)).join(""));
    } else {
      let decoded = input;
      Object.entries(REVERSE).forEach(([entity, char]) => {
        decoded = decoded.split(entity).join(char);
      });
      decoded = decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
      decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
      setOutput(decoded);
    }
    toast.success(mode === "encode" ? "Encoded" : "Decoded");
  };

  return (
    <ToolLayout title="HTML Entity Encoder" toolName="html-entity-encoder">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">HTML Entity Encoder</h2>
          <p className="text-sm text-muted-foreground">Convert special characters to/from HTML entities.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant={mode === "encode" ? "default" : "outline"} size="sm" onClick={() => setMode("encode")}>Encode</Button>
          <Button variant={mode === "decode" ? "default" : "outline"} size="sm" onClick={() => setMode("decode")}>Decode</Button>
          <Button variant="ghost" size="sm" onClick={() => { setMode(m => m === "encode" ? "decode" : "encode"); setInput(output); setOutput(""); }}>
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </Button>
        </div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={5}
          placeholder={mode === "encode" ? 'Enter text with special chars: <div class="test">' : "Paste HTML entities: &lt;div&gt;"}
          className="w-full resize-y rounded-lg border border-border bg-background text-foreground font-mono text-sm p-3 focus:outline-none" />
        <Button onClick={convert} className="w-full">Convert</Button>
        {output && (
          <div className="space-y-2">
            <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }}><Copy className="w-3.5 h-3.5" /></Button></div>
            <textarea readOnly value={output} rows={5} className="w-full resize-y rounded-lg border border-border bg-secondary/30 text-foreground font-mono text-sm p-3" />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
export default HtmlEntityEncoder;
