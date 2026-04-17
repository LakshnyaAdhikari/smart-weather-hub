import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { SensorData, ThingSpeakConfig, Alert, AIInsight, Thresholds, MqttStatus } from "@/types/weather";
import { DEFAULT_THRESHOLDS } from "@/types/weather";
import { fetchLatestFeeds } from "@/services/thingspeak";
import { generateAlerts, generateInsights } from "@/services/ai-insights";
import { useMqttWeather } from "@/hooks/useMqttWeather";
import { useMqttSimulator } from "@/hooks/useMqttSimulator";

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
  mqttStatus: MqttStatus;
  simulateMqtt: boolean;
  useMqtt: boolean;
  refetch: () => Promise<void>;
  updateConfig: (config: ThingSpeakConfig, thresholds: Thresholds) => void;
  toggleSimulateMqtt: () => void;
  toggleUseMqtt: () => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ThingSpeakConfig>(loadConfig);
  const [thresholds, setThresholds] = useState<Thresholds>(loadThresholds);
  const [history, setHistory] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [httpLoading, setHttpLoading] = useState(false);
  const [httpError, setHttpError] = useState<string | null>(null);
  const [httpLastUpdated, setHttpLastUpdated] = useState<Date | null>(null);
  const [simulateMqtt, setSimulateMqtt] = useState(false);
  const [useMqtt, setUseMqtt] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Real MQTT ───────────────────────────────────────────────────────────
  // Disconnect if simulating OR if useMqtt is toggled off
  const realMqtt = useMqttWeather((simulateMqtt || !useMqtt) ? { channelId: "", apiKey: "" } : config);

  // ── Simulated MQTT ──────────────────────────────────────────────────────
  const simMqtt = useMqttSimulator();

  const { current: mqttCurrent, status: mqttStatus, error: mqttError, lastUpdated: mqttLastUpdated } =
    simulateMqtt ? simMqtt : realMqtt;

  // ── HTTP fallback ───────────────────────────────────────────────────────
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
  }, [config.channelId, config.apiKey, thresholds]);

  useEffect(() => {
    fetchData();
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (config.channelId && mqttStatus !== "connected") {
      intervalRef.current = setInterval(fetchData, POLL_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, mqttStatus, config.channelId]);

  // Push MQTT readings into history
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

  const updateConfig = (newConfig: ThingSpeakConfig, newThresholds: Thresholds) => {
    saveConfig(newConfig);
    saveThresholds(newThresholds);
    setConfig(newConfig);
    setThresholds(newThresholds);
  };

  const loading = httpLoading;
  const error = mqttStatus === "connected" ? null : (mqttError ?? httpError);
  const lastUpdated = mqttLastUpdated ?? httpLastUpdated;

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
        mqttStatus,
        simulateMqtt,
        useMqtt,
        refetch: fetchData,
        updateConfig,
        toggleSimulateMqtt: () => setSimulateMqtt((v) => !v),
        toggleUseMqtt: () => setUseMqtt((v) => !v),
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
