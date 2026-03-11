import { useState, useMemo } from "react";
import { Copy, Download, Link2, Trash2 } from "lucide-react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ExtractedLink {
  id: string;
  url: string;
}

const URL_REGEX = /https?:\/\/[^\s<>"'`)\]},;]+/gi;

function extractLinks(text: string): ExtractedLink[] {
  const matches = text.match(URL_REGEX);
  if (!matches) return [];
  const seen = new Set<string>();
  return matches
    .map((url) => url.replace(/[.)]+$/, "")) // trim trailing punctuation
    .filter((url) => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    })
    .map((url, i) => ({ id: `${i}`, url }));
}

function exportToCSV(links: ExtractedLink[], fileName: string) {
  const header = "URL\n";
  const rows = links.map((l) => `"${l.url.replace(/"/g, '""')}"`).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

const LinkExtractor = () => {
  const [input, setInput] = useState("");
  const links = useMemo(() => extractLinks(input), [input]);

  const handleCopyAll = async () => {
    if (links.length === 0) return;
    await navigator.clipboard.writeText(links.map((l) => l.url).join("\n"));
    toast.success(`${links.length} link(s) copied`);
  };

  const handleExport = () => {
    if (links.length === 0) return;
    exportToCSV(links, "extracted-links.csv");
    toast.success("CSV downloaded");
  };

  return (
    <ToolLayout title="Link Extractor" toolName="link-extractor">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
            Link Extractor
          </h1>
          <p className="text-sm text-muted-foreground">
            Paste any text containing URLs and instantly extract, copy, or export all links.
          </p>
        </div>

        <Textarea
          placeholder="Paste your text here — all links will be extracted automatically…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[180px] font-mono text-sm"
        />

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground font-medium">
            {links.length} link{links.length !== 1 ? "s" : ""} found
          </span>

          <Button onClick={handleCopyAll} variant="secondary" className="gap-2" disabled={links.length === 0}>
            <Copy className="w-4 h-4" /> Copy All
          </Button>
          <Button onClick={handleExport} className="gap-2" disabled={links.length === 0}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button
            onClick={() => { setInput(""); toast.info("Cleared"); }}
            variant="outline"
            className="gap-2 ml-auto"
            disabled={!input}
          >
            <Trash2 className="w-4 h-4" /> Clear
          </Button>
        </div>

        {/* Results */}
        {links.length > 0 && (
          <div className="rounded-lg border border-border bg-card overflow-hidden divide-y divide-border">
            {links.map((link, idx) => (
              <div
                key={link.id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors"
              >
                <span className="text-xs text-muted-foreground font-mono w-6 text-right shrink-0">
                  {idx + 1}
                </span>
                <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate font-mono"
                  title={link.url}
                >
                  {link.url}
                </a>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(link.url);
                    toast.success("Copied");
                  }}
                  className="ml-auto p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground shrink-0"
                  title="Copy link"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default LinkExtractor;
