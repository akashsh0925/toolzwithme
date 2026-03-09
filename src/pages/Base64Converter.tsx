import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

const Base64Converter = () => {
  const [textInput, setTextInput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [fileDataUri, setFileDataUri] = useState("");

  const convert = useCallback(() => {
    try {
      if (mode === "encode") {
        setTextOutput(btoa(unescape(encodeURIComponent(textInput))));
      } else {
        setTextOutput(decodeURIComponent(escape(atob(textInput))));
      }
    } catch (e: any) {
      toast.error("Invalid input: " + e.message);
    }
  }, [textInput, mode]);

  const handleFile = useCallback(async (f: File) => {
    const reader = new FileReader();
    reader.onload = () => setFileDataUri(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const downloadFromBase64 = useCallback(() => {
    try {
      const match = textInput.match(/^data:([^;]+);base64,(.+)$/);
      let binary: string, mime: string;
      if (match) {
        mime = match[1];
        binary = atob(match[2]);
      } else {
        mime = "application/octet-stream";
        binary = atob(textInput);
      }
      const arr = Uint8Array.from(binary, c => c.charCodeAt(0));
      const blob = new Blob([arr], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "decoded-file"; a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) { toast.error(e.message); }
  }, [textInput]);

  return (
    <ToolLayout title="Base64 Converter" toolName="base64-converter">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">Base64 Converter</h2>
          <p className="text-sm text-muted-foreground">Encode/decode text and files to/from Base64.</p>
        </div>
        <Tabs defaultValue="text" className="space-y-4">
          <TabsList><TabsTrigger value="text">Text</TabsTrigger><TabsTrigger value="file">File → Base64</TabsTrigger></TabsList>
          <TabsContent value="text" className="space-y-4">
            <div className="flex gap-2 items-center">
              <Button variant={mode === "encode" ? "default" : "outline"} size="sm" onClick={() => setMode("encode")}>Encode</Button>
              <Button variant={mode === "decode" ? "default" : "outline"} size="sm" onClick={() => setMode("decode")}>Decode</Button>
              <Button variant="ghost" size="sm" onClick={() => { setMode(m => m === "encode" ? "decode" : "encode"); setTextInput(textOutput); setTextOutput(""); }}>
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </Button>
            </div>
            <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} rows={5}
              placeholder={mode === "encode" ? "Enter text to encode…" : "Paste Base64 to decode…"}
              className="w-full resize-y rounded-lg border border-border bg-background text-foreground font-mono text-sm p-3 focus:outline-none" />
            <div className="flex gap-2">
              <Button onClick={convert} className="flex-1">Convert</Button>
              {mode === "decode" && <Button variant="outline" onClick={downloadFromBase64}><Download className="w-4 h-4 mr-1" /> As File</Button>}
            </div>
            {textOutput && (
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-xs text-muted-foreground">{textOutput.length} chars</span>
                  <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(textOutput); toast.success("Copied"); }}><Copy className="w-3.5 h-3.5" /></Button>
                </div>
                <textarea readOnly value={textOutput} rows={5} className="w-full resize-y rounded-lg border border-border bg-secondary/30 text-foreground font-mono text-sm p-3" />
              </div>
            )}
          </TabsContent>
          <TabsContent value="file" className="space-y-4">
            <div onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }} onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 cursor-pointer"
              onClick={() => { const i = document.createElement("input"); i.type = "file"; i.onchange = () => i.files?.[0] && handleFile(i.files[0]); i.click(); }}>
              <p className="text-sm text-muted-foreground">Drop any file here</p>
            </div>
            {fileDataUri && (
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-xs text-muted-foreground">{fileDataUri.length} chars</span>
                  <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(fileDataUri); toast.success("Copied"); }}><Copy className="w-3.5 h-3.5" /></Button>
                </div>
                <textarea readOnly value={fileDataUri} rows={6} className="w-full rounded-lg border border-border bg-secondary/30 text-foreground font-mono text-xs p-3 break-all" />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ToolLayout>
  );
};
export default Base64Converter;
