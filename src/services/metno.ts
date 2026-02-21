/**
 * metno.ts: Værdata fra Meteorologisk institutt (Met.no)
 * 
 * Denne filen håndterer all kommunikasjon med Met.no API.
 * Den inneholder funksjoner for å:
 * - Hente værdata for en gitt lokasjon
 * - Parse API-responsen til appens format
 * - Beregne snømengde over tid
 * 
 * API-Dokumentasjon: https://api.met.no/weatherapi/locationforecast/2.0/
 */

import type { MetNoResponse, WeatherData, HourlyForecast, PrecipitationType } from '../types';

// =============================================================================
// KONSTANTER
// =============================================================================

/**
 * BASE_URL: Met.no API endepunkt
 * 
 * LocationForecast 2.0 Compact er den minste versjonen av API-et
 * og inneholder kun nødvendig data for denne appen.
 * 
 * @see https://api.met.no/weatherapi/locationforecast/2.0/compact
 */
const BASE_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';

/**
 * weatherConditionEmojis: Værkode → Emoji mapping
 * 
 * Mapping fra Met.no sine symbolkoder til emojis.
 * Brukes for visuell representasjon av været.
 */
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

/**
 * weatherConditionLabels: Værkode → Norsk tekst
 * 
 * Mapping fra Met.no sine symbolkoder til norske
 * forklarende tekster.
 */
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

// =============================================================================
// HJELPEFUNKSJONER
// =============================================================================

/**
 * getWeatherConditionEmoji: Hent emoji for værkode
 * 
 * @param condition - Værkode fra Met.no (f.eks. "snow", "rain")
 * @returns Emoji som representerer været
 */
export function getWeatherConditionEmoji(condition: string): string {
  return weatherConditionEmojis[condition] || '☀️';
}

/**
 * getWeatherConditionLabel: Hent norsk tekst for værkode
 * 
 * @param condition - Værkode fra Met.no
 * @returns Norsk tekst som beskriver været
 */
export function getWeatherConditionLabel(condition: string): string {
  return weatherConditionLabels[condition] || 'Klarvær';
}

/**
 * getPrecipitationType: Bestem type nedbør basert på temperatur
 * 
 * Logikk:
 * - Hvis temp < 0.5°C → Snø ❄️
 * - Hvis temp 0.5-3°C → Sludd 🌨️
 * - Hvis temp > 3°C → Regn 🌧️
 * 
 * @param temp - Temperatur i Celsius
 * @param precip - Nedbør i mm
 * @returns Type nedbør
 */
function getPrecipitationType(temp: number, precip: number): PrecipitationType {
  // Hvis ingen nedbør, returner regn (for å unngå feil)
  if (precip <= 0) return 'rain';
  
  // Under 0.5°C = snø
  if (temp < 0.5) return 'snow';
  
  // 0.5-3°C = sludd
  if (temp < 3) return 'sleet';
  
  // Over 3°C = regn
  return 'rain';
}

// =============================================================================
// HOVEDFUNKSJONER
// =============================================================================

/**
 * fetchWeatherData: Hent værdata fra Met.no API
 * 
 * Denne funksjonen:
 * 1. Bygger URL med koordinater
 * 2. Sender request med riktig headers
 * 3. Sjekker for feil
 * 4. Parser responsen til appens format
 * 
 * @param lat - Breddegrad
 * @param lon - Lengdegrad
 * @returns WeatherData objekt
 * @throws Error hvis API-kall feiler
 * 
 * @example
 * const vær = await fetchWeatherData(59.9139, 10.7522);
 * console.log(vær.current.temperature); // -2.5
 */
export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  // Bygg URL med koordinater
  const url = `${BASE_URL}?lat=${lat}&lon=${lon}`;
  
  /**
   * Fetch med riktige headers
   * 
   * User-Agent: Påkrevd av Met.no for identifikasjon
   * Accept: Vi vil ha JSON tilbake
   */
  const response = await fetch(url, {
    headers: {
      // Identifiser appen vår (endre e-post til din)
      'User-Agent': 'Snomåkingsanalysator/1.0 (kontakt@example.com)',
      'Accept': 'application/json',
    },
  });

  // Sjekk for HTTP-feil
  if (!response.ok) {
    throw new Error(`Vær-API feilet: ${response.status}`);
  }

  // Parse JSON-responsen
  const data: MetNoResponse = await response.json();
  
  // Konverter til appens format
  return parseWeatherData(data);
}

/**
 * parseWeatherData: Konverter Met.no data til appens format
 * 
 * Met.no gir 48 timer med data (time for time).
 * Denne funksjonen:
 * 1. Går gjennom hver time
 * 2. Beregner snø basert på temperatur og nedbør
 * 3. Setter sammen current + hourly data
 * 
 * @param data - Rå data fra Met.no
 * @returns WeatherData i appens format
 */
function parseWeatherData(data: MetNoResponse): WeatherData {
  const timeseries = data.properties.timeseries;
  
  // Arrays for time-data
  const hourly: HourlyForecast[] = [];
  
  // Variabler for "nåværende" vær (første time i serien)
  let currentSnow = 0;
  let currentPrecipitationType: PrecipitationType = 'rain';
  let currentWeatherCondition = 'clearsky';
  let currentPrecipitation = 0;
  let currentTemperature = 0;
  let currentWindSpeed = 0;
  
  /**
   * Gå gjennom hver time (maks 48 timer)
   * 
   * Index 0 = nåværende time
   * Index 1-47 = fremtidige timer
   */
  timeseries.slice(0, 48).forEach((entry, index) => {
    const time = entry.time;
    const instant = entry.data.instant.details;
    const temp = instant.air_temperature;
    const wind = instant.wind_speed;
    
    // Sjekk hvilke tidsperioder som er tilgjengelige
    const hasNext1Hours = entry.data.next_1_hours?.details?.precipitation_amount !== undefined;
    const hasNext6Hours = entry.data.next_6_hours?.details?.precipitation_amount !== undefined;
    
    // Beregn nedbør
    let precipitation = 0;
    let snow = 0;
    
    // 1 time ahead er mer presist enn 6 timer
    if (hasNext1Hours) {
      precipitation = entry.data.next_1_hours!.details!.precipitation_amount;
    } else if (hasNext6Hours) {
      // Del 6-timers nedbør på 6 for å få time-verdi
      precipitation = entry.data.next_6_hours!.details!.precipitation_amount / 6;
    }
    
    // Værkode fra API (f.eks. "snow", "rain")
    const weatherCondition = entry.data.next_1_hours?.summary?.symbol_code 
      || entry.data.next_6_hours?.summary?.symbol_code 
      || 'clearsky';
    
    /**
     * Snøberegning
     * 
     * Snø = Nedbør når temperatur er under 2°C
     * (Met.no bruker 2°C som grense for snø)
     */
    if (temp < 2 && precipitation > 0) {
      snow = precipitation;
    }
    
    const precipType = getPrecipitationType(temp, precipitation);
    
    // Sett "nåværende" vær fra første time
    if (index === 0) {
      currentTemperature = temp;
      currentWindSpeed = wind;
      currentSnow = snow;
      currentPrecipitationType = precipType;
      currentWeatherCondition = weatherCondition;
      currentPrecipitation = precipitation;
    }
    
    // Legg til i hourly array
    hourly.push({
      time,
      snow: Math.round(snow * 10) / 10,
      precipitationType: precipType,
      temperature: Math.round(temp * 10) / 10,
      precipitation: Math.round(precipitation * 10) / 10,
      weatherCondition,
    });
  });
  
  // Returner ferdig formatert data
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

/**
 * calculateSnowInPeriod: Beregn total snø over en periode
 * 
 * Summerer snømengden for de neste X timene.
 * Brukes for å beregne snøstatus (normal/warning/critical).
 * 
 * @param hourly - Time-forvarsling
 * @param hours - Antall timer frem i tid (f.eks. 24)
 * @returns Total snø i mm
 * 
 * @example
 * const snow24 = calculateSnowInPeriod(vær.hourly, 24);
 * console.log(`Ventet snø: ${snow24}mm`);
 */
export function calculateSnowInPeriod(hourly: HourlyForecast[], hours: number): number {
  const now = new Date();
  let totalSnow = 0;
  
  // Summer kun fremtidige timer
  for (let i = 0; i < Math.min(hours, hourly.length); i++) {
    const forecastTime = new Date(hourly[i].time);
    
    // Ta med kun fremtidige timer
    if (forecastTime >= now) {
      totalSnow += hourly[i].snow;
    }
  }
  
  // Rund til 1 desimal
  return Math.round(totalSnow * 10) / 10;
}
