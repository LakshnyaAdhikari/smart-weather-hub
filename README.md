# Smart Weather Hub

A real-time weather monitoring dashboard for environmental sensors connected to an ESP32 microcontroller, streaming telemetry to ThingSpeak.

## Architecture

- **Publisher (ESP32):** Reads physical sensors and streams data directly to ThingSpeak over MQTT. Falls back to HTTP POST if MQTT is disconnected.
- **Broker (ThingSpeak):** Stores and routes structured channel feeds.
- **Subscriber (React Dashboard):** Connects via WebSockets MQTT for real-time live updates, falling back to HTTP REST polling.

## Channel Field Mapping

- **Field 1:** Temperature (°C)
- **Field 2:** Humidity (%)
- **Field 3:** Pressure (hPa)
- **Field 4:** Altitude (m)
- **Field 5:** Air Quality (AQI)
- **Field 6:** Rain Value (analog intensity)
- **Field 7:** AI Prediction (0 = Clear, 1 = Storm)
- **Field 8:** AI Confidence (0-100%)

## Key Features

- **Environmental Telemetry:** Live indicators for Temperature, Humidity, AQI, Pressure, Altitude, and Rain status.
- **Temporal Storm Heatmap:** A 4x4 grid displaying confidence values. Toggle between "April Storm Tracker" (simulated historical storm sequence showing variation in intensities) and "Live Stream" (live data from ThingSpeak history).
- **Intelligence Engine:** Analyzes data trends and triggers warning banners (heat index warnings, persistent rain, AQI alerts) based on customizable thresholds stored in localStorage.
- **System Diagnostics:** Live MQTT connection status badges (connecting, connected, error, disconnected) and an offline simulation mode.

## Setup and Running

1. **Install Dependencies:**
   ```bash
   npm install
   # or
   bun install
