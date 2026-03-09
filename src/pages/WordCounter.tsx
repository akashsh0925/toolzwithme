import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const WordCounter = () => {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter((s) => s.trim()).length : 0;
    const paragraphs = text.trim() ? text.split(/\n\n+/).filter((p) => p.trim()).length : 0;
    const readingTime = Math.ceil(words / 200);
    const speakingTime = Math.ceil(words / 130);

    // Keyword density
    const wordList = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean);
    const freq: Record<string, number> = {};
    wordList.forEach((w) => { if (w.length > 2) freq[w] = (freq[w] || 0) + 1; });
    const topWords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);

    return { chars, charsNoSpace, words, sentences, paragraphs, readingTime, speakingTime, topWords };
  }, [text]);

  const handleFile = async (f: File) => {
    if (f.type === "text/plain" || f.name.endsWith(".txt") || f.name.endsWith(".md")) {
      const t = await f.text();
      setText(t);
    } else {
      toast.error("Please upload a .txt or .md file");
    }
  };

  return (
    <ToolLayout title="Word Counter" toolName="word-counter">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">Word & Character Counter</h2>
          <p className="text-sm text-muted-foreground">Get detailed text statistics instantly.</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Words", value: stats.words },
            { label: "Characters", value: stats.chars },
            { label: "No spaces", value: stats.charsNoSpace },
            { label: "Sentences", value: stats.sentences },
            { label: "Paragraphs", value: stats.paragraphs },
            { label: "Read time", value: `${stats.readingTime} min` },
            { label: "Speak time", value: `${stats.speakingTime} min` },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-card p-3 text-center">
              <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Textarea */}
        <div
          onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => e.preventDefault()}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here… or drop a .txt file"
            className="w-full h-64 resize-y rounded-lg border border-border bg-background text-foreground text-sm p-4 focus:outline-none focus:ring-1 focus:ring-ring"
            spellCheck={false}
          />
        </div>

        {/* Top keywords */}
        {stats.topWords.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider">Keyword Density</h3>
            <div className="flex flex-wrap gap-2">
              {stats.topWords.map(([word, count]) => (
                <span key={word} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-xs font-mono">
                  {word} <span className="text-primary font-bold">{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default WordCounter;
