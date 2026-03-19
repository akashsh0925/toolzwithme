import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PDFDropzone } from "@/components/pdf/PDFDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, Type } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useToast } from "@/hooks/use-toast";

export default function PdfHeaderFooter() {
  const [file, setFile] = useState<File | null>(null);
  const [headerText, setHeaderText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [fontSize, setFontSize] = useState(10);
  const [alignment, setAlignment] = useState<"left" | "center" | "right">("center");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const apply = async () => {
    if (!file || (!headerText && !footerText)) { toast({ title: "Enter header or footer text", variant: "destructive" }); return; }
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.Helvetica);

      for (let i = 0; i < doc.getPageCount(); i++) {
        const page = doc.getPage(i);
        const { width, height } = page.getSize();

        const getX = (text: string) => {
          const w = font.widthOfTextAtSize(text, fontSize);
          if (alignment === "left") return 40;
          if (alignment === "right") return width - w - 40;
          return (width - w) / 2;
        };

        // Replace {page} and {total} placeholders
        const resolve = (t: string) => t.replace(/{page}/g, String(i + 1)).replace(/{total}/g, String(doc.getPageCount()));

        if (headerText) {
          const text = resolve(headerText);
          page.drawText(text, { x: getX(text), y: height - 30, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
        }
        if (footerText) {
          const text = resolve(footerText);
          page.drawText(text, { x: getX(text), y: 20, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
        }
      }

      const out = await doc.save();
      const blob = new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `headerfooter-${file.name}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Header/Footer added!" });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout title="PDF Header & Footer" toolName="pdf-header-footer">
      <div className="max-w-2xl mx-auto space-y-6">
        <PDFDropzone onFileSelect={f => setFile(f)} isProcessing={processing} />
        {file && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="p-3 rounded-lg bg-accent/50 text-sm text-muted-foreground">
                Use <code className="bg-muted px-1 rounded">{"{page}"}</code> for page number and <code className="bg-muted px-1 rounded">{"{total}"}</code> for total pages.
              </div>
              <div>
                <Label>Header Text</Label>
                <Input value={headerText} onChange={e => setHeaderText(e.target.value)} placeholder="e.g. Confidential — Page {page} of {total}" className="mt-1" />
              </div>
              <div>
                <Label>Footer Text</Label>
                <Input value={footerText} onChange={e => setFooterText(e.target.value)} placeholder="e.g. © 2026 Company Name" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Alignment</Label>
                  <Select value={alignment} onValueChange={v => setAlignment(v as any)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Font Size: {fontSize}pt</Label>
                  <Slider value={[fontSize]} onValueChange={v => setFontSize(v[0])} min={6} max={24} step={1} className="mt-3" />
                </div>
              </div>
              <Button onClick={apply} disabled={processing} className="w-full">
                <Type className="w-4 h-4 mr-2" />
                {processing ? "Applying..." : "Add Header & Footer"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
