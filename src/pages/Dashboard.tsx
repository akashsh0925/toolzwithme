import { Clock, ExternalLink } from "lucide-react";

const windows = [
  {
    title: "PDF Link Genie",
    type: "app" as const,
    url: "/pdf-link-genie",
  },
  {
    title: "GDrive DL",
    type: "app" as const,
    url: "/gdrive",
  },
  { title: "Window 3", type: "coming-soon" as const },
  { title: "Window 4", type: "coming-soon" as const },
  { title: "Window 5", type: "coming-soon" as const },
  { title: "Window 6", type: "coming-soon" as const },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="grid grid-cols-3 grid-rows-2 gap-4 h-[calc(100vh-2rem)]">
        {windows.map((win, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card overflow-hidden flex flex-col"
          >
            <div className="px-4 py-2 border-b border-border bg-secondary/50 flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                <span className="w-2.5 h-2.5 rounded-full bg-primary/60" />
              </div>
              <span className="text-xs font-display text-muted-foreground uppercase tracking-wider ml-2">
                {win.title}
              </span>
            </div>
            <div className="flex-1 relative">
              {win.type === "app" ? (
                <a
                  href={win.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground hover:text-primary transition-colors group cursor-pointer"
                >
                  <ExternalLink className="w-8 h-8 opacity-40 group-hover:opacity-80 transition-opacity" />
                  <span className="text-sm font-display uppercase tracking-wider">
                    Open {win.title}
                  </span>
                </a>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                  <Clock className="w-8 h-8 opacity-40" />
                  <span className="text-sm font-display uppercase tracking-wider">
                    Coming Soon
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
