import { Outlet, useLocation } from "react-router-dom";
import SideNavbar from "../dashboard/SideNavbar";
import UserProfilePanel from "../dashboard/UserProfilePanel";
import { useWeather } from "@/hooks/useWeather";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export default function AppLayout() {
  const { config, current, lastUpdated, error, history, loading, refetch } = useWeather();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Overview";
    if (path === "/insights") return "AI Insights";
    if (path === "/analytics") return "Analytics & Reports";
    if (path === "/settings") return "System Settings";
    return "Weather Hub";
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <SideNavbar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border/50 bg-background/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight">{getPageTitle()}</h2>
            {loading && <RefreshCw className="w-4 h-4 animate-spin text-primary" />}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none mb-1">Last Update</p>
              <p className="text-xs font-mono font-medium">{lastUpdated ? lastUpdated.toLocaleTimeString() : "--:--:--"}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading || !config.channelId}
              className="gap-2 border-glass-border hover:bg-secondary"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              Sync
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex gap-8">
          <div className="flex-1 min-w-0 max-w-7xl mx-auto space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {!config.channelId ? (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="p-4 rounded-3xl bg-primary/10 mb-6">
                      <Cloud className="w-16 h-16 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black text-foreground mb-3">Welcome to WeatherSense</h2>
                    <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
                      Your IoT ecosystem is ready. Please connect your ThingSpeak channel in settings to begin monitoring.
                    </p>
                    <Button asChild size="lg" className="px-8 shadow-xl shadow-primary/20">
                      <a href="/settings">Configure Connection</a>
                    </Button>
                  </div>
                ) : (
                  <Outlet />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* User Profile Panel (Sticky on right during dashboard view) */}
          <div className="hidden xl:block">
            <UserProfilePanel
              config={config}
              current={current}
              lastUpdated={lastUpdated}
              error={error}
              dataPoints={history.length}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

