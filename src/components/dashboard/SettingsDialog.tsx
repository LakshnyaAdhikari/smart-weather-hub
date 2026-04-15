import { useState } from "react";
import { Settings, Save, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import type { ThingSpeakConfig, Thresholds } from "@/types/weather";
import { DEFAULT_THRESHOLDS } from "@/types/weather";

interface Props {
  config: ThingSpeakConfig;
  thresholds: Thresholds;
  onSave: (config: ThingSpeakConfig, thresholds: Thresholds) => void;
}

interface ThresholdField {
  key: keyof Thresholds;
  label: string;
  unit: string;
}

const THRESHOLD_FIELDS: ThresholdField[] = [
  { key: "tempHigh",      label: "Temperature High Alert",     unit: "°C"  },
  { key: "tempLow",       label: "Temperature Low Alert",      unit: "°C"  },
  { key: "humidityHigh",  label: "Humidity High Alert",        unit: "%"   },
  { key: "aqiWarning",    label: "AQI Warning Threshold",      unit: "raw" },
  { key: "aqiDanger",    label: "AQI Danger Threshold",       unit: "raw" },
  { key: "pressureLow",  label: "Pressure Low Alert",         unit: "hPa" },
  { key: "pressureHigh", label: "Pressure High Alert",        unit: "hPa" },
];

export default function SettingsDialog({ config, thresholds, onSave }: Props) {
  const [open, setOpen] = useState(!config.channelId);
  const [channelId, setChannelId] = useState(config.channelId);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [showThresholds, setShowThresholds] = useState(false);
  const [thresh, setThresh] = useState<Thresholds>({ ...thresholds });

  const handleSave = () => {
    onSave(
      { channelId: channelId.trim(), apiKey: apiKey.trim() },
      thresh
    );
    setOpen(false);
  };

  const handleThreshChange = (key: keyof Thresholds, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) setThresh((prev) => ({ ...prev, [key]: num }));
  };

  const resetThresholds = () => setThresh({ ...DEFAULT_THRESHOLDS });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" /> Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-glass-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">ThingSpeak Configuration</DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Enter your channel credentials and optionally customise alert thresholds.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Connection */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Channel ID *</label>
            <Input
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="e.g. 3175250"
              className="bg-secondary border-glass-border"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Read API Key (optional for public channels)</label>
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="e.g. ABCDEF1234567890"
              className="bg-secondary border-glass-border"
            />
          </div>

          {/* Field Mapping */}
          <div className="glass-card p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Field Mapping (confirmed):</p>
            <p>Field 1 → Temperature | Field 2 → Humidity</p>
            <p>Field 3 → Pressure | Field 4 → Altitude</p>
            <p>Field 5 → Air Quality | Field 6 → Rain Value</p>
            <p>Field 7 → Rain Status (0/1) | Field 8 → Poor AQI Flag</p>
          </div>

          {/* Custom Thresholds (collapsible) */}
          <div>
            <button
              type="button"
              onClick={() => setShowThresholds(!showThresholds)}
              className="flex items-center gap-2 text-sm font-medium text-foreground w-full"
            >
              {showThresholds ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Custom Alert Thresholds
              <span className="ml-auto text-[10px] text-muted-foreground">(optional)</span>
            </button>
            {showThresholds && (
              <div className="mt-3 space-y-2.5">
                {THRESHOLD_FIELDS.map(({ key, label, unit }) => (
                  <div key={key} className="flex items-center gap-3">
                    <label className="flex-1 text-xs text-muted-foreground">{label}</label>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={thresh[key]}
                        onChange={(e) => handleThreshChange(key, e.target.value)}
                        className="w-20 h-7 text-xs bg-secondary border-glass-border text-right"
                      />
                      <span className="text-xs text-muted-foreground w-8">{unit}</span>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={resetThresholds}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Reset to defaults
                </button>
              </div>
            )}
          </div>

          <Button onClick={handleSave} disabled={!channelId.trim()} className="w-full gap-2">
            <Save className="w-4 h-4" /> Connect to ThingSpeak
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
