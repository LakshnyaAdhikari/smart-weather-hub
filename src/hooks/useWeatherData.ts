import { useState, useEffect, useCallback, useRef } from "react";
import type { SensorData, ThingSpeakConfig, Alert, AIInsight, Thresholds } from "@/types/weather";
import { DEFAULT_THRESHOLDS } from "@/types/weather";
import { fetchLatestFeeds } from "@/services/thingspeak";
import { generateAlerts, generateInsights } from "@/services/ai-insights";

const POLL_INTERVAL = 15_000;
const STORAGE_KEY = "weatherDashConfig";

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

export function useWeatherData(config: ThingSpeakConfig, thresholds: Thresholds = DEFAULT_THRESHOLDS) {
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
  }, [fetchData]);

  return { history, current, alerts, insights, loading, error, lastUpdated, refetch: fetchData };
}
