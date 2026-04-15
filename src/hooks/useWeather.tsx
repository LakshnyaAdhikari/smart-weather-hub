import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { SensorData, ThingSpeakConfig, Alert, AIInsight, Thresholds } from "@/types/weather";
import { DEFAULT_THRESHOLDS } from "@/types/weather";
import { fetchLatestFeeds } from "@/services/thingspeak";
import { generateAlerts, generateInsights } from "@/services/ai-insights";

const POLL_INTERVAL = 15_000;
const STORAGE_KEY = "weatherDashConfig";
const THRESH_KEY = "weatherDashThresholds";

export function loadConfig(): ThingSpeakConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { channelId: "", apiKey: "" };
}

export function saveConfig(config: ThingSpeakConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function loadThresholds(): Thresholds {
  try {
    const raw = localStorage.getItem(THRESH_KEY);
    if (raw) return { ...DEFAULT_THRESHOLDS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_THRESHOLDS };
}

export function saveThresholds(t: Thresholds) {
  localStorage.setItem(THRESH_KEY, JSON.stringify(t));
}

interface WeatherContextType {
  history: SensorData[];
  current: SensorData | null;
  alerts: Alert[];
  insights: AIInsight[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  config: ThingSpeakConfig;
  thresholds: Thresholds;
  refetch: () => Promise<void>;
  updateConfig: (config: ThingSpeakConfig, thresholds: Thresholds) => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ThingSpeakConfig>(loadConfig);
  const [thresholds, setThresholds] = useState<Thresholds>(loadThresholds);
  const [history, setHistory] = useState<SensorData[]>([]);
  const [current, setCurrent] = useState<SensorData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    if (!config.channelId) return;
    setLoading(true);
    setError(null);
    try {
      const feeds = await fetchLatestFeeds(config.channelId, config.apiKey || undefined);
      setHistory(feeds);
      if (feeds.length > 0) {
        const latest = feeds[feeds.length - 1];
        setCurrent(latest);
        setAlerts(generateAlerts(latest, thresholds));
        setInsights(generateInsights(feeds, thresholds));
        setLastUpdated(new Date());
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [config.channelId, config.apiKey, thresholds]);

  useEffect(() => {
    fetchData();
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (config.channelId) {
      intervalRef.current = setInterval(fetchData, POLL_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, config.channelId]);

  const updateConfig = (newConfig: ThingSpeakConfig, newThresholds: Thresholds) => {
    saveConfig(newConfig);
    saveThresholds(newThresholds);
    setConfig(newConfig);
    setThresholds(newThresholds);
  };

  return (
    <WeatherContext.Provider
      value={{
        history,
        current,
        alerts,
        insights,
        loading,
        error,
        lastUpdated,
        config,
        thresholds,
        refetch: fetchData,
        updateConfig,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return context;
};
