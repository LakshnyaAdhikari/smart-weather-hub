import SettingsDialog from "@/components/dashboard/SettingsDialog";
import { useWeather } from "@/hooks/useWeather";
import { Settings as SettingsIcon, ShieldCheck, Database, Server } from "lucide-react";

export default function SettingsPage() {
  const { config, thresholds, updateConfig } = useWeather();

  const handleSave = (c: any, t: any) => {
    updateConfig(c, t);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      <header className="space-y-4 text-center">
        <div className="inline-flex p-3 rounded-2xl bg-secondary/50 border border-border/50 mx-auto">
          <SettingsIcon className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight">System Configuration</h2>
          <p className="text-muted-foreground">Manage your cloud connectivity and heuristic alert thresholds.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Connection Status Card */}
        <div className="glass-card p-8 space-y-6 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-bold">Cloud Connection</h4>
              <p className="text-xs text-muted-foreground">ThingSpeak REST API</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Channel ID</label>
              <div className="px-3 py-2 bg-secondary/50 rounded-lg font-mono text-sm border border-border/50">
                {config.channelId || "Not Set"}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">API Security</label>
              <div className="px-3 py-2 bg-secondary/50 rounded-lg font-mono text-sm border border-border/50 truncate">
                {config.apiKey ? "********" : "Public Access"}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <SettingsDialog config={config} thresholds={thresholds} onSave={handleSave} />
          </div>
        </div>

        {/* Security & Intelligence Card */}
        <div className="glass-card p-8 space-y-6 border-accent/20">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-accent/10">
              <ShieldCheck className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h4 className="font-bold">Alert Integrity</h4>
              <p className="text-xs text-muted-foreground">Rule-based thresholds</p>
            </div>
          </div>

          <div className="space-y-3">
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Monitoring Active</span>
                <span className="text-safe font-bold">YES</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Custom Thresholds</span>
                <span className="text-accent font-bold">ENABLED</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">ML Extensibility</span>
                <span className="text-primary font-bold">READY</span>
             </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-[11px] leading-relaxed text-muted-foreground">
             <p className="font-bold text-foreground mb-1 flex items-center gap-1.5">
                <Server className="w-3 h-3" /> Technical Note
             </p>
             Thresholds are stored locally in your browser's persistent storage. They are used by the AI Engine to flag anomalies in real-time.
          </div>
        </div>
      </div>
    </div>
  );
}
