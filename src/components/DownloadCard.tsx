import { useState } from "react";
import { Download, Link, AlertCircle, CheckCircle2, List, LinkIcon, X, Trash2 } from "lucide-react";

const extractFileId = (url: string): string | null => {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
    /^([a-zA-Z0-9_-]{20,})$/,
  ];
  for (const pattern of patterns) {
    const match = url.trim().match(pattern);
    if (match) return match[1];
  }
  return null;
};

type Mode = "single" | "bulk";
type BulkItem = { url: string; fileId: string | null; status: "ready" | "error" };

const DownloadCard = () => {
  const [mode, setMode] = useState<Mode>("single");

  // Single mode
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "ready" | "error">("idle");
  const [fileId, setFileId] = useState<string | null>(null);

  // Bulk mode
  const [bulkText, setBulkText] = useState("");
  const [bulkItems, setBulkItems] = useState<BulkItem[]>([]);

  const handlePaste = (value: string) => {
    setUrl(value);
    if (!value.trim()) {
      setStatus("idle");
      setFileId(null);
      return;
    }
    const id = extractFileId(value);
    if (id) {
      setFileId(id);
      setStatus("ready");
    } else {
      setFileId(null);
      setStatus("error");
    }
  };

  const triggerDownload = (id: string) => {
    const url = `https://drive.google.com/uc?export=download&id=${id}`;
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownload = () => {
    if (!fileId) return;
    triggerDownload(fileId);
  };

  const parseBulkLinks = () => {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const items: BulkItem[] = lines.map((line) => {
      const id = extractFileId(line);
      return { url: line, fileId: id, status: id ? "ready" : "error" };
    });
    setBulkItems(items);
  };

  const removeBulkItem = (index: number) => {
    setBulkItems((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadAll = () => {
    const validItems = bulkItems.filter((i) => i.status === "ready");
    validItems.forEach((item, idx) => {
      setTimeout(() => {
        triggerDownload(item.fileId!);
      }, idx * 700);
    });
  };

  const validCount = bulkItems.filter((i) => i.status === "ready").length;

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="rounded-2xl bg-card border border-border p-8 space-y-6 shadow-2xl shadow-primary/5">
        {/* Mode Toggle */}
        <div className="flex gap-1 bg-secondary rounded-xl p-1">
          <button
            onClick={() => setMode("single")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-display uppercase tracking-wider transition-all ${
              mode === "single"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Single
          </button>
          <button
            onClick={() => setMode("bulk")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-display uppercase tracking-wider transition-all ${
              mode === "bulk"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Bulk
          </button>
        </div>

        {mode === "single" ? (
          <>
            {/* Single Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground font-display uppercase tracking-wider">
                Google Drive Link
              </label>
              <div className="relative">
                <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handlePaste(e.target.value)}
                  placeholder="Paste your Google Drive link here..."
                  className="w-full bg-secondary border border-border rounded-xl py-3.5 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-body text-sm"
                />
              </div>
            </div>

            {status === "ready" && (
              <div className="flex items-center gap-2 text-success text-sm font-display">
                <CheckCircle2 className="w-4 h-4" />
                <span>File ID detected: <span className="opacity-70">{fileId?.slice(0, 20)}...</span></span>
              </div>
            )}
            {status === "error" && (
              <div className="flex items-center gap-2 text-destructive text-sm font-display">
                <AlertCircle className="w-4 h-4" />
                <span>Could not extract file ID from this link</span>
              </div>
            )}

            <button
              onClick={handleDownload}
              disabled={status !== "ready"}
              className="w-full py-4 rounded-xl font-display font-semibold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Download File
            </button>
          </>
        ) : (
          <>
            {/* Bulk Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground font-display uppercase tracking-wider">
                Paste links (one per line)
              </label>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={"https://drive.google.com/file/d/...\nhttps://drive.google.com/file/d/...\nhttps://drive.google.com/file/d/..."}
                rows={5}
                className="w-full bg-secondary border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-body text-sm resize-none"
              />
            </div>

            <button
              onClick={parseBulkLinks}
              disabled={!bulkText.trim()}
              className="w-full py-3 rounded-xl font-display font-medium text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:brightness-125 disabled:opacity-30 disabled:cursor-not-allowed border border-border"
            >
              Parse Links
            </button>

            {/* Parsed Results */}
            {bulkItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display text-muted-foreground uppercase tracking-wider">
                    {validCount} of {bulkItems.length} ready
                  </span>
                  <button
                    onClick={() => setBulkItems([])}
                    className="text-xs text-muted-foreground hover:text-foreground font-display uppercase tracking-wider flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {bulkItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 text-xs"
                    >
                      {item.status === "ready" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                      )}
                      <span className="truncate flex-1 text-muted-foreground font-mono">
                        {item.url.length > 50 ? item.url.slice(0, 50) + "..." : item.url}
                      </span>
                      <button onClick={() => removeBulkItem(i)} className="text-muted-foreground hover:text-foreground shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={downloadAll}
                  disabled={validCount === 0}
                  className="w-full py-4 rounded-xl font-display font-semibold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  Download All ({validCount})
                </button>
              </div>
            )}
          </>
        )}

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Works with publicly shared Google Drive files. {mode === "bulk" && "Paste one link per line."}
        </p>
      </div>
    </div>
  );
};

export default DownloadCard;
