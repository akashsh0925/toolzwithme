import { useState, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download, PenTool, Type, Image, Trash2, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PdfSignature = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [signatureType, setSignatureType] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState("");

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    setIsDrawing(false);
    if (canvasRef.current) setSignatureDataUrl(canvasRef.current.toDataURL());
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setSignatureDataUrl(null);
  };

  const generateTypedSignature = useCallback(() => {
    if (!typedName.trim()) return;
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext("2d")!;
    ctx.font = "italic 36px 'Georgia', serif";
    ctx.fillStyle = "#1a1a1a";
    ctx.fillText(typedName, 20, 60);
    setSignatureDataUrl(canvas.toDataURL());
  }, [typedName]);

  const applySignature = useCallback(async () => {
    if (!file || !signatureDataUrl) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

      const sigResponse = await fetch(signatureDataUrl);
      const sigBytes = await sigResponse.arrayBuffer();
      const sigImage = await doc.embedPng(new Uint8Array(sigBytes));

      const page = doc.getPage(doc.getPageCount() - 1);
      const { width } = page.getSize();
      const sigWidth = 150;
      const sigHeight = (sigImage.height / sigImage.width) * sigWidth;
      page.drawImage(sigImage, {
        x: width - sigWidth - 50,
        y: 60,
        width: sigWidth,
        height: sigHeight,
      });

      const newBytes = await doc.save();
      setResult(new Uint8Array(newBytes));
      toast.success("Signature applied!");
    } catch (e: any) { toast.error(e.message); }
    setProcessing(false);
  }, [file, signatureDataUrl]);

  const download = () => {
    if (!result || !file) return;
    const blob = new Blob([result.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = file.name.replace(".pdf", "_signed.pdf"); a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout title="PDF Signature" toolName="pdf-signature">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">PDF Signature</h2>
          <p className="text-sm text-muted-foreground">Draw or type a signature and apply it to the last page of your PDF.</p>
        </div>

        <div onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") setFile(f); else if (f) toast.error("Please select a PDF"); }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => document.getElementById("sig-input")?.click()}>
          <input id="sig-input" type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          {file ? <p className="text-sm font-medium text-foreground">{file.name}</p> : <p className="text-sm text-muted-foreground">Drop PDF here</p>}
        </div>

        {file && (
          <>
            <div className="flex gap-2">
              <Button variant={signatureType === "draw" ? "default" : "outline"} size="sm" onClick={() => setSignatureType("draw")}>
                <PenTool className="w-3.5 h-3.5 mr-1.5" /> Draw
              </Button>
              <Button variant={signatureType === "type" ? "default" : "outline"} size="sm" onClick={() => setSignatureType("type")}>
                <Type className="w-3.5 h-3.5 mr-1.5" /> Type
              </Button>
            </div>

            {signatureType === "draw" ? (
              <div className="space-y-2">
                <canvas ref={canvasRef} width={400} height={150}
                  className="w-full border border-border rounded-lg bg-white cursor-crosshair touch-none"
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
                <Button variant="ghost" size="sm" onClick={clearCanvas}><Trash2 className="w-3.5 h-3.5 mr-1" /> Clear</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input placeholder="Type your name…" value={typedName} onChange={(e) => setTypedName(e.target.value)} className="flex-1" />
                <Button onClick={generateTypedSignature} variant="outline">Preview</Button>
              </div>
            )}

            {signatureDataUrl && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                <img src={signatureDataUrl} alt="Signature" className="h-12 object-contain" />
                <Button onClick={applySignature} disabled={processing} className="ml-auto">
                  {processing ? "Applying…" : "Apply to PDF"}
                </Button>
              </div>
            )}
          </>
        )}

        {result && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <CheckCircle className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm font-medium text-foreground flex-1">Signed PDF ready!</p>
            <Button size="sm" onClick={download}><Download className="w-4 h-4 mr-1.5" /> Download</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
export default PdfSignature;
