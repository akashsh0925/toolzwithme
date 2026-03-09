import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Search, Star, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { categories } from "@/lib/tool-registry";

const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
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
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="bg-card">
        {/* Search */}
        {!collapsed && (
          <div className="p-3 pb-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tools…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-secondary border-none"
              />
            </div>
          </div>
        )}

        {filtered.map((cat) => (
          <SidebarGroup key={cat.id}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-display">
              {!collapsed && (
                <>
                  <cat.icon className="w-3.5 h-3.5 mr-1.5 inline" />
                  {cat.label}
                </>
              )}
              {collapsed && <cat.icon className="w-4 h-4" />}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {cat.tools.map((tool) => (
                  <SidebarMenuItem key={tool.id}>
                    <SidebarMenuButton asChild disabled={!tool.available}>
                      {tool.available ? (
                        <NavLink
                          to={tool.route}
                          end
                          className="text-xs hover:bg-secondary/50"
                          activeClassName="bg-primary/10 text-primary font-medium"
                        >
                          <tool.icon className="w-3.5 h-3.5 mr-2 shrink-0" />
                          {!collapsed && (
                            <span className="truncate">{tool.title}</span>
                          )}
                        </NavLink>
                      ) : (
                        <span className="text-xs text-muted-foreground/50 flex items-center cursor-not-allowed">
                          <tool.icon className="w-3.5 h-3.5 mr-2 shrink-0 opacity-40" />
                          {!collapsed && (
                            <>
                              <span className="truncate">{tool.title}</span>
                              <Lock className="w-3 h-3 ml-auto opacity-40" />
                            </>
                          )}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
