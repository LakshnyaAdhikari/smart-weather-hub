import { motion } from "framer-motion";
import SensorCards from "@/components/dashboard/SensorCards";
import WeatherCharts from "@/components/dashboard/WeatherCharts";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import SystemStatus from "@/components/dashboard/SystemStatus";
import { useWeather } from "@/hooks/useWeather";

export default function OverviewPage() {
  const { history, current, alerts, thresholds } = useWeather();

  return (
    <div className="space-y-12">
      {/* Metrics Row (3x2 Grid) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Environmental Live Feed</h3>
        </div>
        <SensorCards data={current} thresholds={thresholds} />
      </section>

      {/* Historical Trends section (Now full width 3x2 Grid) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Historical Analytics (24h)</h3>
        </div>
        <WeatherCharts history={history} />
      </section>
    </div>
  );
}
