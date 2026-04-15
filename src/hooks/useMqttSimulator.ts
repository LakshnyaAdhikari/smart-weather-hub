/**
 * TEMPORARY — DISCARD WHEN HARDWARE IS READY
 *
 * Simulates MQTT live data for testing without physical sensors.
 * Emits a realistic random SensorData reading every 3 seconds and
 * reports status as "connected" immediately.
 */
import { useState, useEffect, useRef } from "react";
import type { SensorData } from "@/types/weather";
import type { MqttStatus } from "@/types/weather";

const INTERVAL_MS = 3000;

function randomBetween(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function generateFakeReading(): SensorData {
  const airQuality = randomBetween(10, 400);
  const rainValue = randomBetween(0, 4095);
  return {
    timestamp: new Date(),
    temperature: randomBetween(18, 45),
    humidity: randomBetween(30, 95),
    pressure: randomBetween(980, 1050),
    altitude: randomBetween(200, 300),
    airQuality,
    rainValue,
    rainStatus: rainValue < 1000,
    poorAqiFlag: airQuality > 150,
  };
}

export interface UseMqttSimulatorResult {
  current: SensorData | null;
  status: MqttStatus;
  error: string | null;
  lastUpdated: Date | null;
}

export function useMqttSimulator(): UseMqttSimulatorResult {
  const [current, setCurrent] = useState<SensorData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Emit first reading immediately
    const first = generateFakeReading();
    setCurrent(first);
    setLastUpdated(first.timestamp);

    timerRef.current = setInterval(() => {
      const reading = generateFakeReading();
      setCurrent(reading);
      setLastUpdated(reading.timestamp);
    }, INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    current,
    status: "connected", // always "live" for testing
    error: null,
    lastUpdated,
  };
}
