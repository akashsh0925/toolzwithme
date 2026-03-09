import { useState } from "react";
import { Search } from "lucide-react";

interface BinLookupResult {
  bank?: { name?: string };
  country?: { name?: string; emoji?: string };
  type?: string;
  brand?: string;
}

const BinLookupTab = () => {
  const [bin, setBin] = useState("");
  const [result, setResult] = useState<BinLookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async () => {
    const clean = bin.replace(/\s/g, "");
    if (clean.length < 6) { setError("Enter at least 6 digits"); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`https://lookup.binlist.net/${clean.slice(0, 8)}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("BIN not found");
      setResult(await res.json());
    } catch {
      setError("Could not find BIN info. Try a different number.");
    }
    setLoading(false);
  };

  const fields = result
    ? [
        { label: "Bank", value: result.bank?.name },
        { label: "Country", value: result.country ? `${result.country.emoji || ""} ${result.country.name || ""}`.trim() : undefined },
        { label: "Card Type", value: result.type },
        { label: "Brand", value: result.brand },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground font-display uppercase tracking-wider">
          BIN Number <span className="normal-case text-muted-foreground/60">(first 6-8 digits)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={bin}
            onChange={(e) => setBin(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="414720"
            maxLength={8}
            className="flex-1 bg-secondary border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-mono"
          />
          <button
            onClick={handleLookup}
            disabled={loading || bin.length < 6}
            className="px-5 rounded-xl font-display font-semibold text-sm uppercase tracking-wider bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {loading ? "…" : "Lookup"}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {fields.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {fields.map(
            (f) =>
              f.value && (
                <div key={f.label} className="rounded-xl bg-secondary/50 border border-border p-4 space-y-1">
                  <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{f.label}</p>
                  <p className="text-sm text-foreground font-medium capitalize">{f.value}</p>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
};

export default BinLookupTab;
