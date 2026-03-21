import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PDFDropzone } from "@/components/pdf/PDFDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Eraser } from "lucide-react";
import { PDFDocument, PDFName, PDFArray } from "pdf-lib";
import { useToast } from "@/hooks/use-toast";

export default function PdfRemoveAnnotations() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [removed, setRemoved] = useState(0);
  const { toast } = useToast();

  const process = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      let count = 0;

      for (const page of doc.getPages()) {
        const annots = page.node.lookup(PDFName.of("Annots"), PDFArray);
        if (annots) {
          count += annots.size();
          page.node.delete(PDFName.of("Annots"));
        }
      }

      setRemoved(count);
      const out = await doc.save();
      const blob = new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `clean_${file.name}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Done", description: `Removed ${count} annotation(s).` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout title="Remove Annotations" toolName="pdf-remove-annotations">
      <div className="max-w-2xl mx-auto space-y-6">
        <PDFDropzone onFileSelect={setFile} />
        {file && (
          <Card className="border-border">
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Strips all annotations (comments, highlights, sticky notes, form fields) from every page.
              </p>
              {removed > 0 && (
                <p className="text-sm text-primary font-medium">{removed} annotation(s) removed from last run.</p>
              )}
              <Button onClick={process} disabled={processing} className="w-full">
                <Eraser className="w-4 h-4 mr-2" />{processing ? "Processing…" : "Remove Annotations & Download"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
