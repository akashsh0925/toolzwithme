import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PDFDropzone } from "@/components/pdf/PDFDropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Scissors } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useToast } from "@/hooks/use-toast";

export default function PdfSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<"range" | "each">("range");
  const [ranges, setRanges] = useState("1-3, 4-6");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleFile = async (f: File) => {
    setFile(f);
    const bytes = await f.arrayBuffer();
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    setPageCount(doc.getPageCount());
  };

  const downloadPdf = (data: Uint8Array, name: string) => {
    const blob = new Blob([data.buffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const split = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });

      if (mode === "each") {
        for (let i = 0; i < src.getPageCount(); i++) {
          const doc = await PDFDocument.create();
          const [page] = await doc.copyPages(src, [i]);
          doc.addPage(page);
          downloadPdf(await doc.save(), `page-${i + 1}.pdf`);
        }
        toast({ title: `Split into ${src.getPageCount()} files` });
      } else {
        const parts = ranges.split(",").map(r => r.trim());
        for (const part of parts) {
          const match = part.match(/^(\d+)\s*-\s*(\d+)$/);
          if (!match) { const single = parseInt(part); if (!isNaN(single)) {
            const doc = await PDFDocument.create();
            const [page] = await doc.copyPages(src, [single - 1]);
            doc.addPage(page);
            downloadPdf(await doc.save(), `page-${single}.pdf`);
          } continue; }
          const start = parseInt(match[1]) - 1;
          const end = parseInt(match[2]) - 1;
          const doc = await PDFDocument.create();
          const indices = Array.from({ length: end - start + 1 }, (_, i) => start + i);
          const pages = await doc.copyPages(src, indices);
          pages.forEach(p => doc.addPage(p));
          downloadPdf(await doc.save(), `pages-${match[1]}-${match[2]}.pdf`);
        }
        toast({ title: "Split complete!" });
      }
    } catch (e: any) {
      toast({ title: "Split failed", description: e.message, variant: "destructive" });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout toolId="pdf-split" title="PDF Split" description="Split a PDF into separate files.">
      <div className="max-w-2xl mx-auto space-y-6">
        <PDFDropzone onFileSelect={handleFile} isProcessing={processing} />
        {pageCount > 0 && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">Total pages: <strong className="text-foreground">{pageCount}</strong></p>
              <Tabs value={mode} onValueChange={v => setMode(v as any)}>
                <TabsList className="w-full">
                  <TabsTrigger value="range" className="flex-1">Custom Ranges</TabsTrigger>
                  <TabsTrigger value="each" className="flex-1">Every Page</TabsTrigger>
                </TabsList>
                <TabsContent value="range" className="mt-4">
                  <Label>Page ranges (e.g. 1-3, 4-6, 8)</Label>
                  <Input value={ranges} onChange={e => setRanges(e.target.value)} placeholder="1-3, 4-6" className="mt-1" />
                </TabsContent>
                <TabsContent value="each" className="mt-4">
                  <p className="text-sm text-muted-foreground">Each page will be saved as a separate PDF.</p>
                </TabsContent>
              </Tabs>
              <Button onClick={split} disabled={processing} className="w-full">
                <Scissors className="w-4 h-4 mr-2" />
                {processing ? "Splitting..." : "Split PDF"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
