import { Link } from "react-router-dom";
import { Link2, HardDrive, Clock } from "lucide-react";

const tools = [
  { name: "PDF Link Genie", desc: "Extract links from PDFs", icon: Link2, path: "/pdf-link-genie", ready: true },
  { name: "GDrive Downloader", desc: "Download Google Drive files", icon: HardDrive, path: "/gdrive", ready: false },
  { name: "Coming Soon", desc: "More tools on the way", icon: Clock, path: "#", ready: false },
  { name: "Coming Soon", desc: "More tools on the way", icon: Clock, path: "#", ready: false },
  { name: "Coming Soon", desc: "More tools on the way", icon: Clock, path: "#", ready: false },
  { name: "Coming Soon", desc: "More tools on the way", icon: Clock, path: "#", ready: false },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold tracking-tight">Toolz</h1>
          <p className="text-muted-foreground mt-1">Your collection of handy web tools</p>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, i) => (
            <Link
              key={i}
              to={tool.ready ? tool.path : "#"}
              className={`group p-6 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all duration-200 ${
                !tool.ready ? "opacity-50 pointer-events-none" : "hover:shadow-lg hover:-translate-y-0.5"
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <tool.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{tool.name}</h3>
              <p className="text-sm text-muted-foreground">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
