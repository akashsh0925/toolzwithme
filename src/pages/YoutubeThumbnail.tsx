import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Youtube, Image } from "lucide-react";
import { toast } from "sonner";

const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

interface Thumbnail {
  label: string;
  url: string;
  width: number;
  height: number;
}

const YoutubeThumbnail = () => {
  const [url, setUrl] = useState("");
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);

  const fetch_ = useCallback(() => {
    const id = extractVideoId(url.trim());
    if (!id) { toast.error("Invalid YouTube URL or video ID"); return; }

    setThumbnails([
      { label: "Max Resolution", url: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`, width: 1280, height: 720 },
      { label: "SD Default", url: `https://img.youtube.com/vi/${id}/sddefault.jpg`, width: 640, height: 480 },
      { label: "HQ Default", url: `https://img.youtube.com/vi/${id}/hqdefault.jpg`, width: 480, height: 360 },
      { label: "MQ Default", url: `https://img.youtube.com/vi/${id}/mqdefault.jpg`, width: 320, height: 180 },
      { label: "Default", url: `https://img.youtube.com/vi/${id}/default.jpg`, width: 120, height: 90 },
      { label: "Thumbnail 1", url: `https://img.youtube.com/vi/${id}/1.jpg`, width: 120, height: 90 },
      { label: "Thumbnail 2", url: `https://img.youtube.com/vi/${id}/2.jpg`, width: 120, height: 90 },
      { label: "Thumbnail 3", url: `https://img.youtube.com/vi/${id}/3.jpg`, width: 120, height: 90 },
    ]);
    toast.success("Thumbnails loaded!");
  }, [url]);

  return (
    <ToolLayout title="YouTube Thumbnail" toolName="youtube-thumbnail">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">YouTube Thumbnail Grabber</h2>
          <p className="text-sm text-muted-foreground">Get all thumbnail resolutions from any YouTube video.</p>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Paste YouTube URL or video ID…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetch_()}
            className="flex-1"
          />
          <Button onClick={fetch_}>
            <Image className="w-4 h-4 mr-1.5" /> Get
          </Button>
        </div>

        {thumbnails.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {thumbnails.map((t) => (
              <div key={t.label} className="rounded-lg border border-border bg-card overflow-hidden">
                <img src={t.url} alt={t.label} className="w-full aspect-video object-cover bg-secondary" onError={(e) => (e.currentTarget.style.display = "none")} />
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.width}×{t.height}</p>
                  </div>
                  <a href={t.url} target="_blank" rel="noopener" download>
                    <Button variant="outline" size="sm">
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default YoutubeThumbnail;
