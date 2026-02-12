import { Link } from "react-router-dom";
import { ArrowRight, Wrench, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Wrench,
    title: "Powerful Tools",
    description: "A curated collection of web utilities to simplify your daily workflow.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "All tools run directly in your browser — no uploads, no waiting.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your files never leave your device. Everything is processed locally.",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight font-display">
            ToolzWithMe
          </span>
          <Link to="/tools">
            <Button variant="outline" size="sm">
              Open Tools
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center flex flex-col items-center gap-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Your Everyday
          <span className="text-primary"> Web Toolbox</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
          Free, fast, and private browser-based tools to handle PDFs, downloads, and more — all in one place.
        </p>
        <Link to="/tools">
          <Button size="lg" className="gap-2 mt-4">
            Explore Tools <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-6 flex flex-col gap-3"
            >
              <f.icon className="w-8 h-8 text-primary" />
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} ToolzWithMe. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
