import { useMemo } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";
import type { SensorData } from "@/types/weather";

interface Props {
  history: SensorData[];
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const chartConfigs = [
  { key: "temperature", label: "Temperature (°C)", color: "hsl(15, 90%, 55%)",  dataKey: "temperature" },
  { key: "humidity",    label: "Humidity (%)",     color: "hsl(199, 89%, 48%)", dataKey: "humidity" },
  { key: "airQuality",  label: "Air Quality (AQI)", color: "hsl(38, 92%, 50%)", dataKey: "airQuality" },
  { key: "rainValue",   label: "Rain Value",        color: "hsl(210, 70%, 55%)", dataKey: "rainValue" },
  { key: "pressure",    label: "Pressure (hPa)",    color: "hsl(262, 83%, 58%)", dataKey: "pressure" },
  { key: "altitude",    label: "Altitude (m)",      color: "hsl(168, 74%, 45%)", dataKey: "altitude" },
] as const;

// Tooltip style that reads --card / --foreground CSS vars for light/dark compat
const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--glass-border))",
  borderRadius: "8px",
  fontSize: 12,
  color: "hsl(var(--foreground))",
};

export default function WeatherCharts({ history }: Props) {
  const chartData = useMemo(
    () => history.map((d) => ({
      time: formatTime(d.timestamp),
      temperature: d.temperature,
      humidity: d.humidity,
      airQuality: d.airQuality,
      rainValue: d.rainValue,
      pressure: d.pressure,
      altitude: d.altitude,
    })),
    [history]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {chartConfigs.map((cfg) => (
        <div key={cfg.key} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">{cfg.label}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`grad-${cfg.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={cfg.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={cfg.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey={cfg.dataKey}
                stroke={cfg.color}
                fill={`url(#grad-${cfg.key})`}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}
