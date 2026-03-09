import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Copy, Eye, Code, Columns } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_MD = `# Welcome to Markdown Editor

Write your markdown here and see it rendered live.

## Features

- **Bold**, *italic*, ~~strikethrough~~
- [Links](https://example.com)
- Lists, tables, code blocks

\`\`\`javascript
console.log("Hello, world!");
\`\`\`

> Blockquotes look like this.

| Column A | Column B |
|----------|----------|
| Cell 1   | Cell 2   |
`;

const markdownToHtml = (md: string): string => {
  let html = md;

  // Code blocks (fenced)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre class="bg-secondary rounded-lg p-4 overflow-x-auto my-3 text-sm"><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-secondary px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  // Headers
  html = html.replace(/^######\s+(.*)$/gm, '<h6 class="text-sm font-bold mt-4 mb-1">$1</h6>');
  html = html.replace(/^#####\s+(.*)$/gm, '<h5 class="text-sm font-bold mt-4 mb-1">$1</h5>');
  html = html.replace(/^####\s+(.*)$/gm, '<h4 class="text-base font-bold mt-5 mb-2">$1</h4>');
  html = html.replace(/^###\s+(.*)$/gm, '<h3 class="text-lg font-bold mt-5 mb-2">$1</h3>');
  html = html.replace(/^##\s+(.*)$/gm, '<h2 class="text-xl font-bold mt-6 mb-2 border-b border-border pb-1">$1</h2>');
  html = html.replace(/^#\s+(.*)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>');

  // Blockquotes
  html = html.replace(/^>\s+(.*)$/gm, '<blockquote class="border-l-4 border-primary/40 pl-4 py-1 text-muted-foreground italic my-2">$1</blockquote>');

  // Tables
  html = html.replace(/^\|(.+)\|$/gm, (match) => {
    if (match.match(/^\|[\s-:|]+\|$/)) return ''; // separator row
    const cells = match.split('|').filter(Boolean).map(c => c.trim());
    const cellHtml = cells.map(c => `<td class="border border-border px-3 py-1.5 text-sm">${c}</td>`).join('');
    return `<tr>${cellHtml}</tr>`;
  });
  html = html.replace(/((?:<tr>.*<\/tr>\n?)+)/g, '<table class="border-collapse border border-border my-3 w-full">$1</table>');

  // Bold, italic, strikethrough
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del class="text-muted-foreground">$1</del>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:text-primary/80" target="_blank" rel="noopener">$1</a>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="border-border my-4" />');

  // Unordered list items
  html = html.replace(/^- (.*)$/gm, '<li class="ml-4 list-disc text-sm leading-relaxed">$1</li>');
  html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul class="my-2">$1</ul>');

  // Paragraphs: wrap remaining lines
  html = html.replace(/^(?!<[a-z])((?!\n).+)$/gm, (match) => {
    if (match.trim() === '') return '';
    return `<p class="my-1.5 text-sm leading-relaxed">${match}</p>`;
  });

  return html;
};

const MarkdownEditor = () => {
  const [markdown, setMarkdown] = useState(DEFAULT_MD);
  const [view, setView] = useState<"split" | "edit" | "preview">("split");

  const copyHtml = useCallback(() => {
    navigator.clipboard.writeText(markdownToHtml(markdown));
    toast.success("HTML copied to clipboard");
  }, [markdown]);

  const downloadMd = useCallback(() => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded");
  }, [markdown]);

  const downloadHtml = useCallback(() => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title></head><body>${markdownToHtml(markdown)}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.html";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded");
  }, [markdown]);

  return (
    <ToolLayout title="Markdown Editor" toolName="markdown-editor">
      <div className="flex flex-col h-[calc(100vh-3rem)]">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card/50">
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
            <button
              onClick={() => setView("edit")}
              className={`p-1.5 rounded-md transition-colors ${view === "edit" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("split")}
              className={`p-1.5 rounded-md transition-colors ${view === "split" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("preview")}
              className={`p-1.5 rounded-md transition-colors ${view === "preview" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={copyHtml}>
              <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy HTML
            </Button>
            <Button variant="ghost" size="sm" onClick={downloadHtml}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> HTML
            </Button>
            <Button variant="outline" size="sm" onClick={downloadMd}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> .md
            </Button>
          </div>
        </div>

        {/* Editor / Preview */}
        <div className="flex-1 flex min-h-0">
          {(view === "edit" || view === "split") && (
            <div className={`${view === "split" ? "w-1/2 border-r border-border" : "w-full"} flex flex-col`}>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="flex-1 resize-none bg-background text-foreground font-mono text-sm p-4 focus:outline-none"
                placeholder="Type your markdown here…"
                spellCheck={false}
              />
            </div>
          )}
          {(view === "preview" || view === "split") && (
            <div className={`${view === "split" ? "w-1/2" : "w-full"} overflow-auto p-4`}>
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
              />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default MarkdownEditor;
