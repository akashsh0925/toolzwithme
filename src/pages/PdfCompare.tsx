import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Scale } from "lucide-react";
import { toast } from "sonner";

const PdfCompare = () => {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<{ pagesA: number; pagesB: number; sizeA: number; sizeB: number } | null>(null);

  const compare = async () => {
    if (!fileA || !fileB) return;
    setComparing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const [bytesA, bytesB] = await Promise.all([fileA.arrayBuffer(), fileB.arrayBuffer()]);
      const [docA, docB] = await Promise.all([
        PDFDocument.load(bytesA, { ignoreEncryption: true }),
        PDFDocument.load(bytesB, { ignoreEncryption: true }),
      ]);
      setResult({
        pagesA: docA.getPageCount(), pagesB: docB.getPageCount(),
        sizeA: bytesA.byteLength, sizeB: bytesB.byteLength,
      });
      toast.success("Comparison complete");
    } catch (e: any) { toast.error(e.message); }
    setComparing(false);
  };

  const DropZone = ({ label, file, onFile }: { label: string; file: File | null; onFile: (f: File) => void }) => (
    <div onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && onFile(e.dataTransfer.files[0]); }} onDragOver={(e) => e.preventDefault()}
      className="flex-1 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors cursor-pointer"
      onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = ".pdf"; i.onchange = () => i.files?.[0] && onFile(i.files[0]); i.click(); }}>
      <p className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
      {file ? <p className="text-sm text-foreground font-medium truncate">{file.name}</p> : <Upload className="w-6 h-6 text-muted-foreground mx-auto" />}
    </div>
  );

  return (
    <ToolLayout title="PDF Compare" toolName="pdf-compare">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">PDF Compare</h2>
          <p className="text-sm text-muted-foreground">Compare two PDFs side by side — metadata and structure comparison.</p>
        </div>
        <div className="flex gap-4">
          <DropZone label="Original" file={fileA} onFile={(f) => { setFileA(f); setResult(null); }} />
          <DropZone label="Modified" file={fileB} onFile={(f) => { setFileB(f); setResult(null); }} />
        </div>
        {fileA && fileB && (
          <Button onClick={compare} disabled={comparing} className="w-full">
            <Scale className="w-4 h-4 mr-2" /> {comparing ? "Comparing…" : "Compare PDFs"}
          </Button>
        )}
        {result && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Original", pages: result.pagesA, size: result.sizeA },
              { label: "Modified", pages: result.pagesB, size: result.sizeB },
            ].map(d => (
              <div key={d.label} className="p-4 rounded-lg border border-border bg-card">
                <p className="text-xs font-display text-muted-foreground uppercase">{d.label}</p>
                <p className="text-2xl font-display font-bold text-foreground">{d.pages} <span className="text-sm font-normal text-muted-foreground">pages</span></p>
                <p className="text-sm text-muted-foreground">{(d.size/1024).toFixed(0)} KB</p>
              </div>
            ))}
            <div className="col-span-2 p-3 rounded-lg bg-secondary/50 text-center text-sm text-muted-foreground">
              {result.pagesA === result.pagesB ? "Same page count" : `Page difference: ${Math.abs(result.pagesA - result.pagesB)}`}
              {" · "}
              Size difference: {Math.abs(result.sizeA - result.sizeB) > 1024 ? `${(Math.abs(result.sizeA - result.sizeB)/1024).toFixed(0)} KB` : `${Math.abs(result.sizeA - result.sizeB)} bytes`}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
export default PdfCompare;
