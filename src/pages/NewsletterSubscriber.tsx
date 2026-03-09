import { useState } from "react";
import { Mail, ExternalLink, Loader2, CheckCircle2, AlertCircle, Clock, Zap, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  type SubscriptionResult,
  type SubscriptionStatus,
  subscribeToNewsletter,
  isValidUrl,
  isValidEmail,
  detectPlatform,
  getDomain,
} from "@/lib/newsletter-platforms";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import ToolLayout from "@/components/ToolLayout";

// ─── Constants ────────────────────────────────────────────────────────────

const platformLabel: Record<string, string> = {
  substack: "Substack",
  beehiiv: "Beehiiv",
  mailchimp: "Mailchimp",
  ghost: "Ghost",
  convertkit: "ConvertKit",
  buttondown: "Buttondown",
  generic: "Generic",
};

const methodLabel: Record<string, string> = {
  api: "API",
  prefill: "Pre-fill",
  manual: "Manual",
};

// ─── Status Badge ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: SubscriptionStatus | "processing" }) {
  const map: Record<string, { icon: React.ReactNode; label: string; classes: string }> = {
    subscribed: { icon: <CheckCircle2 className="w-3 h-3" />, label: "Subscribed", classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    opened:     { icon: <ExternalLink className="w-3 h-3" />, label: "Opened",     classes: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    failed:     { icon: <AlertCircle className="w-3 h-3" />,  label: "Failed",     classes: "bg-destructive/15 text-destructive border-destructive/30" },
    processing: { icon: <Loader2 className="w-3 h-3 animate-spin" />, label: "Processing", classes: "bg-primary/15 text-primary border-primary/30" },
    pending:    { icon: <Clock className="w-3 h-3" />,        label: "Pending",    classes: "bg-muted text-muted-foreground border-border" },
  };
  const { icon, label, classes } = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${classes}`}>
      {icon} {label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

type ResultRow = SubscriptionResult & { processing?: boolean };

const NewsletterSubscriber = () => {
  const [email, setEmail] = useState("");
  const [urlsText, setUrlsText] = useState("");
  const [results, setResults] = useState<ResultRow[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const parsedUrls = urlsText.split("\n").map((l) => l.trim()).filter(Boolean);
  const validUrls = parsedUrls.filter(isValidUrl);
  const invalidCount = parsedUrls.length - validUrls.length;

  const handleSubscribe = async () => {
    if (!isValidEmail(email)) { toast.error("Please enter a valid email address"); return; }
    if (validUrls.length === 0) { toast.error("Please enter at least one valid URL"); return; }

    setIsRunning(true);
    const initial: ResultRow[] = validUrls.map((url) => ({
      url, domain: getDomain(url), platform: detectPlatform(url),
      method: "manual", status: "pending", message: "", processing: true,
    }));
    setResults(initial);

    for (let i = 0; i < validUrls.length; i++) {
      try {
        const result = await subscribeToNewsletter(validUrls[i], email);
        setResults((prev) => prev.map((r, idx) => (idx === i ? { ...result, processing: false } : r)));
        if (i < validUrls.length - 1) await delay(400);
      } catch {
        setResults((prev) => prev.map((r, idx) =>
          idx === i ? { ...r, status: "failed", message: "Unexpected error", processing: false } : r
        ));
      }
    }

    setIsRunning(false);
    toast.success(`Done! Processed ${validUrls.length} newsletter(s)`);
  };

  const summary = {
    subscribed: results.filter((r) => r.status === "subscribed").length,
    opened: results.filter((r) => r.status === "opened").length,
    failed: results.filter((r) => r.status === "failed").length,
  };

  return (
    <ToolLayout title="NewsletterBot">
      <div className="flex flex-col items-center px-4 py-10 md:py-16 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 space-y-6 w-full max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-foreground">
              Newsletter<span className="text-primary">Bot</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Paste newsletter URLs and your email — the bot subscribes you automatically or opens pages with your email pre-filled.
            </p>
          </div>

          {/* Input card */}
          <div className="rounded-2xl bg-card border border-border p-6 md:p-8 space-y-5 shadow-2xl shadow-primary/5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground font-display uppercase tracking-wider">
                Your Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-secondary border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
              />
            </div>

            {/* URLs */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground font-display uppercase tracking-wider">
                Newsletter URLs <span className="normal-case text-muted-foreground/60">(one per line)</span>
              </label>
              <textarea
                value={urlsText}
                onChange={(e) => setUrlsText(e.target.value)}
                placeholder={"https://stratechery.substack.com\nhttps://example.ghost.io\nhttps://anywebsite.com"}
                rows={5}
                className="w-full bg-secondary border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm resize-none"
              />
              {parsedUrls.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">{validUrls.length}</span> valid URL{validUrls.length !== 1 ? "s" : ""}
                  {invalidCount > 0 && <span className="text-destructive"> · {invalidCount} invalid</span>}
                </p>
              )}
            </div>

            <button
              onClick={handleSubscribe}
              disabled={isRunning || !email || validUrls.length === 0}
              className="w-full py-3.5 rounded-xl font-display font-semibold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isRunning ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Subscribing…</>
              ) : (
                <><Mail className="w-4 h-4" /> Subscribe to {validUrls.length || "…"} Newsletter{validUrls.length !== 1 ? "s" : ""}</>
              )}
            </button>

            {/* Collapsible how-it-works */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-display w-full">
                <ChevronDown className="w-3.5 h-3.5 transition-transform data-[state=open]:rotate-180" />
                How it works & supported platforms
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { icon: <Zap className="w-3 h-3" />, label: "API", desc: "Substack, Beehiiv, Ghost", color: "text-emerald-400" },
                    { icon: <ExternalLink className="w-3 h-3" />, label: "Pre-fill", desc: "Mailchimp, ConvertKit, Buttondown", color: "text-amber-400" },
                    { icon: <Mail className="w-3 h-3" />, label: "Manual", desc: "All other sites", color: "text-muted-foreground" },
                  ].map(({ icon, label, desc, color }) => (
                    <div key={label} className="rounded-lg border border-border bg-secondary/50 p-2.5 space-y-0.5">
                      <div className={`flex items-center gap-1 font-display font-semibold uppercase tracking-wider text-[10px] ${color}`}>
                        {icon} {label}
                      </div>
                      <p className="text-muted-foreground leading-snug">{desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  API platforms are subscribed automatically. Pre-fill platforms open with your email injected. Manual sites open in a new tab. CAPTCHAs must be solved by you.
                </p>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-2xl shadow-primary/5">
              <div className="px-4 md:px-6 py-3 border-b border-border flex items-center gap-4 bg-secondary/30 flex-wrap">
                <span className="text-sm font-display font-semibold text-foreground uppercase tracking-wider">Results</span>
                <div className="flex gap-3 text-xs font-display ml-auto">
                  <span className="text-emerald-400">{summary.subscribed} subscribed</span>
                  <span className="text-amber-400">{summary.opened} opened</span>
                  {summary.failed > 0 && <span className="text-destructive">{summary.failed} failed</span>}
                </div>
              </div>

              {/* Mobile-friendly card list for small screens */}
              <div className="block sm:hidden divide-y divide-border">
                {results.map((r, i) => (
                  <div key={i} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-foreground">{r.domain}</span>
                      <StatusBadge status={r.processing ? "processing" : r.status} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-[10px] font-display uppercase tracking-wider">
                        {platformLabel[r.platform]}
                      </Badge>
                      <span className="font-display uppercase tracking-wider">
                        {r.processing ? "—" : methodLabel[r.method]}
                      </span>
                    </div>
                    {r.message && <p className="text-xs text-muted-foreground truncate">{r.message}</p>}
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-display text-xs uppercase tracking-wider">Domain</TableHead>
                      <TableHead className="font-display text-xs uppercase tracking-wider">Platform</TableHead>
                      <TableHead className="font-display text-xs uppercase tracking-wider">Method</TableHead>
                      <TableHead className="font-display text-xs uppercase tracking-wider">Status</TableHead>
                      <TableHead className="font-display text-xs uppercase tracking-wider">Note</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs text-foreground">{r.domain}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] font-display uppercase tracking-wider">
                            {platformLabel[r.platform]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-display text-muted-foreground uppercase tracking-wider">
                            {r.processing ? "—" : methodLabel[r.method]}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={r.processing ? "processing" : r.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {r.message}
                        </TableCell>
                        <TableCell>
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default NewsletterSubscriber;
