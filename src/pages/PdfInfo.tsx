import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PDFDropzone } from "@/components/pdf/PDFDropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PdfInfoData {
  fileName: string; fileSize: string; pageCount: number;
  title: string; author: string; subject: string; creator: string; producer: string; keywords: string;
  creationDate: string; modDate: string; pdfVersion: string;
  pages: { width: number; height: number; rotation: number }[];
  encrypted: boolean;
}

export default function PdfInfo() {
  const [info, setInfo] = useState<PdfInfoData | null>(null);

  const analyze = async (file: File) => {
    const bytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

    const pages = doc.getPages().map(p => ({
      width: Math.round(p.getWidth()), height: Math.round(p.getHeight()), rotation: p.getRotation().angle,
    }));

    // Try to detect version from raw bytes
    const header = new TextDecoder().decode(new Uint8Array(bytes.slice(0, 20)));
    const versionMatch = header.match(/%PDF-(\d+\.\d+)/);

    setInfo({
      fileName: file.name,
      fileSize: formatSize(file.size),
      pageCount: doc.getPageCount(),
      title: doc.getTitle() || "—",
      author: doc.getAuthor() || "—",
      subject: doc.getSubject() || "—",
      creator: doc.getCreator() || "—",
      producer: doc.getProducer() || "—",
      keywords: doc.getKeywords() || "—",
      creationDate: doc.getCreationDate()?.toLocaleString() || "—",
      modDate: doc.getModificationDate()?.toLocaleString() || "—",
      pdfVersion: versionMatch ? versionMatch[1] : "Unknown",
      pages,
      encrypted: false,
    });
  };

  return (
    <ToolLayout title="PDF Info / Inspector" toolName="pdf-info">
      <div className="max-w-3xl mx-auto space-y-6">
        <PDFDropzone onFileSelect={analyze} />
        {info && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border">
              <CardContent className="pt-6 space-y-2">
                <h3 className="font-semibold text-foreground">File Info</h3>
                <Row label="Name" value={info.fileName} />
                <Row label="Size" value={info.fileSize} />
                <Row label="Pages" value={String(info.pageCount)} />
                <Row label="PDF Version" value={info.pdfVersion} />
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="pt-6 space-y-2">
                <h3 className="font-semibold text-foreground">Metadata</h3>
                <Row label="Title" value={info.title} />
                <Row label="Author" value={info.author} />
                <Row label="Subject" value={info.subject} />
                <Row label="Creator" value={info.creator} />
                <Row label="Producer" value={info.producer} />
                <Row label="Keywords" value={info.keywords} />
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="pt-6 space-y-2">
                <h3 className="font-semibold text-foreground">Dates</h3>
                <Row label="Created" value={info.creationDate} />
                <Row label="Modified" value={info.modDate} />
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="pt-6 space-y-2">
                <h3 className="font-semibold text-foreground">Page Dimensions</h3>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {info.pages.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">Page {i + 1}</Badge>
                      {p.width} × {p.height} pt
                      {p.rotation !== 0 && <span className="text-xs text-primary">↻ {p.rotation}°</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium truncate max-w-[60%] text-right">{value}</span>
    </div>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}
