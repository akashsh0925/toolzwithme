import { useState } from "react";
import { validateLuhn, detectNetwork } from "@/lib/card-generator";
import { CheckCircle2, XCircle } from "lucide-react";

const networkLabels: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  discover: "Discover",
  unknown: "Unknown",
};

interface ValidationResult {
  raw: string;
  number: string;
  valid: boolean;
  network: string;
}

const CardValidator = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ValidationResult[]>([]);

  const handleValidate = () => {
    const lines = input.split("\n").map((l) => l.trim()).filter(Boolean);
    const parsed = lines.map((line) => {
      const number = line.split("|")[0].replace(/\s/g, "");
      const valid = validateLuhn(number);
      const network = detectNetwork(number);
      return { raw: line, number, valid, network: networkLabels[network] };
    });
    setResults(parsed);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground font-display uppercase tracking-wider">
          Paste card numbers <span className="normal-case text-muted-foreground/60">(one per line, pipe-delimited OK)</span>
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"4147200000000001|12|28|123\n5301850000000001"}
          rows={5}
          className="w-full bg-secondary border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-mono resize-none"
        />
      </div>

      <button
        onClick={handleValidate}
        disabled={!input.trim()}
        className="w-full py-3 rounded-xl font-display font-semibold text-sm uppercase tracking-wider bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Validate
      </button>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 px-4 py-2.5"
            >
              {r.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive shrink-0" />
              )}
              <span className="font-mono text-xs text-foreground flex-1 truncate">{r.number}</span>
              <span className="text-xs text-muted-foreground font-display">{r.network}</span>
              <span
                className={`text-[10px] font-display font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  r.valid
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-destructive/15 text-destructive border-destructive/30"
                }`}
              >
                {r.valid ? "Valid" : "Invalid"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardValidator;
