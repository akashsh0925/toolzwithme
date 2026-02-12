import { ArrowRight, Wrench, Zap, Shield, Sun, Moon } from "lucide-react";

const themes = [
  {
    name: "Current (Dark Blue)",
    bg: "bg-[hsl(220,20%,7%)]",
    card: "bg-[hsl(220,18%,10%)]",
    border: "border-[hsl(220,14%,18%)]",
    text: "text-[hsl(210,20%,92%)]",
    muted: "text-[hsl(215,15%,50%)]",
    accent: "text-[hsl(217,91%,60%)]",
    accentBg: "bg-[hsl(217,91%,60%)]",
    accentText: "text-[hsl(220,20%,7%)]",
  },
  {
    name: "Cyberpunk / Neon",
    bg: "bg-[hsl(270,15%,5%)]",
    card: "bg-[hsl(270,12%,9%)]",
    border: "border-[hsl(280,20%,18%)]",
    text: "text-[hsl(180,100%,90%)]",
    muted: "text-[hsl(280,15%,50%)]",
    accent: "text-[hsl(330,100%,60%)]",
    accentBg: "bg-[hsl(330,100%,60%)]",
    accentText: "text-[hsl(270,15%,5%)]",
  },
  {
    name: "Warm Earth Tones",
    bg: "bg-[hsl(30,15%,8%)]",
    card: "bg-[hsl(30,12%,12%)]",
    border: "border-[hsl(30,10%,20%)]",
    text: "text-[hsl(35,30%,88%)]",
    muted: "text-[hsl(30,10%,45%)]",
    accent: "text-[hsl(25,80%,55%)]",
    accentBg: "bg-[hsl(25,80%,55%)]",
    accentText: "text-[hsl(30,15%,5%)]",
  },
  {
    name: "Monochrome Minimal",
    bg: "bg-[hsl(0,0%,4%)]",
    card: "bg-[hsl(0,0%,8%)]",
    border: "border-[hsl(0,0%,16%)]",
    text: "text-[hsl(0,0%,92%)]",
    muted: "text-[hsl(0,0%,45%)]",
    accent: "text-[hsl(0,0%,100%)]",
    accentBg: "bg-[hsl(0,0%,100%)]",
    accentText: "text-[hsl(0,0%,4%)]",
  },
  {
    name: "Light Mode",
    bg: "bg-[hsl(0,0%,98%)]",
    card: "bg-[hsl(0,0%,100%)]",
    border: "border-[hsl(220,13%,91%)]",
    text: "text-[hsl(224,71%,4%)]",
    muted: "text-[hsl(220,9%,46%)]",
    accent: "text-[hsl(217,91%,60%)]",
    accentBg: "bg-[hsl(217,91%,60%)]",
    accentText: "text-white",
    extra: "",
  },
  {
    name: "Pixelated / Retro",
    bg: "bg-[hsl(240,20%,8%)]",
    card: "bg-[hsl(240,15%,12%)]",
    border: "border-[hsl(120,60%,35%)]",
    text: "text-[hsl(120,80%,75%)]",
    muted: "text-[hsl(120,30%,40%)]",
    accent: "text-[hsl(120,100%,50%)]",
    accentBg: "bg-[hsl(120,100%,50%)]",
    accentText: "text-[hsl(240,20%,5%)]",
    extra: "font-mono [image-rendering:pixelated] [text-shadow:0_0_8px_hsl(120,100%,50%,0.5)]",
  },
];

const features = [
  { icon: Wrench, title: "Powerful Tools" },
  { icon: Zap, title: "Lightning Fast" },
  { icon: Shield, title: "Privacy First" },
];

const ThemePreview = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold font-display mb-2">Theme Preview</h1>
        <p className="text-muted-foreground mb-8">
          See how each theme would look on your site.
        </p>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {themes.map((t) => (
            <div
              key={t.name}
              className={`${t.bg} ${t.border} ${'extra' in t ? (t as any).extra : ''} border rounded-xl overflow-hidden`}
            >
              {/* Mini nav */}
              <div className={`${t.border} border-b px-4 py-3 flex items-center justify-between`}>
                <span className={`${t.text} text-sm font-bold font-display`}>
                  ToolzWithMe
                </span>
                <span
                  className={`${t.border} border ${t.text} text-xs px-2 py-1 rounded-md`}
                >
                  Open Tools
                </span>
              </div>

              {/* Mini hero */}
              <div className="px-4 py-8 text-center">
                <h2 className={`${t.text} text-lg font-bold mb-1`}>
                  Your Everyday <span className={t.accent}>Web Toolbox</span>
                </h2>
                <p className={`${t.muted} text-xs mb-4`}>
                  Free, fast, and private browser-based tools.
                </p>
                <span
                  className={`${t.accentBg} ${t.accentText} text-xs font-medium px-3 py-1.5 rounded-md inline-flex items-center gap-1`}
                >
                  Explore Tools <ArrowRight className="w-3 h-3" />
                </span>
              </div>

              {/* Mini features */}
              <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                {features.map((f) => (
                  <div
                    key={f.title}
                    className={`${t.card} ${t.border} border rounded-lg p-2`}
                  >
                    <f.icon className={`w-4 h-4 ${t.accent} mb-1`} />
                    <span className={`${t.text} text-[10px] font-medium`}>
                      {f.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Theme label */}
              <div className={`${t.border} border-t px-4 py-2`}>
                <span className={`${t.accent} text-xs font-display font-semibold`}>
                  {t.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground text-sm mt-8 text-center">
          Tell me which theme(s) you'd like to apply!
        </p>
      </div>
    </div>
  );
};

export default ThemePreview;
