import { getBinInfo } from "@/lib/card-generator";
import type { CardNetwork } from "@/lib/card-generator";
import { useState, useEffect, useRef } from "react";

const networkColors: Record<CardNetwork, string> = {
  visa: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  mastercard: "bg-red-500/15 text-red-400 border-red-500/30",
  amex: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  discover: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  unknown: "bg-muted text-muted-foreground border-border",
};

interface BinLookupData {
  bank?: { name?: string };
  country?: { name?: string; emoji?: string };
  type?: string;
  brand?: string;
}

const BinInfoBadge = ({ bin }: { bin: string }) => {
  const info = getBinInfo(bin);
  const [lookup, setLookup] = useState<BinLookupData | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLookup(null);
    if (bin.replace(/\s/g, "").length < 6) return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://lookup.binlist.net/${bin.replace(/\s/g, "").slice(0, 8)}`, {
          headers: { Accept: "application/json" },
        });
        if (res.ok) setLookup(await res.json());
      } catch {
        /* ignore */
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(timerRef.current);
  }, [bin]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-display font-semibold uppercase tracking-wider border ${networkColors[info.network]}`}
        >
          {info.label}
        </span>
        <span className="text-[10px] text-muted-foreground font-display">
          {info.cardLength} digits · {info.cvvLength}-digit CVV
        </span>
      </div>

      {loading && <p className="text-[10px] text-muted-foreground animate-pulse">Looking up BIN…</p>}

      {lookup && (
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {lookup.bank?.name && (
            <div className="rounded-lg bg-secondary/50 border border-border px-3 py-2">
              <p className="text-muted-foreground text-[9px] uppercase tracking-wider">Bank</p>
              <p className="text-foreground font-medium truncate">{lookup.bank.name}</p>
            </div>
          )}
          {lookup.country?.name && (
            <div className="rounded-lg bg-secondary/50 border border-border px-3 py-2">
              <p className="text-muted-foreground text-[9px] uppercase tracking-wider">Country</p>
              <p className="text-foreground font-medium">{lookup.country.emoji} {lookup.country.name}</p>
            </div>
          )}
          {lookup.type && (
            <div className="rounded-lg bg-secondary/50 border border-border px-3 py-2">
              <p className="text-muted-foreground text-[9px] uppercase tracking-wider">Type</p>
              <p className="text-foreground font-medium capitalize">{lookup.type}</p>
            </div>
          )}
          {lookup.brand && (
            <div className="rounded-lg bg-secondary/50 border border-border px-3 py-2">
              <p className="text-muted-foreground text-[9px] uppercase tracking-wider">Brand</p>
              <p className="text-foreground font-medium">{lookup.brand}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BinInfoBadge;
