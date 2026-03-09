import { useState, useEffect } from "react";
import type { CardNetwork } from "@/lib/card-generator";
import { detectNetwork } from "@/lib/card-generator";

interface CardPreviewProps {
  number: string;
  month: string;
  year: string;
  cvv: string;
  showBack?: boolean;
}

const networkGradients: Record<CardNetwork, string> = {
  visa: "from-blue-700 via-blue-600 to-blue-800",
  mastercard: "from-red-600 via-orange-500 to-red-700",
  amex: "from-emerald-700 via-emerald-600 to-emerald-800",
  discover: "from-amber-600 via-amber-500 to-amber-700",
  unknown: "from-zinc-700 via-zinc-600 to-zinc-800",
};

const networkLabels: Record<CardNetwork, string> = {
  visa: "VISA",
  mastercard: "MASTERCARD",
  amex: "AMEX",
  discover: "DISCOVER",
  unknown: "CARD",
};

function formatCardNumber(num: string, network: CardNetwork): string {
  const clean = num.replace(/\s/g, "");
  if (network === "amex") {
    return [clean.slice(0, 4), clean.slice(4, 10), clean.slice(10, 15)].filter(Boolean).join(" ");
  }
  return clean.match(/.{1,4}/g)?.join(" ") || clean;
}

const CardPreview = ({ number, month, year, cvv, showBack: controlledBack }: CardPreviewProps) => {
  const [flipped, setFlipped] = useState(false);
  const network = detectNetwork(number || "0");
  const gradient = networkGradients[network];
  const display = number ? formatCardNumber(number, network) : "•••• •••• •••• ••••";

  // Auto-flip when showBack changes
  useEffect(() => {
    if (controlledBack) {
      setFlipped(true);
      const t = setTimeout(() => setFlipped(false), 1200);
      return () => clearTimeout(t);
    }
  }, [controlledBack]);

  return (
    <div
      className="w-full max-w-[360px] mx-auto perspective-[800px] cursor-pointer select-none"
      onClick={() => setFlipped((f) => !f)}
    >
      <div
        className={`relative w-full aspect-[1.586/1] transition-transform duration-500 preserve-3d ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} p-5 flex flex-col justify-between text-white shadow-xl backface-hidden`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex items-center justify-between">
            {/* Chip */}
            <div className="w-10 h-7 rounded-md bg-amber-300/80 border border-amber-400/50" />
            <span className="text-sm font-bold font-display tracking-[0.2em] opacity-90">
              {networkLabels[network]}
            </span>
          </div>
          <div className="font-mono text-lg md:text-xl tracking-[0.12em] text-white/95">
            {display}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-wider opacity-50">Card Holder</p>
              <p className="text-xs font-display font-semibold tracking-wider">TEST USER</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-wider opacity-50">Expires</p>
              <p className="text-xs font-mono">{month || "••"}/{year || "••"}</p>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} flex flex-col shadow-xl backface-hidden [transform:rotateY(180deg)]`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="mt-6 h-10 bg-black/40 w-full" />
          <div className="flex-1 p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 self-end">
              <div className="bg-white/20 rounded px-3 py-1.5 w-48 text-right">
                <span className="font-mono text-sm text-white tracking-wider italic">
                  {cvv || "•••"}
                </span>
              </div>
              <span className="text-[9px] text-white/50 uppercase">CVV</span>
            </div>
          </div>
          <div className="px-5 pb-4">
            <p className="text-[8px] text-white/30 leading-relaxed">
              This is a test card for development purposes only. Not a real credit card.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPreview;
