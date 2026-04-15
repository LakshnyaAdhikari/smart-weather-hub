import { useState, useEffect, useCallback, useRef } from "react";
import type { SensorData, ThingSpeakConfig, Alert, AIInsight, Thresholds } from "@/types/weather";
import { DEFAULT_THRESHOLDS } from "@/types/weather";
import { fetchLatestFeeds } from "@/services/thingspeak";
import { generateAlerts, generateInsights } from "@/services/ai-insights";
import { useMqttWeather } from "@/hooks/useMqttWeather";
import { useMqttSimulator } from "@/hooks/useMqttSimulator"; // TEMP: remove when hardware ready

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

export function useWeatherData(
  config: ThingSpeakConfig,
  thresholds: Thresholds = DEFAULT_THRESHOLDS,
  simulateMqtt = false // TEMP flag — set to false and remove when hardware is ready
) {
  const [history, setHistory] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [httpLoading, setHttpLoading] = useState(false);
  const [httpError, setHttpError] = useState<string | null>(null);
  const [httpLastUpdated, setHttpLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Real MQTT (primary) ─────────────────────────────────────────────────
  const realMqtt = useMqttWeather(simulateMqtt ? { channelId: "", apiKey: "" } : config);

  // ── Simulated MQTT (TEMP — testing only) ────────────────────────────────
  const simMqtt = useMqttSimulator();

  // Pick whichever MQTT source is active
  const { current: mqttCurrent, status: mqttStatus, error: mqttError, lastUpdated: mqttLastUpdated } =
    simulateMqtt ? simMqtt : realMqtt;

  // ── HTTP polling (fallback when MQTT is not connected) ──────────────────
  const fetchData = useCallback(async () => {
    if (!config.channelId) return;
    setHttpLoading(true);
    setHttpError(null);
    try {
      const feeds = await fetchLatestFeeds(config.channelId, config.apiKey || undefined);
      setHistory(feeds);
      setHttpLastUpdated(new Date());
    } catch (err: any) {
      setHttpError(err.message || "Failed to fetch data");
    } finally {
      setHttpLoading(false);
    }
  }, [config.channelId, config.apiKey]);

  useEffect(() => {
    fetchData(); // always fetch history on mount (for charts)
    if (intervalRef.current) clearInterval(intervalRef.current);
    // Only keep polling when MQTT is not live
    if (config.channelId && mqttStatus !== "connected") {
      intervalRef.current = setInterval(fetchData, POLL_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, mqttStatus]);

  // Push every new MQTT reading into history (for charts)
  useEffect(() => {
    if (mqttCurrent) {
      setHistory((prev) => [...prev, mqttCurrent].slice(-100));
    }
  }, [mqttCurrent]);

  const httpCurrent = history.length > 0 ? history[history.length - 1] : null;
  const current = mqttCurrent ?? httpCurrent;

  useEffect(() => {
    if (current) setAlerts(generateAlerts(current, thresholds));
    if (history.length > 0) setInsights(generateInsights(history, thresholds));
  }, [current, history, thresholds]);

  const loading = httpLoading;
  const error = mqttStatus === "connected" ? null : (mqttError ?? httpError);
  const lastUpdated = mqttLastUpdated ?? httpLastUpdated;

  return { history, current, alerts, insights, loading, error, lastUpdated, mqttStatus, refetch: fetchData };
}
