import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
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
  { key: "temperature", label: "Temperature (°C)", color: "hsl(15, 90%, 55%)", dataKey: "temperature" },
  { key: "humidity", label: "Humidity (%)", color: "hsl(199, 89%, 48%)", dataKey: "humidity" },
  { key: "airQuality", label: "Air Quality (AQI)", color: "hsl(38, 92%, 50%)", dataKey: "airQuality" },
  { key: "rainValue", label: "Rain Value", color: "hsl(210, 70%, 55%)", dataKey: "rainValue" },
] as const;

export default function WeatherCharts({ history }: Props) {
  const chartData = useMemo(
    () => history.map((d) => ({
      time: formatTime(d.timestamp),
      temperature: d.temperature,
      humidity: d.humidity,
      airQuality: d.airQuality,
      rainValue: d.rainValue,
    })),
    [history]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {chartConfigs.map((cfg) => (
        <div key={cfg.key} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">{cfg.label}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`grad-${cfg.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cfg.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={cfg.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis dataKey="time" stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} />
              <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(222, 41%, 10%)",
                  border: "1px solid hsl(222, 30%, 22%)",
                  borderRadius: "8px",
                  fontSize: 12,
                  color: "hsl(210, 40%, 96%)",
                }}
              />
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
