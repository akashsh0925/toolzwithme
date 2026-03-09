import { useState } from "react";
import { Copy, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TestCard {
  number: string;
  brand: string;
  behavior: string;
}

interface Gateway {
  name: string;
  cards: TestCard[];
}

const gateways: Gateway[] = [
  {
    name: "Stripe",
    cards: [
      { number: "4242424242424242", brand: "Visa", behavior: "Success" },
      { number: "4000000000003220", brand: "Visa", behavior: "3D Secure 2 required" },
      { number: "4000000000009995", brand: "Visa", behavior: "Declined (insufficient funds)" },
      { number: "5555555555554444", brand: "Mastercard", behavior: "Success" },
      { number: "378282246310005", brand: "Amex", behavior: "Success" },
    ],
  },
  {
    name: "Braintree",
    cards: [
      { number: "4111111111111111", brand: "Visa", behavior: "Success" },
      { number: "5555555555554444", brand: "Mastercard", behavior: "Success" },
      { number: "378282246310005", brand: "Amex", behavior: "Success" },
      { number: "4000111111111115", brand: "Visa", behavior: "Declined" },
    ],
  },
  {
    name: "PayPal",
    cards: [
      { number: "4032035728853269", brand: "Visa", behavior: "Success" },
      { number: "5425233430109903", brand: "Mastercard", behavior: "Success" },
      { number: "374245455400126", brand: "Amex", behavior: "Success" },
    ],
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="text-muted-foreground hover:text-primary transition-colors p-1">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

const GatewayPresets = () => {
  return (
    <div className="space-y-3">
      {gateways.map((gw) => (
        <Collapsible key={gw.name}>
          <CollapsibleTrigger className="flex items-center justify-between w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm font-display font-semibold text-foreground hover:border-primary/30 transition-all group">
            {gw.name}
            <ChevronDown className="w-4 h-4 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-1.5">
            {gw.cards.map((card, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5"
              >
                <span className="font-mono text-xs text-foreground flex-1">{card.number}</span>
                <span className="text-[10px] text-muted-foreground font-display uppercase tracking-wider hidden sm:inline">
                  {card.brand}
                </span>
                <span className="text-[10px] text-muted-foreground hidden md:inline">{card.behavior}</span>
                <CopyButton text={card.number} />
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

export default GatewayPresets;
