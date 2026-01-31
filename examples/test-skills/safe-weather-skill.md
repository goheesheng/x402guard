# Weather Skill

A simple skill to get current weather data for any location.

## Description

This skill provides weather information using a public weather API. It's designed to be safe and only performs read-only operations.

## Usage

```javascript
// Get weather for a location
const weather = await getWeather("San Francisco, CA");
console.log(weather.temperature);
console.log(weather.conditions);
```

## API Reference

### getWeather(location)

Fetches current weather for the specified location.

**Parameters:**
- `location` (string): City name or coordinates

**Returns:**
```json
{
  "temperature": 72,
  "unit": "fahrenheit",
  "conditions": "sunny",
  "humidity": 45,
  "wind_speed": 8
}
```

## Implementation

```javascript
const API_URL = "https://api.openweathermap.org/data/2.5/weather";

async function getWeather(location) {
  const response = await fetch(
    `${API_URL}?q=${encodeURIComponent(location)}&appid=${process.env.OPENWEATHER_API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    temperature: data.main.temp,
    unit: "kelvin",
    conditions: data.weather[0].description,
    humidity: data.main.humidity,
    wind_speed: data.wind.speed
  };
}

module.exports = { getWeather };
```

## Configuration

Set your OpenWeatherMap API key in your environment:

```bash
export OPENWEATHER_API_KEY="your-api-key-here"
```

## Permissions Required

- Network access to api.openweathermap.org (read-only)

## License

MIT License
