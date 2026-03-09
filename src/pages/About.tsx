import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wrench, Zap, Shield, Globe } from "lucide-react";

const About = () => (
  <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold tracking-tight font-display">ToolzWithMe</Link>
        <Link to="/tools"><Button variant="outline" size="sm">Open Tools</Button></Link>
      </div>
    </header>

    <main className="max-w-3xl mx-auto px-6 py-16 space-y-12">
      <div>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3 h-3" /> Back to Home
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">About ToolzWithMe</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          ToolzWithMe is a free, browser-based utility platform offering 35+ tools for everyday tasks — from PDF editing to image conversion, code formatting to productivity timers.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Our Mission</h2>
        <p className="text-muted-foreground leading-relaxed">
          We believe essential web tools should be free, fast, and private. Every tool on ToolzWithMe processes your data entirely within your browser — no files are uploaded to any server, no data is stored, and no tracking cookies monitor your activity.
        </p>
      </section>

      <section className="grid sm:grid-cols-2 gap-6">
        {[
          { icon: Shield, title: "Privacy First", desc: "All processing happens locally in your browser. Your files never leave your device." },
          { icon: Zap, title: "Lightning Fast", desc: "No server round-trips means instant results, even on slow connections." },
          { icon: Wrench, title: "35+ Tools", desc: "PDF, image, text, download, productivity, and security tools — all in one place." },
          { icon: Globe, title: "Always Free", desc: "No hidden paywalls, no mandatory sign-ups. Core tools are free forever." },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-card p-5 space-y-2">
            <f.icon className="w-6 h-6 text-primary" />
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">How It Works</h2>
        <p className="text-muted-foreground leading-relaxed">
          ToolzWithMe is built with modern web technologies (React, TypeScript, Tailwind CSS) and leverages browser APIs like Canvas, Web Workers, and the File API to handle complex operations — from OCR text recognition to PDF manipulation — without any server-side processing.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          Have questions, feedback, or partnership inquiries? Visit our{" "}
          <Link to="/contact" className="text-primary hover:underline">Contact page</Link>.
        </p>
      </section>
    </main>

    <footer className="border-t border-border py-6 text-center text-muted-foreground text-sm">
      © {new Date().getFullYear()} ToolzWithMe. All rights reserved. ·{" "}
      <Link to="/privacy" className="hover:text-foreground">Privacy</Link> ·{" "}
      <Link to="/terms" className="hover:text-foreground">Terms</Link> ·{" "}
      <Link to="/contact" className="hover:text-foreground">Contact</Link>
    </footer>
  </div>
);

export default About;
