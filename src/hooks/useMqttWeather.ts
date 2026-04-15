import { useState, useEffect, useRef, useCallback } from "react";
import type { SensorData, ThingSpeakConfig } from "@/types/weather";
import { connectMqtt } from "@/services/mqtt";

export type MqttStatus = "disconnected" | "connecting" | "connected" | "error";

export interface UseMqttWeatherResult {
  current: SensorData | null;
  status: MqttStatus;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Connects to ThingSpeak MQTT and streams the latest sensor reading.
 * Automatically cleans up on unmount or when config.channelId changes.
 */
export function useMqttWeather(config: ThingSpeakConfig): UseMqttWeatherResult {
  const [current, setCurrent] = useState<SensorData | null>(null);
  const [status, setStatus] = useState<MqttStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const disconnectRef = useRef<(() => void) | null>(null);

  const connect = useCallback(() => {
    if (!config.channelId || !config.apiKey) return;

    setStatus("connecting");
    setError(null);

    const disconnect = connectMqtt({
      channelId: config.channelId,
      apiKey: config.apiKey,
      onMessage: (data) => {
        setCurrent(data);
        setLastUpdated(new Date());
      },
      onConnect: () => setStatus("connected"),
      onError: (err) => {
        setStatus("error");
        setError(err.message || "MQTT connection error");
      },
      onDisconnect: () => {
        setStatus("disconnected");
      },
    });

    disconnectRef.current = disconnect;
  }, [config.channelId, config.apiKey]);

  useEffect(() => {
    connect();
    return () => {
      disconnectRef.current?.();
      disconnectRef.current = null;
    };
  }, [connect]);

  return { current, status, error, lastUpdated };
}
