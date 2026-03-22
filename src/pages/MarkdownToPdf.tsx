import { useState, useCallback, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Eye, FileText, ImagePlus, Upload } from "lucide-react";
import { toast } from "sonner";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const DEFAULT_MD = `# My Document

## Introduction

This is a **Markdown to PDF** converter. Write your content here and download it as a professionally formatted PDF.

## Features

- Headings (H1–H3)
- **Bold** and *italic* text
- Bullet lists and numbered lists
- Blockquotes, horizontal rules, code blocks
- Embedded images via drag & drop or ![alt](url)

## Numbered List Example

1. First item
2. Second item
3. Third item with **bold** text

> This is a blockquote. It will be rendered with a left border in the PDF.

---

### Code Example

\`\`\`
function hello() {
  console.log("Hello, world!");
}
\`\`\`

That's it! Click **Download PDF** to export.
`;

type PageSize = "a4" | "letter" | "legal";
const PAGE_SIZES: Record<PageSize, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  legal: [612, 1008],
};

interface ParsedLine {
  type: "h1" | "h2" | "h3" | "bullet" | "numbered" | "blockquote" | "code" | "hr" | "paragraph" | "blank" | "image";
  text: string;
  number?: number;
  imageUrl?: string;
  altText?: string;
}

const parseMarkdown = (md: string): ParsedLine[] => {
  const lines = md.split("\n");
  const parsed: ParsedLine[] = [];
  let inCode = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCode = !inCode;
      if (inCode) parsed.push({ type: "code", text: "" });
      continue;
    }
    if (inCode) { parsed.push({ type: "code", text: line }); continue; }
    if (line.trim() === "") { parsed.push({ type: "blank", text: "" }); continue; }
    if (line.trim() === "---" || line.trim() === "***") { parsed.push({ type: "hr", text: "" }); continue; }
    if (line.startsWith("### ")) { parsed.push({ type: "h3", text: line.slice(4) }); continue; }
    if (line.startsWith("## ")) { parsed.push({ type: "h2", text: line.slice(3) }); continue; }
    if (line.startsWith("# ")) { parsed.push({ type: "h1", text: line.slice(2) }); continue; }
    if (line.startsWith("- ") || line.startsWith("* ")) { parsed.push({ type: "bullet", text: line.slice(2) }); continue; }
    if (line.startsWith("> ")) { parsed.push({ type: "blockquote", text: line.slice(2) }); continue; }

    // Numbered list: "1. ", "2. ", etc.
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) { parsed.push({ type: "numbered", text: numMatch[2], number: parseInt(numMatch[1]) }); continue; }

    // Image: ![alt](url)
    const imgMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) { parsed.push({ type: "image", text: "", altText: imgMatch[1], imageUrl: imgMatch[2] }); continue; }

    parsed.push({ type: "paragraph", text: line });
  }
  return parsed;
};

const stripFormatting = (text: string): string =>
  text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/~~(.+?)~~/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

const wrapText = (text: string, font: any, fontSize: number, maxWidth: number): string[] => {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    const w = font.widthOfTextAtSize(test, fontSize);
    if (w > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
};

const fetchImageAsBytes = async (url: string): Promise<{ bytes: Uint8Array; type: "png" | "jpg" } | null> => {
  try {
    // Handle data URLs
    if (url.startsWith("data:")) {
      const match = url.match(/^data:image\/(png|jpe?g);base64,(.+)$/i);
      if (!match) return null;
      const binary = atob(match[2]);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return { bytes, type: match[1].toLowerCase().startsWith("png") ? "png" : "jpg" };
    }
    const res = await fetch(url, { mode: "cors" }).catch(() => null);
    if (!res || !res.ok) return null;
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    if (bytes[0] === 0x89 && bytes[1] === 0x50) return { bytes, type: "png" };
    return { bytes, type: "jpg" };
  } catch {
    return null;
  }
};

const MarkdownToPdf = () => {
  const [markdown, setMarkdown] = useState(DEFAULT_MD);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [fileName, setFileName] = useState("document");
  const [generating, setGenerating] = useState(false);
  const [embeddedImages, setEmbeddedImages] = useState<Record<string, string>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const name = file.name.replace(/\s+/g, "-");
        setEmbeddedImages((prev) => ({ ...prev, [name]: dataUrl }));
        setMarkdown((prev) => prev + `\n![${name}](embedded:${name})\n`);
        toast.success(`Image "${name}" embedded`);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleMdFileUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.name.endsWith(".md") && !file.name.endsWith(".markdown") && file.type !== "text/markdown" && file.type !== "text/plain") {
      toast.error("Please upload a .md or .txt file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setMarkdown(reader.result as string);
      setFileName(file.name.replace(/\.(md|markdown|txt)$/, ""));
      toast.success(`Loaded "${file.name}"`);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && (files[0].name.endsWith(".md") || files[0].name.endsWith(".markdown"))) {
      handleMdFileUpload(files);
    } else {
      handleImageUpload(files);
    }
  }, [handleImageUpload, handleMdFileUpload]);

  const generatePdf = useCallback(async () => {
    setGenerating(true);
    try {
      const [pw, ph] = PAGE_SIZES[pageSize];
      const margin = 50;
      const maxW = pw - margin * 2;
      const doc = await PDFDocument.create();
      const regular = await doc.embedFont(StandardFonts.Helvetica);
      const bold = await doc.embedFont(StandardFonts.HelveticaBold);
      const italic = await doc.embedFont(StandardFonts.HelveticaOblique);
      const mono = await doc.embedFont(StandardFonts.Courier);

      let page = doc.addPage([pw, ph]);
      let y = ph - margin;

      const ensureSpace = (needed: number) => {
        if (y - needed < margin) {
          page = doc.addPage([pw, ph]);
          y = ph - margin;
        }
      };

      const drawWrapped = (text: string, font: any, size: number, color: any, indent = 0) => {
        const clean = stripFormatting(text);
        const wrapped = wrapText(clean, font, size, maxW - indent);
        for (const line of wrapped) {
          ensureSpace(size + 4);
          page.drawText(line, { x: margin + indent, y, size, font, color });
          y -= size + 4;
        }
      };

      const parsed = parseMarkdown(markdown);
      const black = rgb(0, 0, 0);
      const gray = rgb(0.3, 0.3, 0.3);
      const lightGray = rgb(0.85, 0.85, 0.85);

      for (const line of parsed) {
        switch (line.type) {
          case "h1":
            y -= 8;
            ensureSpace(28);
            drawWrapped(line.text, bold, 24, black);
            y -= 6;
            break;
          case "h2":
            y -= 6;
            ensureSpace(22);
            drawWrapped(line.text, bold, 18, black);
            page.drawLine({ start: { x: margin, y: y + 2 }, end: { x: pw - margin, y: y + 2 }, thickness: 0.5, color: lightGray });
            y -= 6;
            break;
          case "h3":
            y -= 4;
            ensureSpace(18);
            drawWrapped(line.text, bold, 14, black);
            y -= 4;
            break;
          case "paragraph":
            drawWrapped(line.text, regular, 11, black);
            y -= 2;
            break;
          case "bullet":
            ensureSpace(14);
            page.drawText("\u2022", { x: margin + 8, y, size: 11, font: regular, color: black });
            drawWrapped(line.text, regular, 11, black, 22);
            break;
          case "numbered": {
            ensureSpace(14);
            const numStr = `${line.number}.`;
            page.drawText(numStr, { x: margin + 4, y, size: 11, font: regular, color: black });
            drawWrapped(line.text, regular, 11, black, 22);
            break;
          }
          case "blockquote":
            ensureSpace(16);
            page.drawRectangle({ x: margin, y: y - 2, width: 3, height: 14, color: rgb(0.6, 0.6, 0.6) });
            drawWrapped(line.text, italic, 11, gray, 12);
            y -= 2;
            break;
          case "code":
            if (line.text === "" && parsed.indexOf(line) > 0) {
              y -= 4;
            } else {
              ensureSpace(14);
              page.drawRectangle({ x: margin, y: y - 3, width: maxW, height: 14, color: rgb(0.95, 0.95, 0.95) });
              page.drawText(line.text, { x: margin + 6, y, size: 9, font: mono, color: gray });
              y -= 13;
            }
            break;
          case "image": {
            let imgUrl = line.imageUrl || "";
            // Resolve embedded images
            if (imgUrl.startsWith("embedded:")) {
              const key = imgUrl.slice(9);
              imgUrl = embeddedImages[key] || "";
            }
            if (!imgUrl) { drawWrapped(`[Image: ${line.altText || "missing"}]`, italic, 10, gray); break; }
            try {
              const imgData = await fetchImageAsBytes(imgUrl);
              if (!imgData) { drawWrapped(`[Image failed: ${line.altText || imgUrl}]`, italic, 10, gray); break; }
              const embedded = imgData.type === "png"
                ? await doc.embedPng(imgData.bytes)
                : await doc.embedJpg(imgData.bytes);
              const { width: iw, height: ih } = embedded;
              const scale = Math.min(maxW / iw, 300 / ih, 1);
              const dw = iw * scale;
              const dh = ih * scale;
              ensureSpace(dh + 8);
              page.drawImage(embedded, { x: margin, y: y - dh, width: dw, height: dh });
              y -= dh + 8;
              if (line.altText) {
                drawWrapped(line.altText, italic, 9, gray);
                y -= 2;
              }
            } catch {
              drawWrapped(`[Image error: ${line.altText || imgUrl}]`, italic, 10, gray);
            }
            break;
          }
          case "hr":
            y -= 8;
            ensureSpace(12);
            page.drawLine({ start: { x: margin, y }, end: { x: pw - margin, y }, thickness: 0.5, color: lightGray });
            y -= 12;
            break;
          case "blank":
            y -= 8;
            break;
        }
      }

      const out = await doc.save();
      const blob = new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName || "document"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  }, [markdown, pageSize, fileName, embeddedImages]);

  const wordCount = markdown.trim().split(/\s+/).filter(Boolean).length;
  const imageCount = Object.keys(embeddedImages).length;

  return (
    <ToolLayout title="Markdown to PDF" toolName="markdown-to-pdf">
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Settings bar */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">File name</Label>
            <Input value={fileName} onChange={(e) => setFileName(e.target.value)} className="w-48 h-9" placeholder="document" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Page size</Label>
            <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSize)}>
              <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="a4">A4</SelectItem>
                <SelectItem value="letter">Letter</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Load .md file</Label>
            <Button variant="outline" size="sm" className="h-9" onClick={() => document.getElementById("md-file-input")?.click()}>
              <Upload className="w-4 h-4 mr-1.5" /> Open
            </Button>
            <input id="md-file-input" type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" className="hidden" onChange={(e) => handleMdFileUpload(e.target.files)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Add image</Label>
            <Button variant="outline" size="sm" className="h-9" onClick={() => document.getElementById("md-img-input")?.click()}>
              <ImagePlus className="w-4 h-4 mr-1.5" /> Embed
              {imageCount > 0 && <span className="ml-1.5 text-xs text-muted-foreground">({imageCount})</span>}
            </Button>
            <input id="md-img-input" type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{wordCount} words</span>
            <Button onClick={generatePdf} disabled={generating || !markdown.trim()}>
              <Download className="w-4 h-4 mr-1.5" />
              {generating ? "Generating…" : "Download PDF"}
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[70vh]">
          <div
            className="flex flex-col border border-border rounded-lg overflow-hidden"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-card/50">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Markdown</span>
              <span className="text-xs text-muted-foreground ml-auto">Drop images here</span>
            </div>
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="flex-1 resize-none bg-background text-foreground font-mono text-sm p-4 focus:outline-none"
              placeholder="Type your markdown here…"
              spellCheck={false}
            />
          </div>
          <div className="flex flex-col border border-border rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-card/50">
              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Preview</span>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown, embeddedImages) }}
              />
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

const markdownToHtml = (md: string, embeddedImages: Record<string, string> = {}): string => {
  let html = md;
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, _lang, code) =>
    `<pre class="bg-secondary rounded-lg p-4 overflow-x-auto my-3 text-sm"><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`
  );
  html = html.replace(/`([^`]+)`/g, '<code class="bg-secondary px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
  html = html.replace(/^###\s+(.*)$/gm, '<h3 class="text-lg font-bold mt-5 mb-2">$1</h3>');
  html = html.replace(/^##\s+(.*)$/gm, '<h2 class="text-xl font-bold mt-6 mb-2 border-b border-border pb-1">$1</h2>');
  html = html.replace(/^#\s+(.*)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>');
  html = html.replace(/^>\s+(.*)$/gm, '<blockquote class="border-l-4 border-primary/40 pl-4 py-1 text-muted-foreground italic my-2">$1</blockquote>');
  html = html.replace(/^---$/gm, '<hr class="border-border my-4" />');
  // Images (before bold/italic to avoid conflicts)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    const resolved = url.startsWith("embedded:") ? (embeddedImages[url.slice(9)] || "") : url;
    return `<img src="${resolved}" alt="${alt}" class="max-w-full rounded my-2" />`;
  });
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>');
  // Numbered lists
  html = html.replace(/^(\d+)\.\s+(.*)$/gm, '<li class="ml-4 list-decimal text-sm" value="$1">$2</li>');
  // Bullet lists
  html = html.replace(/^- (.*)$/gm, '<li class="ml-4 list-disc text-sm">$1</li>');
  // Group consecutive <li> into <ul>/<ol>
  html = html.replace(/((?:<li class="ml-4 list-decimal[^>]*>.*<\/li>\n?)+)/g, '<ol class="my-2">$1</ol>');
  html = html.replace(/((?:<li class="ml-4 list-disc[^>]*>.*<\/li>\n?)+)/g, '<ul class="my-2">$1</ul>');
  html = html.replace(/^(?!<[a-z])((?!\n).+)$/gm, (match) => {
    if (match.trim() === '') return '';
    return `<p class="my-1.5 text-sm leading-relaxed">${match}</p>`;
  });
  return html;
};

export default MarkdownToPdf;
