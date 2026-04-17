export interface ThingSpeakFeed {
  created_at: string;
  entry_id: number;
  field1: string | null; // Temperature
  field2: string | null; // Humidity
  field3: string | null; // Pressure
  field4: string | null; // Altitude
  field5: string | null; // Air Quality
  field6: string | null; // Rain Value
  field7: string | null; // Rain Status (0/1)
  field8: string | null; // Poor AQI Flag
}

export interface ThingSpeakResponse {
  channel: {
    id: number;
    name: string;
    description: string;
    latitude: string;
    longitude: string;
    created_at: string;
    updated_at: string;
    last_entry_id: number;
  };
  feeds: ThingSpeakFeed[];
}

export interface SensorData {
  timestamp: Date;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
  altitude: number | null;
  airQuality: number | null;
  rainValue: number | null;
  rainStatus: boolean;
  poorAqiFlag: boolean;
  aiPrediction: number | null;
  aiConfidence: number | null;
}

export interface ThingSpeakConfig {
  channelId: string;
  apiKey: string;
}

/** MQTT connection status */
export type MqttStatus = "disconnected" | "connecting" | "connected" | "error";

export type StatusLevel = "safe" | "warning" | "danger";

export interface Alert {
  id: string;
  type: "heat" | "humidity" | "aqi" | "rain" | "pressure";
  level: StatusLevel;
  message: string;
  timestamp: Date;
}

export interface AIInsight {
  id: string;
  category: "trend" | "prediction" | "alert" | "summary";
  title: string;
  description: string;
  level: StatusLevel;
  icon: string;
  timestamp: Date;
}

export interface Thresholds {
  tempHigh: number;
  tempLow: number;
  humidityHigh: number;
  aqiWarning: number;
  aqiDanger: number;
  pressureLow: number;
  pressureHigh: number;
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  tempHigh: 40,
  tempLow: 5,
  humidityHigh: 80,
  aqiWarning: 150,
  aqiDanger: 300,
  pressureLow: 980,
  pressureHigh: 1050,
};
