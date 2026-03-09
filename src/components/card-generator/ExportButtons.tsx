import { Download } from "lucide-react";
import { exportCards, downloadFile, type GeneratedCard } from "@/lib/card-generator";

const ExportButtons = ({ cards }: { cards: GeneratedCard[] }) => {
  if (cards.length === 0) return null;

  const handleExport = (format: 'txt' | 'csv' | 'json') => {
    const content = exportCards(cards, format);
    const mimeTypes = { txt: "text/plain", csv: "text/csv", json: "application/json" };
    downloadFile(content, `cards.${format}`, mimeTypes[format]);
  };

  return (
    <div className="flex items-center gap-2">
      {(["txt", "csv", "json"] as const).map((fmt) => (
        <button
          key={fmt}
          onClick={() => handleExport(fmt)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-secondary/50 text-xs font-display uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
        >
          <Download className="w-3 h-3" />
          {fmt.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default ExportButtons;
