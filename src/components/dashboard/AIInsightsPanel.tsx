import { Brain, TrendingUp, TrendingDown, Lightbulb, BarChart3, Flame, CloudRain, Droplets, Wind, Thermometer } from "lucide-react";
import { motion } from "framer-motion";
import type { AIInsight } from "@/types/weather";

const iconMap: Record<string, React.ReactNode> = {
  TrendingUp: <TrendingUp className="w-4 h-4" />,
  TrendingDown: <TrendingDown className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
  CloudRain: <CloudRain className="w-4 h-4" />,
  Droplets: <Droplets className="w-4 h-4" />,
  Wind: <Wind className="w-4 h-4" />,
  Thermometer: <Thermometer className="w-4 h-4" />,
  BarChart3: <BarChart3 className="w-4 h-4" />,
};

const categoryColors = {
  trend: "border-primary/30 bg-primary/5",
  prediction: "border-accent/30 bg-accent/5",
  alert: "border-warning/30 bg-warning/5",
  summary: "border-safe/30 bg-safe/5",
};

const categoryLabel = {
  trend: "Trend",
  prediction: "Prediction",
  alert: "Alert",
  summary: "Summary",
};

export default function AIInsightsPanel({ insights }: { insights: AIInsight[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold text-foreground">AI Insights</h2>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Rule-based</span>
      </div>

      {insights.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Waiting for enough data to generate insights…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((insight, i) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-4 border ${categoryColors[insight.category]}`}
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-md bg-secondary text-foreground">
                  {iconMap[insight.icon] ?? <Lightbulb className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                      {categoryLabel[insight.category]}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-0.5">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="glass-card p-4 border border-dashed border-muted-foreground/20">
        <p className="text-xs text-muted-foreground">
          <strong>Extensibility:</strong> This module supports plugging in ML models (TensorFlow.js / Python .pkl) via the <code className="font-mono text-primary">registerMLModel()</code> API. See <code className="font-mono">src/services/ai-insights.ts</code>.
        </p>
      </div>
    </div>
  );
}
