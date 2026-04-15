import type { SensorData, AIInsight, Alert, StatusLevel, Thresholds } from "@/types/weather";
import { DEFAULT_THRESHOLDS } from "@/types/weather";

let insightCounter = 0;
const makeId = () => `insight-${++insightCounter}`;

export function generateAlerts(
  current: SensorData,
  thresholds: Thresholds = DEFAULT_THRESHOLDS
): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();

  if (current.temperature !== null && current.temperature >= thresholds.tempHigh) {
    alerts.push({ id: makeId(), type: "heat", level: "danger", message: `Extreme heat: ${current.temperature.toFixed(1)}°C exceeds ${thresholds.tempHigh}°C`, timestamp: now });
  } else if (current.temperature !== null && current.temperature <= thresholds.tempLow) {
    alerts.push({ id: makeId(), type: "heat", level: "warning", message: `Low temperature: ${current.temperature.toFixed(1)}°C below ${thresholds.tempLow}°C`, timestamp: now });
  }

  if (current.humidity !== null && current.humidity >= thresholds.humidityHigh) {
    alerts.push({ id: makeId(), type: "humidity", level: "warning", message: `High humidity: ${current.humidity.toFixed(0)}% — discomfort likely`, timestamp: now });
  }

  if (current.airQuality !== null) {
    if (current.airQuality >= thresholds.aqiDanger) {
      alerts.push({ id: makeId(), type: "aqi", level: "danger", message: `Hazardous air quality: AQI ${current.airQuality.toFixed(0)}`, timestamp: now });
    } else if (current.airQuality >= thresholds.aqiWarning) {
      alerts.push({ id: makeId(), type: "aqi", level: "warning", message: `Poor air quality: AQI ${current.airQuality.toFixed(0)}`, timestamp: now });
    }
  }

  if (current.rainStatus) {
    alerts.push({ id: makeId(), type: "rain", level: "warning", message: "Rain detected — carry an umbrella", timestamp: now });
  }

  if (current.poorAqiFlag) {
    alerts.push({ id: makeId(), type: "aqi", level: "danger", message: "ESP32 flagged poor air quality", timestamp: now });
  }

  return alerts;
}

function calcTrend(values: (number | null)[]): "rising" | "falling" | "stable" {
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length < 3) return "stable";
  const recent = valid.slice(-5);
  const avg1 = recent.slice(0, Math.floor(recent.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(recent.length / 2);
  const avg2 = recent.slice(Math.floor(recent.length / 2)).reduce((a, b) => a + b, 0) / (recent.length - Math.floor(recent.length / 2));
  const diff = avg2 - avg1;
  if (diff > 0.5) return "rising";
  if (diff < -0.5) return "falling";
  return "stable";
}

export function generateInsights(
  history: SensorData[],
  thresholds: Thresholds = DEFAULT_THRESHOLDS
): AIInsight[] {
  if (history.length < 2) return [];

  const insights: AIInsight[] = [];
  const now = new Date();
  const current = history[history.length - 1];

  // Trends
  const tempTrend = calcTrend(history.map((d) => d.temperature));
  if (tempTrend !== "stable") {
    insights.push({
      id: makeId(), category: "trend",
      title: `Temperature ${tempTrend === "rising" ? "Rising" : "Falling"}`,
      description: `Temperature has been ${tempTrend} over recent readings. Current: ${current.temperature?.toFixed(1) ?? "N/A"}°C`,
      level: tempTrend === "rising" && (current.temperature ?? 0) > 35 ? "warning" : "safe",
      icon: tempTrend === "rising" ? "TrendingUp" : "TrendingDown",
      timestamp: now,
    });
  }

  const humTrend = calcTrend(history.map((d) => d.humidity));
  if (humTrend !== "stable") {
    insights.push({
      id: makeId(), category: "trend",
      title: `Humidity ${humTrend === "rising" ? "Increasing" : "Decreasing"}`,
      description: `Humidity trend is ${humTrend}. Current: ${current.humidity?.toFixed(0) ?? "N/A"}%`,
      level: humTrend === "rising" && (current.humidity ?? 0) > 70 ? "warning" : "safe",
      icon: "Droplets",
      timestamp: now,
    });
  }

  const aqiTrend = calcTrend(history.map((d) => d.airQuality));
  if (aqiTrend !== "stable") {
    insights.push({
      id: makeId(), category: "trend",
      title: `Air Quality ${aqiTrend === "rising" ? "Worsening" : "Improving"}`,
      description: `AQI is ${aqiTrend}. Current: ${current.airQuality?.toFixed(0) ?? "N/A"}`,
      level: aqiTrend === "rising" ? "warning" : "safe",
      icon: "Wind",
      timestamp: now,
    });
  }

  // Predictions
  if (tempTrend === "rising") {
    insights.push({
      id: makeId(), category: "prediction",
      title: "Temperature Likely to Continue Rising",
      description: `Based on ${history.length} data points, expect further temperature increase in the next interval.`,
      level: (current.temperature ?? 0) > 35 ? "warning" : "safe",
      icon: "Flame",
      timestamp: now,
    });
  }

  if (current.humidity !== null && current.humidity > 70 && (current.temperature ?? 0) > 30) {
    insights.push({
      id: makeId(), category: "alert",
      title: "Heat Index Warning",
      description: `High humidity (${current.humidity.toFixed(0)}%) combined with temperature (${current.temperature?.toFixed(1)}°C) may feel significantly hotter.`,
      level: "warning",
      icon: "Thermometer",
      timestamp: now,
    });
  }

  // Rain
  const rainCount = history.slice(-10).filter((d) => d.rainStatus).length;
  if (rainCount >= 3) {
    insights.push({
      id: makeId(), category: "prediction",
      title: "Persistent Rain Expected",
      description: `Rain detected in ${rainCount} of last 10 readings. Rainfall likely to continue.`,
      level: "warning",
      icon: "CloudRain",
      timestamp: now,
    });
  }

  // Summary
  insights.push({
    id: makeId(), category: "summary",
    title: "System Summary",
    description: `Analyzing ${history.length} data points. Temp: ${current.temperature?.toFixed(1) ?? "N/A"}°C, Humidity: ${current.humidity?.toFixed(0) ?? "N/A"}%, AQI: ${current.airQuality?.toFixed(0) ?? "N/A"}. ${alerts(current, thresholds)} active alert(s).`,
    level: "safe",
    icon: "BarChart3",
    timestamp: now,
  });

  return insights;
}

function alerts(current: SensorData, thresholds: Thresholds): number {
  return generateAlerts(current, thresholds).length;
}

// Extension point for future ML model integration
export interface MLModelAdapter {
  predict(history: SensorData[]): Promise<AIInsight[]>;
}

let mlAdapter: MLModelAdapter | null = null;

export function registerMLModel(adapter: MLModelAdapter) {
  mlAdapter = adapter;
}

export async function getMLInsights(history: SensorData[]): Promise<AIInsight[]> {
  if (!mlAdapter) return [];
  return mlAdapter.predict(history);
}
