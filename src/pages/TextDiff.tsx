import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DiffLine {
  type: "same" | "added" | "removed";
  text: string;
  lineA?: number;
  lineB?: number;
}

function computeDiff(a: string, b: string): DiffLine[] {
  const linesA = a.split("\n");
  const linesB = b.split("\n");
  const result: DiffLine[] = [];

  // Simple LCS-based diff
  const m = linesA.length;
  const n = linesB.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = linesA[i - 1] === linesB[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  let i = m, j = n;
  const stack: DiffLine[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      stack.push({ type: "same", text: linesA[i - 1], lineA: i, lineB: j });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: "added", text: linesB[j - 1], lineB: j });
      j--;
    } else {
      stack.push({ type: "removed", text: linesA[i - 1], lineA: i });
      i--;
    }
  }

  return stack.reverse();
}

const TextDiff = () => {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");

  const diff = useMemo(() => computeDiff(textA, textB), [textA, textB]);

  const stats = useMemo(() => {
    const added = diff.filter(d => d.type === "added").length;
    const removed = diff.filter(d => d.type === "removed").length;
    const same = diff.filter(d => d.type === "same").length;
    return { added, removed, same };
  }, [diff]);

  const hasDiff = textA.length > 0 || textB.length > 0;

  return (
    <ToolLayout title="Text Diff" toolName="text-diff">
      <div className="flex flex-col h-[calc(100vh-3rem)]">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card/50">
          <span className="text-xs text-muted-foreground font-mono">
            {hasDiff && (
              <>
                <span className="text-green-400">+{stats.added}</span>
                {" "}
                <span className="text-red-400">−{stats.removed}</span>
                {" "}
                <span className="text-muted-foreground">{stats.same} unchanged</span>
              </>
            )}
          </span>
          <div className="ml-auto flex gap-1.5">
            <Button variant="ghost" size="sm" onClick={() => { setTextA(""); setTextB(""); }}>
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear
            </Button>
          </div>
        </div>

        {/* Input panels */}
        <div className="flex min-h-0 h-2/5 border-b border-border">
          <div className="w-1/2 flex flex-col border-r border-border">
            <div className="px-3 py-1 border-b border-border bg-secondary/30">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-display">Original</span>
            </div>
            <textarea
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              className="flex-1 resize-none bg-background text-foreground font-mono text-sm p-3 focus:outline-none"
              placeholder="Paste original text here…"
              spellCheck={false}
            />
          </div>
          <div className="w-1/2 flex flex-col">
            <div className="px-3 py-1 border-b border-border bg-secondary/30">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-display">Modified</span>
            </div>
            <textarea
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              className="flex-1 resize-none bg-background text-foreground font-mono text-sm p-3 focus:outline-none"
              placeholder="Paste modified text here…"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Diff output */}
        <div className="flex-1 overflow-auto">
          {hasDiff ? (
            <div className="font-mono text-sm">
              {diff.map((line, i) => (
                <div
                  key={i}
                  className={`flex items-stretch border-b border-border/30 ${
                    line.type === "added"
                      ? "bg-green-500/10"
                      : line.type === "removed"
                      ? "bg-red-500/10"
                      : ""
                  }`}
                >
                  <span className="w-10 shrink-0 text-right px-2 py-0.5 text-[10px] text-muted-foreground/60 select-none border-r border-border/30">
                    {line.lineA ?? ""}
                  </span>
                  <span className="w-10 shrink-0 text-right px-2 py-0.5 text-[10px] text-muted-foreground/60 select-none border-r border-border/30">
                    {line.lineB ?? ""}
                  </span>
                  <span className={`w-5 shrink-0 text-center py-0.5 select-none font-bold ${
                    line.type === "added" ? "text-green-400" : line.type === "removed" ? "text-red-400" : "text-muted-foreground/30"
                  }`}>
                    {line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}
                  </span>
                  <span className="flex-1 py-0.5 px-2 whitespace-pre-wrap break-all">
                    {line.text}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Paste text in both panels above to see the diff
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default TextDiff;
