import AIInsightsPanel from "@/components/dashboard/AIInsightsPanel";
import AIHeatmap from "@/components/dashboard/AIHeatmap";
import { useWeather } from "@/hooks/useWeather";

export default function InsightsPage() {
  const { insights, history } = useWeather();

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-widest mb-2 font-mono">Intelligence Engine</h3>
        <h2 className="text-3xl font-black text-foreground mb-4 italic tracking-tight underline decoration-primary/30 underline-offset-8">AI Weather Insights</h2>
        <p className="text-muted-foreground leading-relaxed">
          Our rule-based intelligence system analyzes patterns in your IoT sensor data to provide real-time alerts and future predictions.
        </p>
      </header>

      <AIHeatmap history={history} />

      <div className="bg-secondary/30 rounded-3xl p-8 border border-border/50 backdrop-blur-sm shadow-2xl mt-12">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
           Rule-Based Engine <span className="text-xs font-normal text-muted-foreground bg-background px-2 py-1 rounded-full border">Legacy System</span>
        </h3>
        <AIInsightsPanel insights={insights} />
      </div>
    </div>
  );
}
