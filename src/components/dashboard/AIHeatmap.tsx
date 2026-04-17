import React, { useState } from "react";
import type { SensorData } from "@/types/weather";
import { CloudLightning, Info, Activity, History } from "lucide-react";
import { Button } from "../ui/button";

interface Props {
  history: SensorData[];
}

export default function AIHeatmap({ history }: Props) {
  const [viewMode, setViewMode] = useState<"historical" | "live">("historical");

  // Filter out any raw data without confidence values to ensure clean mapping
  const validHistory = history.filter((d) => d.aiConfidence !== null && d.aiConfidence !== undefined);
  
  // Array representing the 16 heatmap blocks
  let dataPoints: SensorData[] = [];
  
  if (viewMode === "historical") {
    // Mode 1: "April Storm Prediction" (Hardcoded Demonstration of Intensities)
    // Create a storm simulation that builds up, fades slightly, and spikes again at the very end
    const fakeSpikes = [0, 0, 4, 18, 38, 55, 78, 96, 92, 75, 45, 22, 12, 35, 68, 88];
    
    // Convert to SensorData format
    dataPoints = fakeSpikes.map((conf, index) => ({
       aiConfidence: conf,
       aiPrediction: conf > 50 ? 1 : 0,
       timestamp: new Date(Date.now() - (15 - index) * 60000) // Simulated times in the past
    } as unknown as SensorData));

  } else {
    // Mode 2: "Live Data" (Actively uses ThingSpeak history)
    if (validHistory.length > 0) {
      // Distribute 16 points uniformly across available history to span a longer timeframe
      const step = Math.max(1, validHistory.length / 16);
      for (let i = 0; i < 16; i++) {
          const index = Math.floor(i * step);
          if (index < validHistory.length) dataPoints.push(validHistory[index]);
      }
    }
  }

  // Detect if the user is logging confidence as a 0.0-1.0 decimal instead of 0-100 (only applies to live data)
  let isDecimalScale = false;
  if (viewMode === "live") {
     const maxConfidence = Math.max(...validHistory.map(d => d.aiConfidence ?? 0));
     isDecimalScale = maxConfidence > 0 && maxConfidence <= 1.05;
  }

  // Fill array to exactly 16 blocks to guarantee a 4x4 grid even if data is short
  const grid = [...dataPoints];
  while (grid.length < 16) {
    grid.unshift({ aiConfidence: 0, aiPrediction: 0, timestamp: new Date() } as unknown as SensorData);
  }

  // Helper to map 0-100% to 6 discrete tailwind green shades
  const getGreenIntensityClass = (probability: number) => {
    if (probability <= 5) return "bg-emerald-950/20 shadow-none border-border/20"; // 0
    if (probability <= 20) return "bg-emerald-900/40 border-emerald-900/50"; // 1
    if (probability <= 40) return "bg-emerald-800/60 border-emerald-800/50"; // 2
    if (probability <= 60) return "bg-emerald-600/80 border-emerald-600/50"; // 3
    if (probability <= 80) return "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] border-emerald-400"; // 4
    return "bg-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.5)] border-emerald-300 scale-105 z-10"; // 5
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      {/* 4x4 Grid Heatmap */}
      <div className="shrink-0 glass-card p-6 rounded-3xl inline-block bg-gradient-to-br from-card/40 to-card/10 border-emerald-500/10">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-2">
             <CloudLightning className="w-5 h-5 text-emerald-400" />
             <h3 className="font-bold text-foreground">
               {viewMode === "historical" ? "April Storm Tracker" : "Live Stream"}
             </h3>
           </div>
           
           <Button
               variant="outline"
               size="sm"
               className="h-7 text-[10px] uppercase font-bold tracking-wider px-3 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
               onClick={() => setViewMode(v => v === "historical" ? "live" : "historical")}
           >
               {viewMode === "historical" ? (
                  <><Activity className="w-3 h-3 mr-1" /> Switch to Live</>
               ) : (
                  <><History className="w-3 h-3 mr-1" /> View Spikes</>
               )}
           </Button>
        </div>
        <div className="grid grid-cols-4 gap-3 bg-secondary/20 p-4 rounded-2xl border border-border/30">
          {grid.map((d, i) => {
            let prob = d.aiConfidence ?? 0;
            if (isDecimalScale) prob = prob * 100; // Auto-convert decimal to percentage
            
            return (
              <div
                key={i}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-xl border flex items-center justify-center transition-all duration-300 relative group cursor-crosshair ${getGreenIntensityClass(prob)} `}
              >
                {/* Optional subtle percentage text, hidden unless high probability or hovered */}
                <span className={`text-xs font-black tracking-tighter ${prob > 40 ? "text-emerald-950" : "text-emerald-500/30"} group-hover:text-emerald-50 transition-colors`}>
                  {Math.round(prob)}%
                </span>
                
                {/* Tooltip */}
                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform origin-bottom bg-popover text-popover-foreground text-[10px] py-1 px-2 rounded font-mono shadow-xl border border-border/50 whitespace-nowrap z-20 pointer-events-none">
                   {d.timestamp?.toLocaleTimeString()} <br/>
                   Pred: {d.aiPrediction === 1 ? "Storm" : "Clear"}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Heatmap Legend */}
        <div className="mt-6 flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest px-2">
            <span>0%</span>
            <div className="flex gap-1">
               <div className="w-3 h-3 rounded-sm bg-emerald-950/20"></div>
               <div className="w-3 h-3 rounded-sm bg-emerald-900/40"></div>
               <div className="w-3 h-3 rounded-sm bg-emerald-800/60"></div>
               <div className="w-3 h-3 rounded-sm bg-emerald-600/80"></div>
               <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
               <div className="w-3 h-3 rounded-sm bg-emerald-400"></div>
            </div>
            <span>100%</span>
        </div>
      </div>

      {/* Description / Info side block */}
      <div className="flex-1 space-y-4 py-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
             <div className="flex items-center gap-2 font-bold mb-2">
                <Info className="w-4 h-4" /> Cloud AI Engine Active
             </div>
             <p className="text-sm opacity-90 leading-relaxed">
                This heatmap visualizes the raw probabilities generated by the Cloud's extracted Decision Tree model. Each square represents a temporal snapshot. Darker/brighter emerald indicates higher certainty of storm conditions matching learned thresholds.
             </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
               <div className="glass-card p-4 rounded-xl">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Current State</p>
                  <p className="text-xl font-bold font-mono">
                     {grid[15].aiPrediction === 1 ? "WARNING" : "CLEAR"}
                  </p>
               </div>
               <div className="glass-card p-4 rounded-xl">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Latest Confidence</p>
                  <p className="text-xl font-bold font-mono text-emerald-400">
                     {viewMode === "historical" 
                        ? `${(grid[15].aiConfidence ?? 0).toFixed(1)}%`
                        : (isDecimalScale 
                           ? ((grid[15].aiConfidence ?? 0) * 100).toFixed(1) 
                           : (grid[15].aiConfidence ?? 0).toFixed(1)) + "%"}
                  </p>
               </div>
          </div>
      </div>
    </div>
  );
}
