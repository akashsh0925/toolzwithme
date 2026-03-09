import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Copy, Type } from "lucide-react";
import { toast } from "sonner";

const transforms: Record<string, (s: string) => string> = {
  "Vaporwave": (s) => s.split("").map(c => {
    const code = c.charCodeAt(0);
    if (code >= 33 && code <= 126) return String.fromCharCode(code + 65248);
    if (c === " ") return "　";
    return c;
  }).join(""),
  "Bubble": (s) => s.split("").map(c => {
    if (c >= "a" && c <= "z") return String.fromCodePoint(0x24D0 + c.charCodeAt(0) - 97);
    if (c >= "A" && c <= "Z") return String.fromCodePoint(0x24B6 + c.charCodeAt(0) - 65);
    return c;
  }).join(""),
  "Small Caps": (s) => {
    const map: Record<string, string> = { a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "Q", r: "ʀ", s: "ꜱ", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ" };
    return s.split("").map(c => map[c.toLowerCase()] || c).join("");
  },
  "Strikethrough": (s) => s.split("").map(c => c + "\u0336").join(""),
  "Upside Down": (s) => {
    const map: Record<string, string> = { a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", h: "ɥ", i: "ᴉ", j: "ɾ", k: "ʞ", l: "l", m: "ɯ", n: "u", o: "o", p: "d", q: "b", r: "ɹ", s: "s", t: "ʇ", u: "n", v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z", "!": "¡", "?": "¿", ".": "˙" };
    return s.split("").map(c => map[c.toLowerCase()] || c).reverse().join("");
  },
  "Leet Speak": (s) => {
    const map: Record<string, string> = { a: "4", b: "8", e: "3", g: "6", i: "1", l: "1", o: "0", s: "5", t: "7" };
    return s.split("").map(c => map[c.toLowerCase()] || c).join("");
  },
  "Zalgo": (s) => {
    const zalgoChars = ['\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307', '\u0308', '\u030A', '\u030B', '\u030C', '\u030D', '\u030E', '\u030F', '\u0310', '\u0311', '\u0312', '\u0313', '\u0314', '\u0315', '\u031A', '\u031B'];
    return s.split("").map(c => c + Array.from({ length: 3 + Math.floor(Math.random() * 5) }, () => zalgoChars[Math.floor(Math.random() * zalgoChars.length)]).join("")).join("");
  },
};

const RetroText = () => {
  const [input, setInput] = useState("Hello World!");

  const outputs = useMemo(() =>
    Object.entries(transforms).map(([name, fn]) => ({ name, result: fn(input) })),
    [input]
  );

  return (
    <ToolLayout title="Retro Text Effects" toolName="retro-text">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">Retro Text Effects</h2>
          <p className="text-sm text-muted-foreground">Transform your text into various stylish formats.</p>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your text here…"
          className="w-full h-20 resize-none rounded-lg border border-border bg-background text-foreground text-sm p-3 focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="space-y-3">
          {outputs.map(({ name, result }) => (
            <div key={name} className="p-3 rounded-lg border border-border bg-card flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display mb-1">{name}</p>
                <p className="text-sm text-foreground break-all">{result}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(result); toast.success("Copied"); }}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
};
export default RetroText;
