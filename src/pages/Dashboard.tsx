import { ArrowRight, Search, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import UserMenu from "@/components/UserMenu";
import { categories } from "@/lib/tool-registry";
import { useState, useMemo } from "react";

const Dashboard = () => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        tools: cat.tools.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.tools.length > 0);
  }, [search]);

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-foreground">
              Tools
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg">
              Privacy-first utilities that run entirely in your browser. Pick a tool to get started.
            </p>
          </div>
          <UserMenu />
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tools…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        {/* Categories */}
        {filtered.map((cat) => (
          <section key={cat.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <cat.icon className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-display font-semibold uppercase tracking-wider text-muted-foreground">
                {cat.label}
              </h2>
              <Badge variant="secondary" className="text-[10px]">
                {cat.tools.filter(t => t.available).length}/{cat.tools.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {cat.tools.map((tool) =>
                tool.available ? (
                  <Link
                    key={tool.id}
                    to={tool.route}
                    className="group rounded-xl border border-border bg-card p-4 flex flex-col gap-3 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <tool.icon className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="text-sm font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {tool.description}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] font-display text-muted-foreground group-hover:text-primary transition-colors mt-auto">
                      Open <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                ) : (
                  <div
                    key={tool.id}
                    className="rounded-xl border border-dashed border-border bg-card/30 p-4 flex flex-col gap-3 opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                        <tool.icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <h3 className="text-sm font-display font-medium text-muted-foreground">
                        {tool.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground/60 leading-relaxed line-clamp-2">
                      {tool.description}
                    </p>
                    <Badge variant="outline" className="text-[10px] w-fit mt-auto">
                      Coming Soon
                    </Badge>
                  </div>
                )
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
