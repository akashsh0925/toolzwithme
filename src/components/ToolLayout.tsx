import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import UserMenu from "@/components/UserMenu";
import UsageGate from "@/components/UsageGate";
import UsageBadge from "@/components/UsageBadge";
import { useUsageGate } from "@/hooks/useUsageGate";
import { useEffect, useRef } from "react";

interface ToolLayoutProps {
  title: string;
  toolName?: string;
  children: React.ReactNode;
}

const ToolLayout = ({ title, toolName, children }: ToolLayoutProps) => {
  const gate = useUsageGate(toolName || title.toLowerCase().replace(/\s+/g, '-'));
  const recorded = useRef(false);

  useEffect(() => {
    if (!gate.loading && !gate.blocked && !recorded.current) {
      gate.recordUsage();
      recorded.current = true;
    }
  }, [gate.loading, gate.blocked]);

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 h-12">
          <Link
            to="/tools"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-display"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Tools</span>
          </Link>
          <span className="text-border">/</span>
          <span className="text-sm font-display font-semibold text-foreground tracking-tight">
            {title}
          </span>
          <div className="ml-auto">
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 relative">
        {children}
        {gate.blocked && <UsageGate />}
      </main>

      <UsageBadge remaining={gate.remaining} limit={gate.limit} />
    </div>
  );
};

export default ToolLayout;
