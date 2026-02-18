import { Clock } from "lucide-react";
import { Link } from "react-router-dom";
import pdfLinkGenieLogo from "@/assets/pdf-link-genie-logo.png";
import gdriveDlLogo from "@/assets/gdrive-dl-logo.png";
import multiUrlLogo from "@/assets/multi-url-opener-logo.png";
import newsletterLogo from "@/assets/newsletter-subscriber-logo.png";

const windows = [
  {
    title: "PDF Link Genie",
    type: "app" as const,
    url: "/pdf-link-genie",
    logo: pdfLinkGenieLogo,
  },
  {
    title: "GDrive DL",
    type: "app" as const,
    url: "/gdrive",
    logo: gdriveDlLogo,
  },
  {
    title: "Multi URL",
    type: "app" as const,
    url: "/multi-url",
    logo: multiUrlLogo,
  },
  {
    title: "NewsletterBot",
    type: "app" as const,
    url: "/newsletter",
    logo: newsletterLogo,
  },
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
            {win.type === "app" ? (
              <Link
                to={win.url!}
                className="flex-1 relative group cursor-pointer overflow-hidden"
              >
                <img
                  src={win.logo}
                  alt={win.title}
                  className="absolute inset-0 w-full h-full object-contain p-8 opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                />
              </Link>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Clock className="w-8 h-8 opacity-40" />
                <span className="text-sm font-display uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
