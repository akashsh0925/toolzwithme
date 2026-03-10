import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Link2, Shield, Zap } from "lucide-react";
import { PDFDropzone } from "@/components/pdf/PDFDropzone";
import { LinkTable } from "@/components/pdf/LinkTable";
import { ExtractionStats } from "@/components/pdf/ExtractionStats";
import { ActionButtons } from "@/components/pdf/ActionButtons";
import { ProgressBar } from "@/components/pdf/ProgressBar";
import { extractLinksFromPDF, ExtractionResult } from "@/lib/pdf-extractor";
import { toast } from "sonner";

const PdfLinkGenie = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    setSelectedIds(new Set());

    try {
      const extractionResult = await extractLinksFromPDF(file, setProgress);
      setResult(extractionResult);
      if (extractionResult.links.length > 0) {
        toast.success(`Found ${extractionResult.links.length} links!`);
      } else {
        toast.info("No links found in this PDF");
      }
    } catch (error) {
      console.error("Extraction failed:", error);
      toast.error("Failed to extract links from PDF");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setResult(null);
    setProgress(0);
    setSelectedIds(new Set());
  }, []);

  const selectedLinks = result?.links.filter(link => selectedIds.has(link.id)) ?? [];

  return (
    <ToolLayout title="PDF Link Extractor" toolName="pdf-link-genie">
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">PDF Link Extractor</h1>
              <p className="text-sm text-muted-foreground">Extract all links from your PDF files</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {!result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Zap, title: "Instant Extraction", desc: "Get all links in seconds" },
              { icon: Shield, title: "Privacy First", desc: "Everything runs locally" },
              { icon: Link2, title: "Full Details", desc: "URL, title & page number" },
            ].map((feature, i) => (
              <div key={feature.title} className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!result && (
          <section>
            <PDFDropzone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
            {isProcessing && <div className="mt-6"><ProgressBar progress={progress} /></div>}
          </section>
        )}

        {result && (
          <div className="space-y-6">
            <ExtractionStats result={result} />
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-lg font-semibold">Extracted Links</h2>
              <ActionButtons
                links={result.links}
                selectedLinks={selectedLinks}
                fileName={result.fileName}
                onReset={handleReset}
                onClearSelection={() => setSelectedIds(new Set())}
              />
            </div>
            <LinkTable links={result.links} selectedIds={selectedIds} onSelectionChange={setSelectedIds} />
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            🔒 Your files are processed locally and never uploaded to any server
          </p>
        </div>
      </footer>
    </div>
    </ToolLayout>
  );
};

export default PdfLinkGenie;
