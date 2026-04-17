import mqtt, { type MqttClient } from "mqtt"; 
import { parseFeed } from "./thingspeak";
import type { SensorData, ThingSpeakFeed } from "@/types/weather";

export interface MqttConnectionOptions {
  channelId: string;
  apiKey: string; // ThingSpeak uses the Read API Key as username/password
  onMessage: (data: SensorData) => void;
  onConnect?: () => void;
  onError?: (err: Error) => void;
  onDisconnect?: () => void;
}

const THINGSPEAK_BROKER = "wss://mqtt3.thingspeak.com:443/mqtt";

/**
 * Connects to the ThingSpeak MQTT broker and subscribes to all fields
 * of the given channel. Returns a cleanup function (disconnect).
 */
export function connectMqtt(opts: MqttConnectionOptions): () => void {
  const { channelId, apiKey, onMessage, onConnect, onError, onDisconnect } = opts;

  // ThingSpeak MQTT topic for all fields of a channel
  const topic = `channels/${channelId}/subscribe/fields/+`;

  const client: MqttClient = mqtt.connect(THINGSPEAK_BROKER, {
    clientId: import.meta.env.VITE_MQTT_CLIENT_ID || `smart-weather-hub-${Math.random().toString(16).slice(2, 8)}`,
    username: import.meta.env.VITE_MQTT_USERNAME || apiKey,      // Use env var first, then fallback
    password: import.meta.env.VITE_MQTT_PASSWORD || apiKey,      // Use env var first, then fallback
    clean: true,
    reconnectPeriod: 5000, // auto-reconnect every 5 s
    connectTimeout: 10_000,
    keepalive: 60,
    protocolVersion: 4,
  });

  client.on("connect", () => {
    client.subscribe(topic, { qos: 0 });
    onConnect?.();
  });

  client.on("message", (_topic: string, payload: Buffer) => {
    try {
      const raw = JSON.parse(payload.toString()) as ThingSpeakFeed;
      const parsed = parseFeed(raw);
      onMessage(parsed);
    } catch {
      // ignore malformed messages
    }
  });

  client.on("error", (err: Error) => {
    onError?.(err);
  });

  client.on("close", () => {
    onDisconnect?.();
  });

  // Return a cleanup / disconnect function
  return () => {
    client.end(true);
  };
}
