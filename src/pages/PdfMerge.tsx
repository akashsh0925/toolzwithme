import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, GripVertical, Download, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { PDFDocument } from "pdf-lib";
import { useToast } from "@/hooks/use-toast";

export default function PdfMerge() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const pdfs = Array.from(newFiles).filter(f => f.type === "application/pdf");
    setFiles(prev => [...prev, ...pdfs]);
  }, []);

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  const moveFile = (from: number, to: number) => {
    setFiles(prev => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  const merge = async () => {
    if (files.length < 2) { toast({ title: "Need at least 2 PDFs", variant: "destructive" }); return; }
    setProcessing(true);
    try {
      const merged = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      const out = await merged.save();
      const blob = new Blob([out.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "merged.pdf"; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "PDFs merged successfully!" });
    } catch (e: any) {
      toast({ title: "Merge failed", description: e.message, variant: "destructive" });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout toolId="pdf-merge" title="PDF Merge" description="Combine multiple PDFs into one.">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6">
            <label className={cn(
              "flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
              "border-border hover:border-primary/50 hover:bg-accent/20"
            )}>
              <input type="file" accept=".pdf" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
              <Plus className="w-8 h-8 text-primary mb-2" />
              <p className="text-foreground font-medium">Add PDF files</p>
              <p className="text-sm text-muted-foreground">Select multiple PDFs to merge</p>
            </label>
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card>
            <CardContent className="p-4 space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={i === 0} onClick={() => moveFile(i, i - 1)}>↑</Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={i === files.length - 1} onClick={() => moveFile(i, i + 1)}>↓</Button>
                  </div>
                  <span className="flex-1 text-sm truncate">{f.name}</span>
                  <span className="text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(i)}><X className="w-4 h-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Button onClick={merge} disabled={files.length < 2 || processing} className="w-full">
          <Download className="w-4 h-4 mr-2" />
          {processing ? "Merging..." : `Merge ${files.length} PDFs`}
        </Button>
      </div>
    </ToolLayout>
  );
}
