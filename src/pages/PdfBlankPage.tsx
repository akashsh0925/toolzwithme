import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PDFDropzone } from "@/components/pdf/PDFDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FilePlus } from "lucide-react";
import { PDFDocument, PageSizes } from "pdf-lib";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZES = {
  "Match existing": null,
  "A4": PageSizes.A4,
  "Letter": PageSizes.Letter,
  "Legal": PageSizes.Legal,
} as const;

export default function PdfBlankPage() {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<"before" | "after">("after");
  const [pageNum, setPageNum] = useState(1);
  const [count, setCount] = useState(1);
  const [pageSize, setPageSize] = useState<string>("Match existing");
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleFile = async (f: File) => {
    setFile(f);
    const bytes = await f.arrayBuffer();
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    setPageCount(doc.getPageCount());
    setPageNum(1);
  };

  const insertPages = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      
      const insertIndex = position === "after" ? pageNum : pageNum - 1;
      
      for (let i = 0; i < count; i++) {
        const size = PAGE_SIZES[pageSize as keyof typeof PAGE_SIZES];
        if (size) {
          doc.insertPage(insertIndex + i, size);
        } else {
          const refPage = doc.getPage(Math.min(insertIndex, doc.getPageCount() - 1));
          const { width, height } = refPage.getSize();
          doc.insertPage(insertIndex + i, [width, height]);
        }
      }

      const out = await doc.save();
      const blob = new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `with-blanks-${file.name}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: `Inserted ${count} blank page(s)` });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout title="Blank Page Inserter" toolName="pdf-blank-page">
      <div className="max-w-2xl mx-auto space-y-6">
        <PDFDropzone onFileSelect={handleFile} isProcessing={processing} />
        {pageCount > 0 && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">Document has <strong className="text-foreground">{pageCount}</strong> pages</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Position</Label>
                  <Select value={position} onValueChange={v => setPosition(v as any)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">Before page</SelectItem>
                      <SelectItem value="after">After page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Page number</Label>
                  <Input type="number" min={1} max={pageCount} value={pageNum} onChange={e => setPageNum(Number(e.target.value))} className="mt-1" />
                </div>
                <div>
                  <Label>How many blanks</Label>
                  <Input type="number" min={1} max={50} value={count} onChange={e => setCount(Number(e.target.value))} className="mt-1" />
                </div>
                <div>
                  <Label>Page size</Label>
                  <Select value={pageSize} onValueChange={setPageSize}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(PAGE_SIZES).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={insertPages} disabled={processing} className="w-full">
                <FilePlus className="w-4 h-4 mr-2" />
                {processing ? "Inserting..." : "Insert Blank Pages"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
