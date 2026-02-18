import { useState } from "react";
import { Mail, ExternalLink, Loader2, CheckCircle2, AlertCircle, Clock, Zap } from "lucide-react";
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

// ─── Status Badge ─────────────────────────────────────────────────────────

const platformLabel: Record<string, string> = {
  substack: "Substack",
  beehiiv: "Beehiiv",
  mailchimp: "Mailchimp",
  generic: "Generic",
};

const methodLabel: Record<string, string> = {
  api: "API",
  prefill: "Pre-fill",
  manual: "Manual",
};

function StatusBadge({ status }: { status: SubscriptionStatus | "processing" }) {
  if (status === "subscribed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="w-3 h-3" /> Subscribed
      </span>
    );
  }
  if (status === "opened") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
        <ExternalLink className="w-3 h-3" /> Opened
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-destructive/15 text-destructive border border-destructive/30">
        <AlertCircle className="w-3 h-3" /> Failed
      </span>
    );
  }
  if (status === "processing") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
        <Loader2 className="w-3 h-3 animate-spin" /> Processing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-muted text-muted-foreground border border-border">
      <Clock className="w-3 h-3" /> Pending
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

  const parsedUrls = urlsText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const validUrls = parsedUrls.filter(isValidUrl);
  const invalidCount = parsedUrls.length - validUrls.length;

  const handleSubscribe = async () => {
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (validUrls.length === 0) {
      toast.error("Please enter at least one valid URL");
      return;
    }

    setIsRunning(true);

    // Initialise all rows as "processing"
    const initial: ResultRow[] = validUrls.map((url) => ({
      url,
      domain: getDomain(url),
      platform: detectPlatform(url),
      method: "manual",
      status: "pending",
      message: "",
      processing: true,
    }));
    setResults(initial);

    // Process sequentially so popup blocker doesn't kill batch opens
    for (let i = 0; i < validUrls.length; i++) {
      const url = validUrls[i];
      try {
        const result = await subscribeToNewsletter(url, email);
        setResults((prev) =>
          prev.map((r, idx) => (idx === i ? { ...result, processing: false } : r))
        );
        // Small delay between opens to avoid popup blocker
        if (i < validUrls.length - 1) await delay(400);
      } catch {
        setResults((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? { ...r, status: "failed", message: "Unexpected error", processing: false }
              : r
          )
        );
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 space-y-8 w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
            <Mail className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground">
            Newsletter<span className="text-primary">Bot</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Paste newsletter URLs + your email and let the bot subscribe you — automatically where possible, assisted everywhere else.
          </p>
        </div>

        {/* Approach legend */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          {[
            { icon: <Zap className="w-3.5 h-3.5" />, label: "API", desc: "Substack & Beehiiv — direct subscription", color: "text-emerald-400" },
            { icon: <ExternalLink className="w-3.5 h-3.5" />, label: "Pre-fill", desc: "Mailchimp — email injected into form URL", color: "text-amber-400" },
            { icon: <Mail className="w-3.5 h-3.5" />, label: "Manual", desc: "Generic sites — page opened for you", color: "text-muted-foreground" },
          ].map(({ icon, label, desc, color }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-3 space-y-1">
              <div className={`flex items-center gap-1.5 font-display font-semibold uppercase tracking-wider ${color}`}>
                {icon} {label}
              </div>
              <p className="text-muted-foreground leading-snug">{desc}</p>
            </div>
          ))}
        </div>

        {/* Input card */}
        <div className="rounded-2xl bg-card border border-border p-8 space-y-6 shadow-2xl shadow-primary/5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground font-display uppercase tracking-wider">
              Your Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-secondary border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-body text-sm"
            />
          </div>

          {/* URLs textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground font-display uppercase tracking-wider">
              Newsletter URLs (one per line)
            </label>
            <textarea
              value={urlsText}
              onChange={(e) => setUrlsText(e.target.value)}
              placeholder={
                "https://stratechery.substack.com\nhttps://www.beehiiv.com/subscribe/pub_xxxxx\nhttps://mailchimp-example.us1.list-manage.com/subscribe\nhttps://anywebsite.com"
              }
              rows={6}
              className="w-full bg-secondary border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-body text-sm resize-none"
            />
            {parsedUrls.length > 0 && (
              <p className="text-xs text-muted-foreground font-display">
                <span className="text-foreground">{validUrls.length}</span> valid URL{validUrls.length !== 1 ? "s" : ""}
                {invalidCount > 0 && <span className="text-destructive"> · {invalidCount} invalid</span>}
              </p>
            )}
          </div>

          <button
            onClick={handleSubscribe}
            disabled={isRunning || !email || validUrls.length === 0}
            className="w-full py-4 rounded-xl font-display font-semibold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isRunning ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Subscribing…</>
            ) : (
              <><Mail className="w-4 h-4" /> Subscribe to {validUrls.length || "…"} Newsletter{validUrls.length !== 1 ? "s" : ""}</>
            )}
          </button>

          <div className="rounded-lg bg-secondary/50 border border-border p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-display font-semibold text-foreground uppercase tracking-wider text-[10px]">ℹ️ How it works</p>
            <p>Substack & Beehiiv are subscribed automatically via their public APIs. Mailchimp opens with your email pre-filled. All other sites open in a new tab — you click Subscribe. CAPTCHAs on opened pages must be solved by you.</p>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-2xl shadow-primary/5">
            {/* Summary strip */}
            <div className="px-6 py-4 border-b border-border flex items-center gap-6 bg-secondary/30">
              <span className="text-sm font-display font-semibold text-foreground uppercase tracking-wider">Results</span>
              <div className="flex gap-4 text-xs font-display ml-auto">
                <span className="text-emerald-400">{summary.subscribed} subscribed</span>
                <span className="text-amber-400">{summary.opened} opened</span>
                {summary.failed > 0 && <span className="text-destructive">{summary.failed} failed</span>}
              </div>
            </div>

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
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default NewsletterSubscriber;
