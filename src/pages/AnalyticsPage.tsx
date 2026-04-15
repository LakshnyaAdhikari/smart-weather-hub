import WeatherCharts from "@/components/dashboard/WeatherCharts";
import { useWeather } from "@/hooks/useWeather";
import { BarChart3, Clock, Database } from "lucide-react";

export default function AnalyticsPage() {
  const { history } = useWeather();

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-widest">
            <BarChart3 className="w-3.5 h-3.5" />
            Data Visualization
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Deep Analytics</h2>
          <p className="text-muted-foreground max-w-md">Comprehensive view of all weather parameters collected from your sensors.</p>
        </div>

        <div className="flex gap-4">
          <div className="glass-card px-4 py-2 border-primary/20 bg-primary/5 flex items-center gap-3">
            <Database className="w-4 h-4 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Samples</p>
              <p className="text-sm font-mono font-bold leading-none">{history.length}</p>
            </div>
          </div>
          <div className="glass-card px-4 py-2 border-accent/20 bg-accent/5 flex items-center gap-3">
            <Clock className="w-4 h-4 text-accent" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Window</p>
              <p className="text-sm font-mono font-bold leading-none">24h</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <section className="space-y-6">
          <div className="bg-secondary/20 rounded-[2rem] p-8 border border-border/50 shadow-inner">
             {/* WeatherCharts now contains all 6 charts including Altitude and Pressure */}
            <WeatherCharts history={history} />
          </div>
        </section>
      </div>
    </div>
  );
}
