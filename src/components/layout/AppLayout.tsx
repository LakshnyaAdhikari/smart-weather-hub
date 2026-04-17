import { Outlet, useLocation } from "react-router-dom";
import SideNavbar from "../dashboard/SideNavbar";
import UserProfilePanel from "../dashboard/UserProfilePanel";
import AlertsPanel from "../dashboard/AlertsPanel";
import SystemStatus from "../dashboard/SystemStatus";
import { useWeather } from "@/hooks/useWeather";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, RefreshCw, Wifi, WifiOff, FlaskConical } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export default function AppLayout() {
  const { config, current, alerts, lastUpdated, error, history, loading, mqttStatus, simulateMqtt, useMqtt, toggleSimulateMqtt, toggleUseMqtt, refetch } = useWeather();
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
            {/* MQTT Status Badge Toggle */}
            {config.channelId && (
              <button
                onClick={toggleUseMqtt}
                title="Click to toggle between MQTT and HTTP polling"
                className={`hidden sm:flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors cursor-pointer hover:opacity-80 active:scale-95 ${
                  !useMqtt
                    ? "bg-slate-500/10 text-slate-600 border-slate-500/30 dark:text-slate-400"
                    : mqttStatus === "connected"
                    ? "bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400"
                    : mqttStatus === "connecting"
                    ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30 dark:text-yellow-400"
                    : mqttStatus === "error"
                    ? "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {!useMqtt ? (
                  <><Cloud className="w-3 h-3" /> HTTP Polling</>
                ) : mqttStatus === "connected" ? (
                  <><Wifi className="w-3 h-3" /> {simulateMqtt ? "MQTT Simulated" : "MQTT Live"}</>
                ) : mqttStatus === "connecting" ? (
                  <><Wifi className="w-3 h-3 animate-pulse" /> Connecting…</>
                ) : mqttStatus === "error" ? (
                  <><WifiOff className="w-3 h-3" /> MQTT Error</>
                ) : (
                  <><WifiOff className="w-3 h-3" /> Disconnected</>
                )}
              </button>
            )}
            {/* Simulate Toggle */}
            {config.channelId && (
              <Button
                variant={simulateMqtt ? "default" : "outline"}
                size="sm"
                onClick={toggleSimulateMqtt}
                className="gap-1.5 text-xs hidden md:flex"
                title="Toggle MQTT simulation"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>{simulateMqtt ? "Simulating" : "Simulate"}</span>
              </Button>
            )}

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

          {/* User Profile + Health Sidebar (Sticky on right) */}
          <div className="hidden xl:flex flex-col gap-6 w-[320px] shrink-0 pb-8">
            <UserProfilePanel
              config={config}
              current={current}
              lastUpdated={lastUpdated}
              error={error}
              dataPoints={history.length}
            />
            
            {/* System Health moved here from OverviewPage */}
            <div className="space-y-6 sticky top-24">
               <div>
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 px-1">Active Alerts</h3>
                  <AlertsPanel alerts={alerts} />
               </div>
               <div>
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 px-1">System Health</h3>
                  <SystemStatus
                    lastUpdated={lastUpdated}
                    loading={loading}
                    error={error}
                    dataPoints={history.length}
                  />
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

