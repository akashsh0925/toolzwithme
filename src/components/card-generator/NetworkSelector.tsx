import { NETWORK_BINS, type CardNetwork } from "@/lib/card-generator";

interface NetworkSelectorProps {
  onSelect: (bin: string) => void;
  activeBin: string;
}

const networks: { key: Exclude<CardNetwork, "unknown">; label: string }[] = [
  { key: "visa", label: "Visa" },
  { key: "mastercard", label: "MC" },
  { key: "amex", label: "Amex" },
  { key: "discover", label: "Disc" },
];

const NetworkSelector = ({ onSelect, activeBin }: NetworkSelectorProps) => {
  return (
    <div className="flex gap-2">
      {networks.map(({ key, label }) => {
        const isActive = activeBin === NETWORK_BINS[key];
        return (
          <button
            key={key}
            onClick={() => onSelect(NETWORK_BINS[key])}
            className={`px-3.5 py-1.5 rounded-full text-xs font-display font-semibold uppercase tracking-wider border transition-all ${
              isActive
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default NetworkSelector;
