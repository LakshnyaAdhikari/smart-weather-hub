import type { ThingSpeakResponse, SensorData, ThingSpeakFeed } from "@/types/weather";

const BASE_URL = "https://api.thingspeak.com";

export function parseFeed(feed: ThingSpeakFeed): SensorData {
  return {
    timestamp: new Date(feed.created_at),
    temperature: feed.field1 ? parseFloat(feed.field1) : null,
    humidity: feed.field2 ? parseFloat(feed.field2) : null,
    pressure: feed.field3 ? parseFloat(feed.field3) : null,
    altitude: feed.field4 ? parseFloat(feed.field4) : null,
    airQuality: feed.field5 ? parseFloat(feed.field5) : null,
    rainValue: feed.field6 ? parseFloat(feed.field6) : null,
    rainStatus: false, // Deprecated, replaced by AI
    poorAqiFlag: false, // Deprecated, replaced by AI
    aiPrediction: feed.field7 ? parseFloat(feed.field7) : null,
    aiConfidence: feed.field8 ? parseFloat(feed.field8) : null,
  };
}

export async function fetchLatestFeeds(
  channelId: string,
  apiKey?: string,
  results = 100
): Promise<SensorData[]> {
  const params = new URLSearchParams({ results: String(results) });
  if (apiKey) params.set("api_key", apiKey);

  const res = await fetch(
    `${BASE_URL}/channels/${channelId}/feeds.json?${params}`
  );
  if (!res.ok) throw new Error(`ThingSpeak error: ${res.status} ${res.statusText}`);

  const data: ThingSpeakResponse = await res.json();
  return data.feeds.map(parseFeed);
}

export async function fetchChannelInfo(channelId: string, apiKey?: string) {
  const params = new URLSearchParams({ results: "0" });
  if (apiKey) params.set("api_key", apiKey);

  const res = await fetch(
    `${BASE_URL}/channels/${channelId}/feeds.json?${params}`
  );
  if (!res.ok) throw new Error(`ThingSpeak error: ${res.status}`);

  const data: ThingSpeakResponse = await res.json();
  return data.channel;
}
