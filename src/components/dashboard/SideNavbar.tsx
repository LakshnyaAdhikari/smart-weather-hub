import { NavLink } from "react-router-dom";
import { LayoutDashboard, Brain, BarChart3, Settings, Cloud, ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: Brain, label: "AI Insights", to: "/insights" },
  { icon: BarChart3, label: "Analytics", to: "/analytics" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

export default function SideNavbar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 border-r border-border/50 bg-background/80 backdrop-blur-xl transition-all duration-300 z-50 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
          <Cloud className="w-6 h-6 text-primary" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="text-lg font-bold text-foreground tracking-tight">WeatherSense</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">IoT Hub</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            {collapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-border shadow-xl z-[60]">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-4">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between gap-2")}>
          <ThemeToggle />
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex justify-center p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
}
