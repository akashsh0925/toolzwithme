import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Trash2, RotateCw, Scissors, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const PdfPageTools = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [deletePages, setDeletePages] = useState("");
  const [extractPages, setExtractPages] = useState("");
  const [rotatePages, setRotatePages] = useState("");
  const [rotateAngle, setRotateAngle] = useState(90);

  const handleFile = useCallback(async (f: File) => {
    if (f.type !== "application/pdf") { toast.error("Please select a PDF"); return; }
    setFile(f);
    setResult(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
    } catch { setPageCount(0); }
  }, []);

  const parseRanges = (input: string, max: number): number[] => {
    const pages = new Set<number>();
    input.split(",").forEach((part) => {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [a, b] = trimmed.split("-").map(Number);
        for (let i = Math.max(1, a); i <= Math.min(max, b); i++) pages.add(i);
      } else {
        const n = Number(trimmed);
        if (n >= 1 && n <= max) pages.add(n);
      }
    });
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleDelete = useCallback(async () => {
    if (!file || !deletePages.trim()) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const toDelete = parseRanges(deletePages, doc.getPageCount());
      // Delete from end to preserve indices
      for (const p of toDelete.reverse()) doc.removePage(p - 1);
      setResult(new Uint8Array(await doc.save()));
      toast.success(`Deleted ${toDelete.length} page(s)`);
    } catch (e: any) { toast.error(e.message); }
    setProcessing(false);
  }, [file, deletePages]);

  const handleExtract = useCallback(async () => {
    if (!file || !extractPages.trim()) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();
      const toExtract = parseRanges(extractPages, src.getPageCount());
      const copied = await newDoc.copyPages(src, toExtract.map(p => p - 1));
      copied.forEach(p => newDoc.addPage(p));
      setResult(await newDoc.save());
      toast.success(`Extracted ${toExtract.length} page(s)`);
    } catch (e: any) { toast.error(e.message); }
    setProcessing(false);
  }, [file, extractPages]);

  const handleRotate = useCallback(async () => {
    if (!file || !rotatePages.trim()) return;
    setProcessing(true);
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const toRotate = parseRanges(rotatePages, doc.getPageCount());
      toRotate.forEach(p => {
        const page = doc.getPage(p - 1);
        page.setRotation(degrees(page.getRotation().angle + rotateAngle));
      });
      setResult(await doc.save());
      toast.success(`Rotated ${toRotate.length} page(s)`);
    } catch (e: any) { toast.error(e.message); }
    setProcessing(false);
  }, [file, rotatePages, rotateAngle]);

  const downloadResult = useCallback(() => {
    if (!result || !file) return;
    const blob = new Blob([result], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(".pdf", "_edited.pdf");
    a.click();
    URL.revokeObjectURL(url);
  }, [result, file]);

  return (
    <ToolLayout title="PDF Page Tools" toolName="pdf-page-tools">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">PDF Page Tools</h2>
          <p className="text-sm text-muted-foreground">Delete, extract, or rotate pages in your PDF.</p>
        </div>

        {/* Drop zone */}
        <div
          onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => document.getElementById("pdf-page-input")?.click()}
        >
          <input id="pdf-page-input" type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          {file ? (
            <p className="text-sm text-foreground font-medium">{file.name} — {pageCount} pages</p>
          ) : (
            <p className="text-sm text-muted-foreground">Drop a PDF here or click to browse</p>
          )}
        </div>

        {file && pageCount > 0 && (
          <Tabs defaultValue="delete" className="space-y-4">
            <TabsList className="w-full">
              <TabsTrigger value="delete" className="flex-1"><Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete</TabsTrigger>
              <TabsTrigger value="extract" className="flex-1"><Scissors className="w-3.5 h-3.5 mr-1.5" /> Extract</TabsTrigger>
              <TabsTrigger value="rotate" className="flex-1"><RotateCw className="w-3.5 h-3.5 mr-1.5" /> Rotate</TabsTrigger>
            </TabsList>

            <TabsContent value="delete" className="space-y-3">
              <div className="space-y-2">
                <Label>Pages to delete</Label>
                <Input placeholder="e.g. 1,3,5-10" value={deletePages} onChange={(e) => setDeletePages(e.target.value)} />
                <p className="text-xs text-muted-foreground">Use commas and ranges. Total: {pageCount} pages.</p>
              </div>
              <Button onClick={handleDelete} disabled={processing} className="w-full">
                {processing ? "Processing…" : "Delete Pages"}
              </Button>
            </TabsContent>

            <TabsContent value="extract" className="space-y-3">
              <div className="space-y-2">
                <Label>Pages to extract</Label>
                <Input placeholder="e.g. 1-5,8,12" value={extractPages} onChange={(e) => setExtractPages(e.target.value)} />
                <p className="text-xs text-muted-foreground">Creates a new PDF with only the selected pages.</p>
              </div>
              <Button onClick={handleExtract} disabled={processing} className="w-full">
                {processing ? "Processing…" : "Extract Pages"}
              </Button>
            </TabsContent>

            <TabsContent value="rotate" className="space-y-3">
              <div className="space-y-2">
                <Label>Pages to rotate</Label>
                <Input placeholder="e.g. 1-3,5" value={rotatePages} onChange={(e) => setRotatePages(e.target.value)} />
              </div>
              <div className="flex gap-2">
                {[90, 180, 270].map((a) => (
                  <Button key={a} variant={rotateAngle === a ? "default" : "outline"} size="sm" onClick={() => setRotateAngle(a)}>
                    {a}°
                  </Button>
                ))}
              </div>
              <Button onClick={handleRotate} disabled={processing} className="w-full">
                {processing ? "Processing…" : "Rotate Pages"}
              </Button>
            </TabsContent>
          </Tabs>
        )}

        {result && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <CheckCircle className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">PDF ready!</p>
              <p className="text-xs text-muted-foreground">{(result.length / 1024).toFixed(0)} KB</p>
            </div>
            <Button size="sm" onClick={downloadResult}>
              <Download className="w-4 h-4 mr-1.5" /> Download
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfPageTools;
