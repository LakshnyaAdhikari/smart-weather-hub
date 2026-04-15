import { useState } from "react";
import { Cloud, RefreshCw, Brain, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import SensorCards from "@/components/dashboard/SensorCards";
import WeatherCharts from "@/components/dashboard/WeatherCharts";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import SystemStatus from "@/components/dashboard/SystemStatus";
import AIInsightsPanel from "@/components/dashboard/AIInsightsPanel";
import SettingsDialog from "@/components/dashboard/SettingsDialog";
import ThemeToggle from "@/components/dashboard/ThemeToggle";
import UserProfilePanel from "@/components/dashboard/UserProfilePanel";
import { useWeatherData } from "@/hooks/useWeatherData";
import { loadConfig, saveConfig } from "@/hooks/useWeatherData";
import type { ThingSpeakConfig, Thresholds } from "@/types/weather";
import { DEFAULT_THRESHOLDS } from "@/types/weather";

type Tab = "dashboard" | "insights";

const THRESH_KEY = "weatherDashThresholds";

function loadThresholds(): Thresholds {
  try {
    const raw = localStorage.getItem(THRESH_KEY);
    if (raw) return { ...DEFAULT_THRESHOLDS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_THRESHOLDS };
}

function saveThresholds(t: Thresholds) {
  localStorage.setItem(THRESH_KEY, JSON.stringify(t));
}

export default function Index() {
  const [config, setConfig] = useState<ThingSpeakConfig>(loadConfig);
  const [thresholds, setThresholds] = useState<Thresholds>(loadThresholds);
  const [tab, setTab] = useState<Tab>("dashboard");

  const { history, current, alerts, insights, loading, error, lastUpdated, refetch } =
    useWeatherData(config, thresholds);

  const handleSaveConfig = (c: ThingSpeakConfig, t: Thresholds) => {
    saveConfig(c);
    saveThresholds(t);
    setConfig(c);
    setThresholds(t);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50 transition-colors duration-300">
        <div className="container max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2 rounded-lg bg-primary/10">
              <Cloud className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground tracking-tight">WeatherSense</h1>
              <p className="text-[11px] text-muted-foreground">IoT Smart Weather Monitoring</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-secondary rounded-lg p-0.5">
            <button
              onClick={() => setTab("dashboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === "dashboard" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </button>
            <button
              onClick={() => setTab("insights")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === "insights" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Brain className="w-3.5 h-3.5" /> AI Insights
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              disabled={loading || !config.channelId}
              className="gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <SettingsDialog config={config} thresholds={thresholds} onSave={handleSaveConfig} />
          </div>
        </div>
      </header>

      {/* ── Body layout: sidebar + main ────────────────────── */}
      <div className="container max-w-screen-2xl mx-auto px-4 py-6 flex gap-6">
        {/* User Profile Sidebar */}
        <UserProfilePanel
          config={config}
          current={current}
          lastUpdated={lastUpdated}
          error={error}
          dataPoints={history.length}
        />

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-6">
          {!config.channelId ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                <Cloud className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Connect Your Weather Station</h2>
              <p className="text-sm text-muted-foreground max-w-md mb-4">
                Enter your ThingSpeak Channel ID and API Key in Settings to start viewing real-time sensor data from your ESP32 weather station.
              </p>
              <SettingsDialog config={config} thresholds={thresholds} onSave={handleSaveConfig} />
            </motion.div>
          ) : tab === "dashboard" ? (
            <>
              <SensorCards data={current} thresholds={thresholds} />
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2">
                  <WeatherCharts history={history} />
                </div>
                <div className="space-y-4">
                  <AlertsPanel alerts={alerts} />
                  <SystemStatus
                    lastUpdated={lastUpdated}
                    loading={loading}
                    error={error}
                    dataPoints={history.length}
                  />
                </div>
              </div>
            </>
          ) : (
            <AIInsightsPanel insights={insights} />
          )}
        </main>
      </div>
    </div>
  );
}
