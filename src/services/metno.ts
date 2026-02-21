import type { MetNoResponse, WeatherData, HourlyForecast, PrecipitationType } from '../types';

const BASE_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';

const weatherConditionEmojis: Record<string, string> = {
  clearsky: '☀️',
  partlycloudy: '⛅',
  cloudy: '☁️',
  fog: '🌫️',
  fair: '🌤️',
  lightrainshowers: '🌦️',
  rainshowers: '🌧️',
  rain: '🌧️',
  heavysql: '❄️',
  snow: '❄️',
  lightssnowshowers: '🌨️',
  snowshowers: '🌨️',
  sleet: '🌨️',
  sleetshowers: '🌨️',
  lightrain: '🌧️',
  heavyrain: '🌧️',
  thunderstorm: '⛈️',
  lightssleetshowers: '🌨️',
  heavysnow: '❄️',
  lightssnow: '🌨️',
  heavysnowshowers: '🌨️',
  lightrainandSnow: '🌨️',
  rainandSnow: '🌨️',
  unknown: '☀️',
};

const weatherConditionLabels: Record<string, string> = {
  clearsky: 'Klarvær',
  partlycloudy: 'Delvis skyet',
  cloudy: 'Skyet',
  fog: 'Dis',
  fair: 'Pent',
  lightrainshowers: 'Lette regnbyger',
  rainshowers: 'Regnbyger',
  rain: 'Regn',
  heavysql: 'Kraftig snø',
  snow: 'Snø',
  lightssnowshowers: 'Lette snøbyger',
  snowshowers: 'Snøbyger',
  sleet: 'Sludd',
  sleetshowers: 'Sluddbyger',
  lightrain: 'Lett regn',
  heavyrain: 'Kraftig regn',
  thunderstorm: 'Tordenvær',
  lightssleetshowers: 'Lette sluddbyger',
  heavysnow: 'Kraftig snø',
  lightssnow: 'Lett snø',
  heavysnowshowers: 'Kraftige snøbyger',
  lightrainandSnow: 'Regn og snø',
  rainandSnow: 'Regn og snø',
  unknown: 'Klarvær',
};

export function getWeatherConditionEmoji(condition: string): string {
  return weatherConditionEmojis[condition] || '☀️';
}

export function getWeatherConditionLabel(condition: string): string {
  return weatherConditionLabels[condition] || 'Klarvær';
}

function getPrecipitationType(temp: number, precip: number): PrecipitationType {
  if (precip <= 0) return 'rain';
  if (temp < 0.5) return 'snow';
  if (temp < 3) return 'sleet';
  return 'rain';
}

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
  let currentPrecipitationType: PrecipitationType = 'rain';
  let currentWeatherCondition = 'clearsky';
  let currentPrecipitation = 0;
  let currentTemperature = 0;
  let currentWindSpeed = 0;

  timeseries.slice(0, 48).forEach((entry, index) => {
    const time = entry.time;
    const instant = entry.data.instant.details;
    const temp = instant.air_temperature;
    const wind = instant.wind_speed;
    
    const hasNext1Hours = entry.data.next_1_hours?.details?.precipitation_amount !== undefined;
    const hasNext6Hours = entry.data.next_6_hours?.details?.precipitation_amount !== undefined;
    
    let precipitation = 0;
    let snow = 0;

    if (hasNext1Hours) {
      precipitation = entry.data.next_1_hours!.details!.precipitation_amount;
    } else if (hasNext6Hours) {
      precipitation = entry.data.next_6_hours!.details!.precipitation_amount / 6;
    }

    const weatherCondition = entry.data.next_1_hours?.summary?.symbol_code 
      || entry.data.next_6_hours?.summary?.symbol_code 
      || 'clearsky';

    if (temp < 2 && precipitation > 0) {
      snow = precipitation;
    }

    const precipType = getPrecipitationType(temp, precipitation);

    if (index === 0) {
      currentTemperature = temp;
      currentWindSpeed = wind;
      currentSnow = snow;
      currentPrecipitationType = precipType;
      currentWeatherCondition = weatherCondition;
      currentPrecipitation = precipitation;
    }

    hourly.push({
      time,
      snow: Math.round(snow * 10) / 10,
      precipitationType: precipType,
      temperature: Math.round(temp * 10) / 10,
      precipitation: Math.round(precipitation * 10) / 10,
      weatherCondition,
    });
  });

  return {
    updatedAt: new Date().toISOString(),
    current: {
      temperature: Math.round(currentTemperature * 10) / 10,
      snow: currentSnow,
      precipitationType: currentPrecipitationType,
      precipitation: currentPrecipitation,
      weatherCondition: currentWeatherCondition,
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
