import AIInsightsPanel from "@/components/dashboard/AIInsightsPanel";
import { useWeather } from "@/hooks/useWeather";

export default function InsightsPage() {
  const { insights } = useWeather();

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-widest mb-2 font-mono">Intelligence Engine</h3>
        <h2 className="text-3xl font-black text-foreground mb-4 italic tracking-tight underline decoration-primary/30 underline-offset-8">AI Weather Insights</h2>
        <p className="text-muted-foreground leading-relaxed">
          Our rule-based intelligence system analyzes patterns in your IoT sensor data to provide real-time alerts and future predictions.
        </p>
      </header>

      <div className="bg-secondary/30 rounded-3xl p-8 border border-border/50 backdrop-blur-sm shadow-2xl">
        <AIInsightsPanel insights={insights} />
      </div>
    </div>
  );
}
