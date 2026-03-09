import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, BookOpen } from "lucide-react";
import { toast } from "sonner";

const PRESETS = [
  { label: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
  { label: "URL", pattern: "https?://[\\w.-]+(?:\\.[\\w.-]+)+[\\w.,@?^=%&:/~+#-]*" },
  { label: "Phone", pattern: "\\+?\\d{1,3}[-.\\s]?\\(?\\d{1,4}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}" },
  { label: "IP Address", pattern: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b" },
  { label: "Hex Color", pattern: "#[0-9a-fA-F]{3,6}\\b" },
];

const RegexTester = () => {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [testText, setTestText] = useState("Hello world! My email is test@example.com.\nVisit https://example.com for more info.\nCall +1-555-123-4567");
  const [replaceWith, setReplaceWith] = useState("");

  const flagStr = Object.entries(flags).filter(([_, v]) => v).map(([k]) => k).join("");

  const { matches, error, highlighted, replaced } = useMemo(() => {
    if (!pattern) return { matches: [], error: null, highlighted: testText, replaced: "" };
    try {
      const regex = new RegExp(pattern, flagStr);
      const ms: { text: string; index: number; groups: string[] }[] = [];
      let m;
      const r = new RegExp(pattern, flagStr);
      if (flagStr.includes("g")) {
        while ((m = r.exec(testText)) !== null) {
          ms.push({ text: m[0], index: m.index, groups: m.slice(1) });
          if (!m[0].length) r.lastIndex++;
        }
      } else {
        m = r.exec(testText);
        if (m) ms.push({ text: m[0], index: m.index, groups: m.slice(1) });
      }
      const hl = testText.replace(regex, (match) => `██${match}██`);
      const rep = replaceWith ? testText.replace(regex, replaceWith) : "";
      return { matches: ms, error: null, highlighted: hl, replaced: rep };
    } catch (e: any) {
      return { matches: [], error: e.message, highlighted: testText, replaced: "" };
    }
  }, [pattern, flagStr, testText, replaceWith]);

  return (
    <ToolLayout title="Regex Tester" toolName="regex-tester">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">Regex Tester</h2>
          <p className="text-sm text-muted-foreground">Test regular expressions with real-time highlighting.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map(p => (
            <Button key={p.label} variant="outline" size="sm" onClick={() => setPattern(p.pattern)} className="text-xs">{p.label}</Button>
          ))}
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1"><Input value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="Enter regex pattern…" className="font-mono" /></div>
            <div className="flex gap-3 items-center">
              {(["g", "i", "m"] as const).map(f => (
                <label key={f} className="flex items-center gap-1 text-xs">
                  <Checkbox checked={flags[f]} onCheckedChange={(c) => setFlags(prev => ({ ...prev, [f]: !!c }))} />{f}
                </label>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-destructive font-mono">{error}</p>}
        </div>
        <textarea value={testText} onChange={(e) => setTestText(e.target.value)} rows={6}
          className="w-full resize-y rounded-lg border border-border bg-background text-foreground font-mono text-sm p-3 focus:outline-none focus:ring-1 focus:ring-ring" />
        {matches.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-display">{matches.length} match(es)</p>
            <div className="max-h-40 overflow-auto space-y-1">
              {matches.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-xs p-2 rounded bg-primary/5 border border-primary/10">
                  <span className="text-muted-foreground">#{i + 1} @{m.index}</span>
                  <code className="text-primary font-mono font-bold">{m.text}</code>
                  {m.groups.length > 0 && <span className="text-muted-foreground">Groups: {m.groups.join(", ")}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label className="text-xs">Replace with</Label>
          <Input value={replaceWith} onChange={(e) => setReplaceWith(e.target.value)} placeholder="Replacement string ($1 for groups)" className="font-mono" />
          {replaced && (
            <div className="flex items-start gap-2">
              <pre className="flex-1 text-xs font-mono bg-secondary/50 p-3 rounded-lg whitespace-pre-wrap text-foreground">{replaced}</pre>
              <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(replaced); toast.success("Copied"); }}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};
export default RegexTester;
