interface FormatTemplateInputProps {
  value: string;
  onChange: (v: string) => void;
}

const presets = [
  { label: "Pipe", template: "{number}|{mm}|{yy}|{cvv}" },
  { label: "Slash", template: "{number}/{mm}/{yy}/{cvv}" },
  { label: "Colon", template: "{number}:{mm}:{yy}:{cvv}" },
  { label: "CSV", template: "{number},{mm},{yy},{cvv}" },
];

const FormatTemplateInput = ({ value, onChange }: FormatTemplateInputProps) => {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground font-display uppercase tracking-wider">
        Output Format
      </label>
      <div className="flex gap-1.5 flex-wrap">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onChange(p.template)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-display uppercase tracking-wider border transition-all ${
              value === p.template
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/30"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="{number}|{mm}|{yy}|{cvv}"
        className="w-full bg-secondary border border-border rounded-xl py-2.5 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-xs font-mono"
      />
    </div>
  );
};

export default FormatTemplateInput;
