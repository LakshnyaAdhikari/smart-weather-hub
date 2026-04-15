import { Activity, Clock, Database, Wifi } from "lucide-react";

interface Props {
  lastUpdated: Date | null;
  loading: boolean;
  error: string | null;
  dataPoints: number;
}

export default function SystemStatus({ lastUpdated, loading, error, dataPoints }: Props) {
  const isOnline = !error && lastUpdated !== null;

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
        <Activity className="w-4 h-4" /> System Status
      </h3>
      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-2"><Wifi className="w-3.5 h-3.5" /> Status</span>
          <span className={`font-medium ${isOnline ? "text-safe" : "text-danger"}`}>
            {loading ? "Fetching…" : isOnline ? "Online" : "Offline"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-2"><Database className="w-3.5 h-3.5" /> Source</span>
          <span className="font-medium text-foreground">ThingSpeak</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Last Update</span>
          <span className="font-mono text-xs text-foreground">
            {lastUpdated ? lastUpdated.toLocaleTimeString() : "--"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Data Points</span>
          <span className="font-mono text-xs text-foreground">{dataPoints}</span>
        </div>
        {error && (
          <div className="text-xs text-danger bg-danger/10 rounded-lg px-3 py-2 mt-2">{error}</div>
        )}
      </div>
    </div>
  );
}
