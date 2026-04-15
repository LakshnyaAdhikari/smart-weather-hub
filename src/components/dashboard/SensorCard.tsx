import { motion } from "framer-motion";
import type { StatusLevel } from "@/types/weather";

interface SensorCardProps {
  title: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  color: string;
  status: StatusLevel;
  subtitle?: string;
}

const statusRing: Record<StatusLevel, string> = {
  safe: "ring-safe/30",
  warning: "ring-warning/30",
  danger: "ring-danger/30 animate-pulse-glow",
};

const statusDot: Record<StatusLevel, string> = {
  safe: "bg-safe",
  warning: "bg-warning",
  danger: "bg-danger",
};

export default function SensorCard({ title, value, unit, icon, color, status, subtitle }: SensorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass-card-hover p-5 ring-1 ${statusRing[status]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg bg-secondary ${color}`}>
          {icon}
        </div>
        <div className={`w-2.5 h-2.5 rounded-full ${statusDot[status]}`} />
      </div>
      <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>}
    </motion.div>
  );
}
