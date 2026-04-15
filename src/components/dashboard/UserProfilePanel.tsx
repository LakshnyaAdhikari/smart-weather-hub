import { useState } from "react";
import { User, MapPin, Wifi, WifiOff, BarChart3, ChevronRight, ChevronLeft, Shield, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SensorData, ThingSpeakConfig } from "@/types/weather";

interface Props {
  config: ThingSpeakConfig;
  current: SensorData | null;
  lastUpdated: Date | null;
  error: string | null;
  dataPoints: number;
}

function healthScore(current: SensorData | null): { score: number; label: string; color: string } {
  if (!current) return { score: 0, label: "No Data", color: "text-muted-foreground" };
  let score = 100;
  if (current.temperature !== null && current.temperature > 38) score -= 20;
  if (current.humidity !== null && current.humidity > 80) score -= 15;
  if (current.airQuality !== null && current.airQuality > 300) score -= 30;
  else if (current.airQuality !== null && current.airQuality > 150) score -= 15;
  if (current.rainStatus) score -= 5;
  if (current.poorAqiFlag) score -= 30;
  score = Math.max(0, score);
  if (score >= 80) return { score, label: "Good", color: "text-safe" };
  if (score >= 50) return { score, label: "Fair", color: "text-warning" };
  return { score, label: "Poor", color: "text-danger" };
}

export default function UserProfilePanel({ config, current, lastUpdated, error, dataPoints }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const isOnline = !error && lastUpdated !== null;
  const health = healthScore(current);

  return (
    <div className="relative flex">
      {/* Collapse toggle strip */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-12 rounded-full bg-secondary border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors shadow-md"
        aria-label={collapsed ? "Expand profile panel" : "Collapse profile panel"}
      >
        {collapsed ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.aside
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden shrink-0"
          >
            <div className="w-[260px] h-full space-y-4 pl-1">
              {/* Profile Card */}
              <div className="glass-card p-5">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                      <User className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <span className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${isOnline ? "bg-safe" : "bg-danger"}`} />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">WeatherSense User</p>
                    <p className="text-xs text-muted-foreground mt-0.5">IoT Dashboard Operator</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Channel: {config.channelId || "Not connected"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {isOnline ? (
                      <Wifi className="w-3.5 h-3.5 text-safe shrink-0" />
                    ) : (
                      <WifiOff className="w-3.5 h-3.5 text-danger shrink-0" />
                    )}
                    <span className={isOnline ? "text-safe" : "text-danger"}>
                      {isOnline ? "ThingSpeak Online" : "Disconnected"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Health Score */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Environment Health</span>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <span className={`text-3xl font-bold ${health.color}`}>{health.score}</span>
                  <span className={`text-sm font-medium ${health.color}`}>{health.label}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${health.score >= 80 ? "bg-safe" : health.score >= 50 ? "bg-warning" : "bg-danger"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${health.score}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">Based on live sensor readings</p>
              </div>

              {/* Stats */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Session Stats</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data Points Fetched</span>
                    <span className="font-mono font-semibold text-foreground">{dataPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Polling Interval</span>
                    <span className="font-mono font-semibold text-foreground">15s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Fetch</span>
                    <span className="font-mono font-semibold text-foreground">
                      {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Device info */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Device Info</span>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p>Microcontroller: <span className="text-foreground font-medium">ESP32</span></p>
                  <p>Sensors: <span className="text-foreground font-medium">DHT11, MQ135, BMP180, Rain</span></p>
                  <p>Cloud: <span className="text-foreground font-medium">ThingSpeak</span></p>
                  <p>Protocol: <span className="text-foreground font-medium">REST (HTTP polling)</span></p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
