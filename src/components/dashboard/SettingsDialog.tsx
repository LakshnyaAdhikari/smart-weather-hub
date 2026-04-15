import { useState } from "react";
import { Settings, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { ThingSpeakConfig } from "@/types/weather";

interface Props {
  config: ThingSpeakConfig;
  onSave: (config: ThingSpeakConfig) => void;
}

export default function SettingsDialog({ config, onSave }: Props) {
  const [open, setOpen] = useState(!config.channelId);
  const [channelId, setChannelId] = useState(config.channelId);
  const [apiKey, setApiKey] = useState(config.apiKey);

  const handleSave = () => {
    onSave({ channelId: channelId.trim(), apiKey: apiKey.trim() });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" /> Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-glass-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">ThingSpeak Configuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Channel ID *</label>
            <Input
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="e.g. 123456"
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
          <div className="glass-card p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Field Mapping:</p>
            <p>Field 1 → Temperature | Field 2 → Humidity</p>
            <p>Field 3 → Pressure | Field 4 → Altitude</p>
            <p>Field 5 → Air Quality | Field 6 → Rain Value</p>
            <p>Field 7 → Rain Status | Field 8 → Poor AQI Flag</p>
          </div>
          <Button onClick={handleSave} disabled={!channelId.trim()} className="w-full gap-2">
            <Save className="w-4 h-4" /> Connect to ThingSpeak
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
