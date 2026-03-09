import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

const UrlEncoder = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const convert = () => {
    try {
      setOutput(mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input));
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <ToolLayout title="URL Encoder" toolName="url-encoder">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">URL Encoder / Decoder</h2>
          <p className="text-sm text-muted-foreground">Encode or decode URL components.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant={mode === "encode" ? "default" : "outline"} size="sm" onClick={() => setMode("encode")}>Encode</Button>
          <Button variant={mode === "decode" ? "default" : "outline"} size="sm" onClick={() => setMode("decode")}>Decode</Button>
          <Button variant="ghost" size="sm" onClick={() => { setMode(m => m === "encode" ? "decode" : "encode"); setInput(output); setOutput(""); }}>
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </Button>
        </div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={5}
          placeholder={mode === "encode" ? "Enter text or URL to encode…" : "Paste encoded URL to decode…"}
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
export default UrlEncoder;
