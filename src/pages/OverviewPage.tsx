import { motion } from "framer-motion";
import SensorCards from "@/components/dashboard/SensorCards";
import WeatherCharts from "@/components/dashboard/WeatherCharts";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import SystemStatus from "@/components/dashboard/SystemStatus";
import { useWeather } from "@/hooks/useWeather";

export default function OverviewPage() {
  const { history, current, alerts, thresholds, lastUpdated, loading, error } = useWeather();

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Metrics</h3>
        </div>
        <SensorCards data={current} thresholds={thresholds} />
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Historical Trends</h3>
            </div>
            {/* Show only primary charts on overview */}
            <WeatherCharts history={history} />
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">System Health</h3>
            </div>
            <div className="space-y-4">
              <AlertsPanel alerts={alerts} />
              <SystemStatus
                lastUpdated={lastUpdated}
                loading={loading}
                error={error}
                dataPoints={history.length}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
