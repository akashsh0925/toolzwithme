import { useState } from "react";
import { ExternalLink, Trash2, X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type UrlItem = { url: string; valid: boolean; selected: boolean };

const isValidUrl = (str: string): boolean => {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const MultiUrlOpener = () => {
  const [bulkText, setBulkText] = useState("");
  const [items, setItems] = useState<UrlItem[]>([]);

  const parseLinks = () => {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const parsed: UrlItem[] = lines.map((line) => ({
      url: line,
      valid: isValidUrl(line),
      selected: isValidUrl(line),
    }));
    setItems(parsed);
  };

  const toggleItem = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleAll = () => {
    const validItems = items.filter((i) => i.valid);
    const allSelected = validItems.every((i) => i.selected);
    setItems((prev) =>
      prev.map((item) =>
        item.valid ? { ...item, selected: !allSelected } : item
      )
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const openSelected = () => {
    const selected = items.filter((i) => i.selected && i.valid);
    if (selected.length === 0) {
      toast.error("No links selected");
      return;
    }
    let blocked = 0;
    selected.forEach((item) => {
      const w = window.open(item.url, "_blank", "noopener,noreferrer");
      if (!w || w.closed) blocked++;
    });
    if (blocked > 0) {
      toast.error(
        `${blocked} tab(s) blocked. Please allow popups for this site.`,
        { duration: 5000 }
      );
    } else {
      toast.success(`Opened ${selected.length} link(s)`);
    }
  };

  const selectedCount = items.filter((i) => i.selected && i.valid).length;
  const validCount = items.filter((i) => i.valid).length;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="relative z-10 space-y-10 w-full max-w-xl mx-auto">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
            <ExternalLink className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground">
            Multi<span className="text-primary">URL</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Paste multiple links, select which ones to open, and launch them all
            in new tabs.
          </p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-8 space-y-6 shadow-2xl shadow-primary/5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground font-display uppercase tracking-wider">
              Paste links (one per line)
            </label>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={
                "https://example.com\nhttps://github.com\nhttps://google.com"
              }
              rows={5}
              className="w-full bg-secondary border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-body text-sm resize-none"
            />
          </div>

          <button
            onClick={parseLinks}
            disabled={!bulkText.trim()}
            className="w-full py-3 rounded-xl font-display font-medium text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:brightness-125 disabled:opacity-30 disabled:cursor-not-allowed border border-border"
          >
            Parse Links
          </button>

          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleAll}
                  className="text-xs text-primary hover:underline font-display uppercase tracking-wider"
                >
                  {validCount > 0 &&
                  items.filter((i) => i.valid).every((i) => i.selected)
                    ? "Deselect All"
                    : "Select All"}
                </button>
                <span className="text-xs font-display text-muted-foreground uppercase tracking-wider">
                  {selectedCount} of {validCount} selected
                </span>
                <button
                  onClick={() => setItems([])}
                  className="text-xs text-muted-foreground hover:text-foreground font-display uppercase tracking-wider flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${
                      item.selected && item.valid
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-secondary border border-transparent"
                    }`}
                  >
                    {item.valid ? (
                      <button
                        onClick={() => toggleItem(i)}
                        className="shrink-0"
                      >
                        <CheckCircle2
                          className={`w-4 h-4 transition-colors ${
                            item.selected
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ) : (
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                    )}
                    <span className="truncate flex-1 text-muted-foreground font-mono">
                      {item.url.length > 60
                        ? item.url.slice(0, 60) + "..."
                        : item.url}
                    </span>
                    <button
                      onClick={() => removeItem(i)}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={openSelected}
                disabled={selectedCount === 0}
                className="w-full py-4 rounded-xl font-display font-semibold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                <ExternalLink className="w-4 h-4" />
                Open Selected ({selectedCount})
              </button>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Paste any URLs — one per line. Select which ones to open in new
            tabs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MultiUrlOpener;
