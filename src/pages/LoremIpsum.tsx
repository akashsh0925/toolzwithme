import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
const WORDS = LOREM.replace(/[.,]/g, "").split(/\s+/);

function generateLorem(count: number, unit: "paragraphs" | "sentences" | "words", startWithLorem: boolean, html: boolean): string {
  const genSentence = (wordCount: number) => {
    const s = Array.from({ length: wordCount }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join(" ");
    return s.charAt(0).toUpperCase() + s.slice(1) + ".";
  };
  const genParagraph = () => {
    const sentences = 3 + Math.floor(Math.random() * 4);
    return Array.from({ length: sentences }, () => genSentence(6 + Math.floor(Math.random() * 8))).join(" ");
  };

  let result = "";
  if (unit === "words") {
    const words = Array.from({ length: count }, () => WORDS[Math.floor(Math.random() * WORDS.length)]);
    if (startWithLorem) { words[0] = "Lorem"; if (count > 1) words[1] = "ipsum"; }
    result = words.join(" ") + ".";
  } else if (unit === "sentences") {
    const sentences = Array.from({ length: count }, () => genSentence(6 + Math.floor(Math.random() * 8)));
    if (startWithLorem && sentences.length > 0) sentences[0] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
    result = sentences.join(" ");
  } else {
    const paragraphs = Array.from({ length: count }, () => genParagraph());
    if (startWithLorem && paragraphs.length > 0) paragraphs[0] = LOREM;
    result = html ? paragraphs.map(p => `<p>${p}</p>`).join("\n\n") : paragraphs.join("\n\n");
  }
  return result;
}

const LoremIpsum = () => {
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [html, setHtml] = useState(false);
  const [output, setOutput] = useState("");

  const generate = () => {
    setOutput(generateLorem(count, unit, startWithLorem, html));
    toast.success("Generated!");
  };

  return (
    <ToolLayout title="Lorem Ipsum" toolName="lorem-ipsum">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">Lorem Ipsum Generator</h2>
          <p className="text-sm text-muted-foreground">Generate placeholder text for your designs.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1 w-20"><label className="text-xs text-muted-foreground">Count</label>
            <Input type="number" value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value)))} min={1} max={100} /></div>
          <div className="flex gap-1.5">
            {(["paragraphs", "sentences", "words"] as const).map(u => (
              <Button key={u} variant={unit === u ? "default" : "outline"} size="sm" onClick={() => setUnit(u)} className="capitalize text-xs">{u}</Button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-xs"><Checkbox checked={startWithLorem} onCheckedChange={(c) => setStartWithLorem(!!c)} />Start with "Lorem ipsum"</label>
          <label className="flex items-center gap-1.5 text-xs"><Checkbox checked={html} onCheckedChange={(c) => setHtml(!!c)} />HTML tags</label>
        </div>
        <Button onClick={generate} className="w-full">Generate</Button>
        {output && (
          <div className="space-y-2">
            <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }}><Copy className="w-3.5 h-3.5 mr-1" /> Copy</Button></div>
            <textarea readOnly value={output} rows={12} className="w-full resize-y rounded-lg border border-border bg-secondary/30 text-foreground text-sm p-3" />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
export default LoremIpsum;
