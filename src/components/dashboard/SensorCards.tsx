import { Thermometer, Droplets, Wind, Gauge, Mountain, CloudRain } from "lucide-react";
import SensorCard from "./SensorCard";
import type { SensorData, StatusLevel, Thresholds } from "@/types/weather";
import { DEFAULT_THRESHOLDS } from "@/types/weather";

function getStatus(val: number | null, low: number, high: number): StatusLevel {
  if (val === null) return "safe";
  if (val >= high) return "danger";
  if (val >= low) return "warning";
  return "safe";
}

interface Props {
  data: SensorData | null;
  thresholds?: Thresholds;
}

export default function SensorCards({ data, thresholds = DEFAULT_THRESHOLDS }: Props) {
  if (!data) return null;

  const cards = [
    {
      title: "Temperature",
      value: data.temperature?.toFixed(1) ?? "--",
      unit: "°C",
      icon: <Thermometer className="w-5 h-5" />,
      color: "text-temp",
      status: getStatus(data.temperature, thresholds.tempHigh - 5, thresholds.tempHigh),
      subtitle: data.temperature !== null && data.temperature > 30 ? "Above comfort zone" : undefined,
    },
    {
      title: "Humidity",
      value: data.humidity?.toFixed(0) ?? "--",
      unit: "%",
      icon: <Droplets className="w-5 h-5" />,
      color: "text-humidity",
      status: getStatus(data.humidity, 65, thresholds.humidityHigh),
    },
    {
      title: "Air Quality",
      value: data.airQuality?.toFixed(0) ?? "--",
      unit: "AQI",
      icon: <Wind className="w-5 h-5" />,
      color: "text-aqi",
      status: getStatus(data.airQuality, thresholds.aqiWarning, thresholds.aqiDanger),
      subtitle: data.poorAqiFlag ? "⚠ ESP32 poor AQI flag" : undefined,
    },
    {
      title: "Pressure",
      value: data.pressure?.toFixed(1) ?? "--",
      unit: "hPa",
      icon: <Gauge className="w-5 h-5" />,
      color: "text-pressure",
      status: "safe" as StatusLevel,
    },
    {
      title: "Altitude",
      value: data.altitude?.toFixed(1) ?? "--",
      unit: "m",
      icon: <Mountain className="w-5 h-5" />,
      color: "text-altitude",
      status: "safe" as StatusLevel,
    },
    {
      title: "Rain",
      value: data.rainStatus ? "Raining" : "Dry",
      unit: data.rainValue !== null ? `Intensity: ${data.rainValue.toFixed(0)}` : "",
      icon: <CloudRain className="w-5 h-5" />,
      color: "text-rain",
      status: data.rainStatus ? "warning" as StatusLevel : "safe" as StatusLevel,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((c) => (
        <SensorCard key={c.title} {...c} />
      ))}
    </div>
  );
}
