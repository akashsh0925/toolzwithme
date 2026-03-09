import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw, KeyRound, Shield } from "lucide-react";
import { toast } from "sonner";

const CHARS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

const AMBIGUOUS = "0O1lI";

function generatePassword(
  length: number,
  opts: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean; excludeAmbiguous: boolean }
): string {
  let charset = "";
  if (opts.upper) charset += CHARS.upper;
  if (opts.lower) charset += CHARS.lower;
  if (opts.numbers) charset += CHARS.numbers;
  if (opts.symbols) charset += CHARS.symbols;
  if (opts.excludeAmbiguous) charset = charset.split("").filter((c) => !AMBIGUOUS.includes(c)).join("");
  if (!charset) charset = CHARS.lower + CHARS.numbers;

  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => charset[v % charset.length]).join("");
}

function calcEntropy(password: string): number {
  const charsetSize = new Set(password).size;
  return Math.round(password.length * Math.log2(charsetSize || 1));
}

function crackTime(entropy: number): string {
  const seconds = Math.pow(2, entropy) / 1e10; // 10 billion guesses/sec
  if (seconds < 1) return "instant";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  const years = seconds / 31536000;
  if (years > 1e15) return "trillions of years";
  if (years > 1e12) return `${(years / 1e12).toFixed(0)} trillion years`;
  if (years > 1e9) return `${(years / 1e9).toFixed(0)} billion years`;
  if (years > 1e6) return `${(years / 1e6).toFixed(0)} million years`;
  return `${Math.round(years)} years`;
}

const PasswordGenerator = () => {
  const [length, setLength] = useState(16);
  const [count, setCount] = useState(5);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [passwords, setPasswords] = useState<string[]>([]);

  const generate = useCallback(() => {
    const opts = { upper, lower, numbers, symbols, excludeAmbiguous };
    const results = Array.from({ length: count }, () => generatePassword(length, opts));
    setPasswords(results);
  }, [length, count, upper, lower, numbers, symbols, excludeAmbiguous]);

  const strengthColor = (entropy: number) => {
    if (entropy < 40) return "text-destructive";
    if (entropy < 60) return "text-warning";
    return "text-primary";
  };

  return (
    <ToolLayout title="Password Generator" toolName="password-generator">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">Password Generator</h2>
          <p className="text-sm text-muted-foreground">Generate cryptographically secure passwords in your browser.</p>
        </div>

        <div className="space-y-4 p-4 rounded-lg border border-border bg-card">
          <div className="space-y-2">
            <Label className="text-xs">Length: {length}</Label>
            <Slider value={[length]} onValueChange={([v]) => setLength(v)} min={8} max={128} step={1} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Uppercase (A-Z)", checked: upper, set: setUpper },
              { label: "Lowercase (a-z)", checked: lower, set: setLower },
              { label: "Numbers (0-9)", checked: numbers, set: setNumbers },
              { label: "Symbols (!@#)", checked: symbols, set: setSymbols },
            ].map((o) => (
              <label key={o.label} className="flex items-center gap-2 text-sm">
                <Checkbox checked={o.checked} onCheckedChange={(c) => o.set(!!c)} />
                {o.label}
              </label>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox checked={excludeAmbiguous} onCheckedChange={(c) => setExcludeAmbiguous(!!c)} />
            Exclude ambiguous (0, O, l, 1, I)
          </label>

          <div className="flex gap-2 items-end">
            <div className="space-y-1 w-24">
              <Label className="text-xs">Count</Label>
              <Input type="number" value={count} onChange={(e) => setCount(Math.max(1, Math.min(20, Number(e.target.value))))} min={1} max={20} />
            </div>
            <Button onClick={generate} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-1.5" /> Generate
            </Button>
          </div>
        </div>

        {passwords.length > 0 && (
          <div className="space-y-2">
            {passwords.map((pw, i) => {
              const entropy = calcEntropy(pw);
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
                  <code className="flex-1 text-sm font-mono break-all text-foreground">{pw}</code>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-display font-bold ${strengthColor(entropy)}`}>{entropy} bits</span>
                    <p className="text-[10px] text-muted-foreground">{crackTime(entropy)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { navigator.clipboard.writeText(pw); toast.success("Copied"); }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PasswordGenerator;
