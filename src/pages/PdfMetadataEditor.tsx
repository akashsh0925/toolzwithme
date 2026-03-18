import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Download, FileText, CheckCircle, Save } from "lucide-react";
import { toast } from "sonner";

interface Metadata {
  title: string; author: string; subject: string; keywords: string; creator: string; producer: string;
}

const PdfMetadataEditor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<Metadata>({ title: "", author: "", subject: "", keywords: "", creator: "", producer: "" });
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);

  const handleFile = useCallback(async (f: File) => {
    if (f.type !== "application/pdf") { toast.error("Select a PDF"); return; }
    setFile(f); setResult(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
      setMeta({
        title: doc.getTitle() || "",
        author: doc.getAuthor() || "",
        subject: doc.getSubject() || "",
        keywords: (doc.getKeywords() || ""),
        creator: doc.getCreator() || "",
        producer: doc.getProducer() || "",
      });
    } catch { toast.error("Could not read metadata"); }
  }, []);

  const save = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      doc.setTitle(meta.title);
      doc.setAuthor(meta.author);
      doc.setSubject(meta.subject);
      doc.setKeywords(meta.keywords.split(",").map(k => k.trim()));
      doc.setCreator(meta.creator);
      doc.setProducer(meta.producer);
      const newBytes = await doc.save();
      setResult(new Uint8Array(newBytes));
      toast.success("Metadata updated");
    } catch (e: any) { toast.error(e.message); }
    setProcessing(false);
  }, [file, meta]);

  const download = () => {
    if (!result || !file) return;
    const blob = new Blob([result.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = file.name.replace(".pdf", "_metadata.pdf"); a.click();
    URL.revokeObjectURL(url);
  };

  const update = (key: keyof Metadata, value: string) => setMeta(prev => ({ ...prev, [key]: value }));

  const fields: { key: keyof Metadata; label: string }[] = [
    { key: "title", label: "Title" }, { key: "author", label: "Author" },
    { key: "subject", label: "Subject" }, { key: "keywords", label: "Keywords (comma-separated)" },
    { key: "creator", label: "Creator" }, { key: "producer", label: "Producer" },
  ];

  return (
    <ToolLayout title="PDF Metadata Editor" toolName="pdf-metadata-editor">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">PDF Metadata Editor</h2>
          <p className="text-sm text-muted-foreground">View and edit PDF document properties — title, author, keywords, and more.</p>
        </div>

        <div onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => document.getElementById("meta-input")?.click()}>
          <input id="meta-input" type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          {file ? <p className="text-sm text-foreground font-medium">{file.name}</p> : <p className="text-sm text-muted-foreground">Drop a PDF here</p>}
        </div>

        {file && (
          <div className="space-y-4">
            {fields.map(f => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-xs font-display text-muted-foreground uppercase">{f.label}</label>
                <Input value={meta[f.key]} onChange={(e) => update(f.key, e.target.value)} />
              </div>
            ))}
            <Button onClick={save} disabled={processing} className="w-full">
              <Save className="w-4 h-4 mr-2" /> {processing ? "Saving…" : "Save Metadata"}
            </Button>
          </div>
        )}

        {result && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <CheckCircle className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm font-medium text-foreground flex-1">Updated PDF ready</p>
            <Button size="sm" onClick={download}><Download className="w-4 h-4 mr-1.5" /> Download</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
export default PdfMetadataEditor;
