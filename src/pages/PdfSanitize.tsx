import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PDFDropzone } from "@/components/pdf/PDFDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";
import { PDFDocument, PDFName, PDFArray } from "pdf-lib";
import { useToast } from "@/hooks/use-toast";

export default function PdfSanitize() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [opts, setOpts] = useState({ metadata: true, annotations: true, javascript: true });
  const { toast } = useToast();

  const toggle = (key: keyof typeof opts) => setOpts(p => ({ ...p, [key]: !p[key] }));

  const sanitize = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);

      if (opts.metadata) {
        doc.setTitle(""); doc.setAuthor(""); doc.setSubject("");
        doc.setKeywords([]); doc.setCreator(""); doc.setProducer("");
      }

      if (opts.annotations) {
        for (const page of doc.getPages()) {
          page.node.delete(PDFName.of("Annots"));
        }
      }

      if (opts.javascript) {
        const catalog = doc.context.lookup(doc.context.trailerInfo.Root);
        if (catalog && typeof (catalog as any).delete === "function") {
          (catalog as any).delete(PDFName.of("OpenAction"));
          (catalog as any).delete(PDFName.of("AA"));
          (catalog as any).delete(PDFName.of("Names"));
        }
      }

      const out = await doc.save();
      const blob = new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `sanitized_${file.name}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Done", description: "PDF sanitized successfully." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout title="Sanitize PDF" toolName="pdf-sanitize">
      <div className="max-w-2xl mx-auto space-y-6">
        <PDFDropzone onFileSelect={setFile} isProcessing={processing} />
        {file && (
          <Card className="border-border">
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground">Remove hidden data for privacy. Select what to strip:</p>
              {(["metadata", "annotations", "javascript"] as const).map(key => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox id={key} checked={opts[key]} onCheckedChange={() => toggle(key)} />
                  <Label htmlFor={key} className="capitalize">{key === "javascript" ? "JavaScript & Actions" : key === "metadata" ? "Metadata (title, author, etc.)" : "Annotations & Comments"}</Label>
                </div>
              ))}
              <Button onClick={sanitize} disabled={processing} className="w-full">
                <ShieldCheck className="w-4 h-4 mr-2" />{processing ? "Sanitizing…" : "Sanitize & Download"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
