import { AlertTriangle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Alert } from "@/types/weather";

const levelStyles = {
  safe: "border-safe/30 bg-safe/5 text-safe",
  warning: "border-warning/30 bg-warning/5 text-warning",
  danger: "border-danger/30 bg-danger/5 text-danger",
};

export default function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" /> Active Alerts
      </h3>
      {alerts.length === 0 ? (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Info className="w-4 h-4 text-safe" /> All systems nominal
        </p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          <AnimatePresence>
            {alerts.map((a) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`text-sm px-3 py-2 rounded-lg border ${levelStyles[a.level]}`}
              >
                {a.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
