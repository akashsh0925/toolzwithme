import { Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import pdfLinkGenieLogo from "@/assets/pdf-link-genie-logo.png";
import gdriveDlLogo from "@/assets/gdrive-dl-logo.png";
import multiUrlLogo from "@/assets/multi-url-opener-logo.png";
import newsletterLogo from "@/assets/newsletter-subscriber-logo.png";
import cardGenLogo from "@/assets/card-generator-logo.png";
import tempEmailLogo from "@/assets/temp-email-logo.png";

const tools = [
  {
    title: "PDF Link Genie",
    description: "Extract all links from any PDF document in seconds.",
    type: "app" as const,
    url: "/pdf-link-genie",
    logo: pdfLinkGenieLogo,
  },
  {
    title: "GDrive DL",
    description: "Generate direct download links for Google Drive files.",
    type: "app" as const,
    url: "/gdrive",
    logo: gdriveDlLogo,
  },
  {
    title: "Multi URL Opener",
    description: "Open multiple URLs at once — paste a list and go.",
    type: "app" as const,
    url: "/multi-url",
    logo: multiUrlLogo,
  },
  {
    title: "NewsletterBot",
    description: "Bulk-subscribe to newsletters automatically via API or assisted pre-fill.",
    type: "app" as const,
    url: "/newsletter",
    logo: newsletterLogo,
  },
  {
    title: "Card Gen",
    description: "Generate Luhn-valid test card numbers for payment gateway testing.",
    type: "app" as const,
    url: "/card-generator",
    logo: cardGenLogo,
  },
  { title: "Coming Soon", description: "New tool in the works.", type: "coming-soon" as const },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-16">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-foreground">
            Tools
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg">
            Productivity utilities that run entirely in your browser. Pick a tool to get started.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, i) =>
            tool.type === "app" ? (
              <Link
                key={i}
                to={tool.url!}
                className="group rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
                  <img
                    src={tool.logo}
                    alt={tool.title}
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <h2 className="text-base font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                    {tool.title}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tool.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-display text-muted-foreground group-hover:text-primary transition-colors">
                  Open tool <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ) : (
              <div
                key={i}
                className="rounded-2xl border border-dashed border-border bg-card/50 p-5 flex flex-col items-center justify-center gap-2 min-h-[180px]"
              >
                <Clock className="w-6 h-6 text-muted-foreground/40" />
                <span className="text-xs font-display text-muted-foreground uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
