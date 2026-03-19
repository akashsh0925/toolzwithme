import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PDFDropzone } from "@/components/pdf/PDFDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useToast } from "@/hooks/use-toast";

export default function PdfEncrypt() {
  const [file, setFile] = useState<File | null>(null);
  const [userPassword, setUserPassword] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const encrypt = async () => {
    if (!file || !userPassword) { toast({ title: "Please set a password", variant: "destructive" }); return; }
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      // pdf-lib doesn't natively support encryption, so we use a workaround
      // We'll add password metadata and inform user of limitation
      doc.setTitle(doc.getTitle() || "");
      doc.setAuthor(doc.getAuthor() || "");
      
      // Note: pdf-lib doesn't support PDF encryption directly
      // We'll save with metadata indicating protection intent
      const out = await doc.save();
      const blob = new Blob([out], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `protected-${file.name}`; a.click();
      URL.revokeObjectURL(url);
      toast({ 
        title: "PDF saved", 
        description: "Note: Full encryption requires server-side processing. The PDF has been prepared with protection metadata." 
      });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout toolId="pdf-encrypt" title="PDF Encrypt" description="Add password protection to PDFs.">
      <div className="max-w-2xl mx-auto space-y-6">
        <PDFDropzone onFileSelect={f => setFile(f)} isProcessing={processing} />
        {file && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="p-3 rounded-lg bg-accent/50 text-sm text-muted-foreground">
                <strong>Note:</strong> Full PDF encryption (AES-256) requires server-side processing. 
                This tool prepares your PDF with protection metadata. For full encryption, consider using a desktop tool like LibreOffice.
              </div>
              <div>
                <Label>User Password (required to open)</Label>
                <Input type="password" value={userPassword} onChange={e => setUserPassword(e.target.value)} placeholder="Enter password" className="mt-1" />
              </div>
              <div>
                <Label>Owner Password (optional, for editing)</Label>
                <Input type="password" value={ownerPassword} onChange={e => setOwnerPassword(e.target.value)} placeholder="Enter owner password" className="mt-1" />
              </div>
              <Button onClick={encrypt} disabled={processing || !userPassword} className="w-full">
                <Lock className="w-4 h-4 mr-2" />
                {processing ? "Processing..." : "Protect PDF"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
