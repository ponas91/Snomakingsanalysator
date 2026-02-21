import type { MetNoResponse, WeatherData, HourlyForecast } from '../types';

const BASE_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const url = `${BASE_URL}?lat=${lat}&lon=${lon}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Snomåkingsanalysator/1.0 (kontakt@example.com)',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Vær-API feilet: ${response.status}`);
  }

  const data: MetNoResponse = await response.json();
  
  return parseWeatherData(data);
}

function parseWeatherData(data: MetNoResponse): WeatherData {
  const timeseries = data.properties.timeseries;
  
  const hourly: HourlyForecast[] = [];
  let currentSnow = 0;
  let currentTemperature = 0;
  let currentWindSpeed = 0;

  timeseries.slice(0, 48).forEach((entry, index) => {
    const time = entry.time;
    const instant = entry.data.instant.details;
    const temp = instant.air_temperature;
    const wind = instant.wind_speed;
    
    let precipitation = 0;
    let snow = 0;

    if (entry.data.next_1_hours?.details.precipitation_amount !== undefined) {
      precipitation = entry.data.next_1_hours.details.precipitation_amount;
    } else if (entry.data.next_6_hours?.details.precipitation_amount !== undefined) {
      precipitation = entry.data.next_6_hours.details.precipitation_amount / 6;
    }

    if (temp < 2 && precipitation > 0) {
      snow = precipitation;
    }

    if (index === 0) {
      currentTemperature = temp;
      currentWindSpeed = wind;
    }

    hourly.push({
      time,
      snow: Math.round(snow * 10) / 10,
      temperature: Math.round(temp * 10) / 10,
      precipitation: Math.round(precipitation * 10) / 10,
    });
  });

  const now = new Date();
  let accumulatedSnow = 0;
  
  for (let i = 0; i < Math.min(24, hourly.length); i++) {
    const forecastTime = new Date(hourly[i].time);
    if (forecastTime >= now) {
      accumulatedSnow += hourly[i].snow;
    }
  }

  currentSnow = Math.round(accumulatedSnow * 10) / 10;

  return {
    updatedAt: new Date().toISOString(),
    current: {
      temperature: Math.round(currentTemperature * 10) / 10,
      snow: currentSnow,
      windSpeed: Math.round(currentWindSpeed * 10) / 10,
    },
    hourly,
  };
}

export function calculateSnowInPeriod(hourly: HourlyForecast[], hours: number): number {
  const now = new Date();
  let totalSnow = 0;

  for (let i = 0; i < Math.min(hours, hourly.length); i++) {
    const forecastTime = new Date(hourly[i].time);
    if (forecastTime >= now) {
      totalSnow += hourly[i].snow;
    }
  }

  return Math.round(totalSnow * 10) / 10;
}

export function isNightTime(): boolean {
  const hour = new Date().getHours();
  return hour < 9 || hour >= 18;
}

export function isDayTime(): boolean {
  return !isNightTime();
}
