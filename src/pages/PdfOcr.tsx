import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Download, ScanSearch, Copy } from "lucide-react";
import { toast } from "sonner";

const LANGUAGES = [
  { value: "eng", label: "English" },
  { value: "spa", label: "Spanish" },
  { value: "fra", label: "French" },
  { value: "deu", label: "German" },
  { value: "por", label: "Portuguese" },
  { value: "ita", label: "Italian" },
  { value: "hin", label: "Hindi" },
  { value: "jpn", label: "Japanese" },
  { value: "chi_sim", label: "Chinese (Simplified)" },
  { value: "ara", label: "Arabic" },
];

async function loadPdfJs() {
  const pdfjsLib = await import(/* @vite-ignore */ 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs');
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';
  return pdfjsLib;
}

async function pdfToImages(file: File): Promise<HTMLCanvasElement[]> {
  const pdfjs = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const canvases: HTMLCanvasElement[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 }); // higher scale = better OCR
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    canvases.push(canvas);
  }

  return canvases;
}

const PdfOcr = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("eng");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [extractedText, setExtractedText] = useState("");

  const handleFile = useCallback((f: File) => {
    const valid = ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/tiff"];
    if (!valid.includes(f.type)) { toast.error("Please select a PDF or image file"); return; }
    setFile(f);
    setExtractedText("");
  }, []);

  const runOcr = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setExtractedText("");

    try {
      const Tesseract = await import("tesseract.js");
      const isPdf = file.type === "application/pdf";
      let allText = "";

      if (isPdf) {
        setStatusMsg("Rendering PDF pages…");
        const canvases = await pdfToImages(file);
        const totalPages = canvases.length;

        for (let i = 0; i < totalPages; i++) {
          setStatusMsg(`OCR on page ${i + 1} of ${totalPages}…`);
          const result = await Tesseract.recognize(canvases[i], language, {
            logger: (m: any) => {
              if (m.status === "recognizing text") {
                const pageProgress = (i + m.progress) / totalPages;
                setProgress(Math.round(pageProgress * 100));
              }
            },
          });
          allText += `--- Page ${i + 1} ---\n${result.data.text}\n\n`;
        }
      } else {
        setStatusMsg("Recognizing text…");
        const result = await Tesseract.recognize(file, language, {
          logger: (m: any) => {
            if (m.status === "recognizing text") {
              setProgress(Math.round(m.progress * 100));
              setStatusMsg(`Recognizing text… ${Math.round(m.progress * 100)}%`);
            }
          },
        });
        allText = result.data.text;
      }

      setExtractedText(allText.trim());
      if (allText.trim().length < 20) {
        toast.info("Very little text found — the document may need a clearer scan.");
      } else {
        toast.success("OCR complete!");
      }
    } catch (e: any) {
      console.error("OCR error:", e);
      toast.error("OCR failed: " + e.message);
    }
    setProcessing(false);
    setProgress(100);
  }, [file, language]);

  const copyText = useCallback(() => {
    navigator.clipboard.writeText(extractedText);
    toast.success("Copied to clipboard");
  }, [extractedText]);

  const downloadText = useCallback(() => {
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ocr-output.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [extractedText]);

  return (
    <ToolLayout title="PDF OCR" toolName="pdf-ocr">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">OCR Text Recognition</h2>
          <p className="text-sm text-muted-foreground">
            Extract text from scanned PDFs or images using Tesseract.js — runs entirely in your browser.
          </p>
        </div>

        <div
          onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => document.getElementById("ocr-input")?.click()}
        >
          <input id="ocr-input" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.tiff" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <ScanSearch className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          {file ? (
            <p className="text-sm text-foreground font-medium">{file.name}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Drop a scanned PDF or image here</p>
          )}
        </div>

        {file && (
          <div className="space-y-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-display text-muted-foreground">Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={runOcr} disabled={processing}>
                <ScanSearch className="w-4 h-4 mr-1.5" />
                {processing ? "Processing…" : "Run OCR"}
              </Button>
            </div>

            {processing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">{statusMsg}</p>
              </div>
            )}
          </div>
        )}

        {extractedText && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-semibold text-foreground">Extracted Text</h3>
              <div className="flex gap-1.5">
                <Button variant="ghost" size="sm" onClick={copyText}>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={downloadText}>
                  <Download className="w-3.5 h-3.5 mr-1" /> .txt
                </Button>
              </div>
            </div>
            <textarea
              readOnly
              value={extractedText}
              className="w-full h-64 resize-y rounded-lg border border-border bg-background text-foreground font-mono text-sm p-3"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfOcr;
