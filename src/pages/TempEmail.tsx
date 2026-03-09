import { useState, useEffect, useCallback, useRef } from "react";
import { Mail, Copy, Check, RefreshCw, Trash2, Loader2, Inbox, Eye, ArrowLeft, Clock } from "lucide-react";
import { toast } from "sonner";
import ToolLayout from "@/components/ToolLayout";
import {
  getDomains,
  createAccount,
  getMessages,
  readMessage,
  deleteAccount,
  generateRandomAddress,
  type TempMessage,
  type TempMessageFull,
} from "@/lib/temp-mail";

const TempEmail = () => {
  const [stage, setStage] = useState<"create" | "inbox" | "reading">("create");
  const [loading, setLoading] = useState(false);
  const [domains, setDomains] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [token, setToken] = useState("");
  const [messages, setMessages] = useState<TempMessage[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<TempMessageFull | null>(null);
  const [copied, setCopied] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // Load domains on mount
  useEffect(() => {
    getDomains()
      .then(setDomains)
      .catch(() => toast.error("Failed to load email domains"));
  }, []);

  // Auto-refresh messages
  useEffect(() => {
    if (stage === "inbox" && token && autoRefresh) {
      const refresh = () => getMessages(token).then(setMessages).catch(() => {});
      intervalRef.current = setInterval(refresh, 5000);
      return () => clearInterval(intervalRef.current);
    }
  }, [stage, token, autoRefresh]);

  const handleCreate = useCallback(async () => {
    if (domains.length === 0) { toast.error("No domains available"); return; }
    setLoading(true);
    try {
      const addr = generateRandomAddress(domains[0]);
      const password = crypto.randomUUID().slice(0, 16);
      const result = await createAccount(addr, password);
      setAddress(result.address);
      setToken(result.token);
      setStage("inbox");
      toast.success("Temporary email created!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create email");
    }
    setLoading(false);
  }, [domains]);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Email copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRefresh = async () => {
    if (!token) return;
    const msgs = await getMessages(token);
    setMessages(msgs);
    toast.success(`${msgs.length} message(s)`);
  };

  const handleRead = async (msg: TempMessage) => {
    try {
      const full = await readMessage(token, msg.id);
      setSelectedMsg(full);
      setStage("reading");
    } catch {
      toast.error("Failed to load message");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount(token);
      setAddress("");
      setToken("");
      setMessages([]);
      setSelectedMsg(null);
      setStage("create");
      toast.success("Email deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleNewEmail = async () => {
    if (token) {
      try { await deleteAccount(token); } catch { /* ignore */ }
    }
    setAddress("");
    setToken("");
    setMessages([]);
    setSelectedMsg(null);
    setStage("create");
    handleCreate();
  };

  return (
    <ToolLayout title="Temp Email">
      <div className="flex flex-col items-center px-4 py-10 md:py-16 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 space-y-6 w-full max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-foreground">
              Temp <span className="text-primary">Email</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Generate a disposable email address with a live inbox. Perfect for sign-ups and testing.
            </p>
          </div>

          {/* Create stage */}
          {stage === "create" && (
            <div className="rounded-2xl bg-card border border-border p-6 md:p-8 space-y-5 shadow-2xl shadow-primary/5">
              <div className="text-center space-y-3">
                <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Click below to generate a random temporary email address with a live inbox.
                </p>
                {domains.length > 0 && (
                  <p className="text-[10px] text-muted-foreground/60 font-display">
                    Domain: <span className="text-foreground">@{domains[0]}</span>
                  </p>
                )}
              </div>
              <button
                onClick={handleCreate}
                disabled={loading || domains.length === 0}
                className="w-full py-3.5 rounded-xl font-display font-semibold text-sm uppercase tracking-wider bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
                ) : (
                  <><Mail className="w-4 h-4" /> Generate Temp Email</>
                )}
              </button>
            </div>
          )}

          {/* Inbox stage */}
          {stage === "inbox" && (
            <>
              {/* Address bar */}
              <div className="rounded-2xl bg-card border border-border p-5 shadow-2xl shadow-primary/5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-secondary border border-border rounded-xl py-3 px-4 font-mono text-sm text-foreground truncate">
                    {address}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 p-3 rounded-xl border border-border bg-secondary hover:border-primary/40 transition-all"
                    title="Copy"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleRefresh}
                    className="flex-1 py-2.5 rounded-xl font-display text-xs uppercase tracking-wider border border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </button>
                  <button
                    onClick={handleNewEmail}
                    className="flex-1 py-2.5 rounded-xl font-display text-xs uppercase tracking-wider border border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" /> New Email
                  </button>
                  <button
                    onClick={handleDelete}
                    className="py-2.5 px-4 rounded-xl font-display text-xs uppercase tracking-wider border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/30"}`} />
                  <span>Auto-refresh {autoRefresh ? "on" : "off"} (every 5s)</span>
                  <button
                    onClick={() => setAutoRefresh((v) => !v)}
                    className="underline hover:text-foreground transition-colors"
                  >
                    {autoRefresh ? "Pause" : "Resume"}
                  </button>
                </div>
              </div>

              {/* Messages list */}
              <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-2xl shadow-primary/5">
                <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center gap-3">
                  <span className="text-sm font-display font-semibold text-foreground uppercase tracking-wider">
                    Inbox
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {messages.length} message{messages.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {messages.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <Inbox className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                    <p className="text-xs text-muted-foreground">No messages yet. Use this email to sign up somewhere and emails will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {messages.map((msg) => (
                      <button
                        key={msg.id}
                        onClick={() => handleRead(msg)}
                        className="w-full text-left px-5 py-3.5 hover:bg-secondary/50 transition-colors space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium truncate flex-1 ${msg.seen ? "text-muted-foreground" : "text-foreground"}`}>
                            {msg.from?.name || msg.from?.address || "Unknown"}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" />
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {!msg.seen && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-xs text-foreground font-medium truncate">{msg.subject || "(no subject)"}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{msg.intro}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Reading stage */}
          {stage === "reading" && selectedMsg && (
            <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-2xl shadow-primary/5">
              <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center gap-3">
                <button
                  onClick={() => { setSelectedMsg(null); setStage("inbox"); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-display font-semibold text-foreground truncate flex-1">
                  {selectedMsg.subject || "(no subject)"}
                </span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    From: <span className="text-foreground">{selectedMsg.from?.name || selectedMsg.from?.address}</span>
                  </span>
                  <span className="ml-auto flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(selectedMsg.createdAt).toLocaleString()}
                  </span>
                </div>
                {selectedMsg.html && selectedMsg.html.length > 0 ? (
                  <div
                    className="prose prose-invert prose-sm max-w-none text-foreground text-xs overflow-auto max-h-96 rounded-lg bg-secondary/50 border border-border p-4"
                    dangerouslySetInnerHTML={{ __html: selectedMsg.html[0] }}
                  />
                ) : (
                  <pre className="text-xs text-foreground whitespace-pre-wrap bg-secondary/50 border border-border rounded-lg p-4 max-h-96 overflow-auto">
                    {selectedMsg.text || "(empty message)"}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default TempEmail;
