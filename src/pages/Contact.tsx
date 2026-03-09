import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setSending(true);
    // Simulate send
    setTimeout(() => {
      toast({ title: "Message sent!", description: "We'll get back to you within 48 hours." });
      setForm({ name: "", email: "", subject: "", message: "" });
      setSending(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold tracking-tight font-display">ToolzWithMe</Link>
          <Link to="/tools"><Button variant="outline" size="sm">Open Tools</Button></Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16 space-y-10">
        <div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-6">
            <ArrowLeft className="w-3 h-3" /> Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Contact Us</h1>
          <p className="text-muted-foreground text-lg">
            Have a question, suggestion, or issue? We'd love to hear from you.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">Email</h3>
            <p className="text-sm text-muted-foreground">support@toolzwithme.com</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">Response Time</h3>
            <p className="text-sm text-muted-foreground">Within 48 hours</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-card p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What's this about?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us more…" rows={5} />
          </div>
          <Button type="submit" disabled={sending} className="w-full">{sending ? "Sending…" : "Send Message"}</Button>
        </form>
      </main>

      <footer className="border-t border-border py-6 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} ToolzWithMe. All rights reserved. ·{" "}
        <Link to="/privacy" className="hover:text-foreground">Privacy</Link> ·{" "}
        <Link to="/terms" className="hover:text-foreground">Terms</Link> ·{" "}
        <Link to="/about" className="hover:text-foreground">About</Link>
      </footer>
    </div>
  );
};

export default Contact;
