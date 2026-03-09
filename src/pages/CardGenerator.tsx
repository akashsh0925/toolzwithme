import { useState, useCallback } from "react";
import { CreditCard, Copy, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ToolLayout from "@/components/ToolLayout";
import CardPreview from "@/components/card-generator/CardPreview";
import CardValidator from "@/components/card-generator/CardValidator";
import BinInfoBadge from "@/components/card-generator/BinInfoBadge";
import BinLookupTab from "@/components/card-generator/BinLookupTab";
import ExportButtons from "@/components/card-generator/ExportButtons";
import FormatTemplateInput from "@/components/card-generator/FormatTemplateInput";
import GatewayPresets from "@/components/card-generator/GatewayPresets";
import NetworkSelector from "@/components/card-generator/NetworkSelector";
import { generateFromBin, type GeneratedCard } from "@/lib/card-generator";

const months = ["random", ...Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))];
const currentYear = new Date().getFullYear();
const years = ["random", ...Array.from({ length: 10 }, (_, i) => String(currentYear + i).slice(-2))];

const CardGenerator = () => {
  const [bin, setBin] = useState("414720");
  const [month, setMonth] = useState("random");
  const [year, setYear] = useState("random");
  const [cvv, setCvv] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [format, setFormat] = useState("{number}|{mm}|{yy}|{cvv}");
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [showBack, setShowBack] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    const cleanBin = bin.replace(/\s/g, "");
    if (cleanBin.length < 4) {
      toast.error("BIN must be at least 4 digits");
      return;
    }
    const qty = Math.min(Math.max(quantity, 1), 100);
    const result = generateFromBin(cleanBin, month, year, cvv || "random", qty, format);
    setCards(result);
    toast.success(`Generated ${result.length} test card(s)`);
  }, [bin, month, year, cvv, quantity, format]);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(cards.map((c) => c.formatted).join("\n"));
    setCopied(true);
    toast.success("All cards copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  // Preview card (first generated or placeholder)
  const previewCard = cards[0] || { number: bin.replace(/\s/g, ""), month: month === "random" ? "" : month, year: year === "random" ? "" : year, cvv };

  return (
    <ToolLayout title="Card Generator">
      <div className="flex flex-col items-center px-4 py-10 md:py-16 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 space-y-6 w-full max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-foreground">
              Card <span className="text-primary">Generator</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Generate Luhn-valid test card numbers for payment gateway development and testing.
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="w-full grid grid-cols-4 bg-secondary/50 rounded-xl p-1">
              <TabsTrigger value="generator" className="rounded-lg text-xs font-display">Generate</TabsTrigger>
              <TabsTrigger value="validator" className="rounded-lg text-xs font-display">Validate</TabsTrigger>
              <TabsTrigger value="bin-lookup" className="rounded-lg text-xs font-display">BIN Lookup</TabsTrigger>
              <TabsTrigger value="presets" className="rounded-lg text-xs font-display">Presets</TabsTrigger>
            </TabsList>

            {/* Generator */}
            <TabsContent value="generator" className="space-y-6 mt-6">
              {/* Card Preview */}
              <CardPreview
                number={previewCard.number}
                month={previewCard.month}
                year={previewCard.year}
                cvv={previewCard.cvv}
                showBack={showBack}
              />

              {/* Input Card */}
              <div className="rounded-2xl bg-card border border-border p-6 space-y-5 shadow-2xl shadow-primary/5">
                {/* Network quick-select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground font-display uppercase tracking-wider">
                    Quick Select Network
                  </label>
                  <NetworkSelector activeBin={bin} onSelect={setBin} />
                </div>

                {/* BIN Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground font-display uppercase tracking-wider">
                    BIN <span className="normal-case text-muted-foreground/60">(first 4-8 digits)</span>
                  </label>
                  <input
                    type="text"
                    value={bin}
                    onChange={(e) => setBin(e.target.value.replace(/[^\dx]/gi, "").slice(0, 8))}
                    placeholder="414720"
                    className="w-full bg-secondary border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-mono"
                  />
                  <BinInfoBadge bin={bin} />
                </div>

                {/* Month / Year row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground font-display uppercase tracking-wider">Month</label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                    >
                      {months.map((m) => (
                        <option key={m} value={m}>{m === "random" ? "Random" : m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground font-display uppercase tracking-wider">Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>{y === "random" ? "Random" : `20${y}`}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CVV / Quantity row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground font-display uppercase tracking-wider">
                      CVV <span className="normal-case text-muted-foreground/60">(blank = random)</span>
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => {
                        setCvv(e.target.value.replace(/\D/g, "").slice(0, 4));
                        setShowBack((s) => !s);
                      }}
                      placeholder="Random"
                      maxLength={4}
                      className="w-full bg-secondary border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground font-display uppercase tracking-wider">Quantity</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(100, Math.max(1, Number(e.target.value))))}
                      min={1}
                      max={100}
                      className="w-full bg-secondary border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Format */}
                <FormatTemplateInput value={format} onChange={setFormat} />

                {/* Generate */}
                <button
                  onClick={handleGenerate}
                  className="w-full py-3.5 rounded-xl font-display font-semibold text-sm uppercase tracking-wider bg-primary text-primary-foreground hover:brightness-110 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" /> Generate {quantity} Card{quantity !== 1 ? "s" : ""}
                </button>
              </div>

              {/* Results */}
              {cards.length > 0 && (
                <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-2xl shadow-primary/5">
                  <div className="px-4 md:px-6 py-3 border-b border-border flex items-center gap-3 bg-secondary/30 flex-wrap">
                    <span className="text-sm font-display font-semibold text-foreground uppercase tracking-wider">
                      {cards.length} Card{cards.length !== 1 ? "s" : ""}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      <ExportButtons cards={cards} />
                      <button
                        onClick={handleCopyAll}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-secondary/50 text-xs font-display uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy All
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 text-xs font-mono text-foreground/90 overflow-x-auto max-h-64 overflow-y-auto">
                    {cards.map((c) => c.formatted).join("\n")}
                  </pre>
                </div>
              )}
            </TabsContent>

            {/* Validator */}
            <TabsContent value="validator" className="mt-6">
              <div className="rounded-2xl bg-card border border-border p-6 shadow-2xl shadow-primary/5">
                <CardValidator />
              </div>
            </TabsContent>

            {/* BIN Lookup */}
            <TabsContent value="bin-lookup" className="mt-6">
              <div className="rounded-2xl bg-card border border-border p-6 shadow-2xl shadow-primary/5">
                <BinLookupTab />
              </div>
            </TabsContent>

            {/* Presets */}
            <TabsContent value="presets" className="mt-6">
              <div className="rounded-2xl bg-card border border-border p-6 shadow-2xl shadow-primary/5">
                <GatewayPresets />
              </div>
            </TabsContent>
          </Tabs>

          {/* Disclaimer */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-display font-semibold text-amber-400 uppercase tracking-wider">Disclaimer</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                These numbers pass Luhn validation but are <strong className="text-foreground">not real credit cards</strong>. They cannot be used for actual transactions. This tool is intended for development and testing purposes only. Misuse for fraudulent purposes is illegal and strictly prohibited.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default CardGenerator;
