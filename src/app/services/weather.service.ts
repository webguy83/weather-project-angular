import { Injectable, signal, computed, resource } from '@angular/core';

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  isDay: boolean;
  time: string;
}

export interface HourlyWeather {
  time: string[];
  temperature2m: number[];
  relativeHumidity2m: number[];
  precipitationProbability: number[];
  weatherCode: number[];
  windSpeed10m: number[];
  windDirection10m: number[];
}

export interface DailyWeather {
  time: string[];
  weatherCode: number[];
  temperature2mMax: number[];
  temperature2mMin: number[];
  precipitationSum: number[];
  precipitationProbabilityMax: number[];
  windSpeed10mMax: number[];
  windDirection10mDominant: number[];
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  timezoneAbbreviation: string;
  elevation: number;
  current: CurrentWeather;
  hourly: HourlyWeather;
  daily: DailyWeather;
}

interface OpenMeteoWeatherResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: Record<string, string>;
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  hourly_units: Record<string, string>;
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
  };
  daily_units: Record<string, string>;
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_direction_10m_dominant: number[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly BASE_URL = 'https://api.open-meteo.com/v1/forecast';

  readonly selectedLocation = signal<{ lat: number; lon: number; name: string } | null>(null);
  readonly hasSelectedLocation = computed(() => this.selectedLocation() !== null);
  readonly currentLocation = computed(() => this.selectedLocation());

  readonly weatherResource = resource({
    params: () => this.selectedLocation(),
    loader: async ({ params }) => {
      if (!params) {
        return null;
      }
      const urlParams = new URLSearchParams({
        latitude: params.lat.toString(),
        longitude: params.lon.toString(),
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'apparent_temperature',
          'is_day',
          'precipitation',
          'weather_code',
          'wind_speed_10m',
          'wind_direction_10m'
        ].join(','),
        hourly: [
          'temperature_2m',
          'relative_humidity_2m',
          'precipitation_probability',
          'weather_code',
          'wind_speed_10m',
          'wind_direction_10m'
        ].join(','),
        daily: [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'precipitation_probability_max',
          'wind_speed_10m_max',
          'wind_direction_10m_dominant'
        ].join(','),
        timezone: 'auto',
        forecast_days: '7'
      });

      const url = `${this.BASE_URL}?${urlParams.toString()}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json() as OpenMeteoWeatherResponse;
        return  this.transformResponse(data);
      } catch (error) {
        console.error('Error fetching weather data from Open-Meteo:', error);
        throw error;
      }
    }
  });

  updateWeatherForLocation(lat: number, lon: number, locationName: string) {
    this.selectedLocation.set({ lat, lon, name: locationName });
  }

  private transformResponse(response: OpenMeteoWeatherResponse): WeatherData {
    return {
      latitude: response.latitude,
      longitude: response.longitude,
      timezone: response.timezone,
      timezoneAbbreviation: response.timezone_abbreviation,
      elevation: response.elevation,
      current: {
        temperature: response.current.temperature_2m,
        apparentTemperature: response.current.apparent_temperature,
        humidity: response.current.relative_humidity_2m,
        precipitation: response.current.precipitation,
        windSpeed: response.current.wind_speed_10m,
        windDirection: response.current.wind_direction_10m,
        weatherCode: response.current.weather_code,
        isDay: response.current.is_day === 1,
        time: response.current.time
      },
      hourly: {
        time: response.hourly.time,
        temperature2m: response.hourly.temperature_2m,
        relativeHumidity2m: response.hourly.relative_humidity_2m,
        precipitationProbability: response.hourly.precipitation_probability,
        weatherCode: response.hourly.weather_code,
        windSpeed10m: response.hourly.wind_speed_10m,
        windDirection10m: response.hourly.wind_direction_10m
      },
      daily: {
        time: response.daily.time,
        weatherCode: response.daily.weather_code,
        temperature2mMax: response.daily.temperature_2m_max,
        temperature2mMin: response.daily.temperature_2m_min,
        precipitationSum: response.daily.precipitation_sum,
        precipitationProbabilityMax: response.daily.precipitation_probability_max,
        windSpeed10mMax: response.daily.wind_speed_10m_max,
        windDirection10mDominant: response.daily.wind_direction_10m_dominant
      }
    };
  }

  clearWeatherData() {
    this.selectedLocation.set(null);
  }

  getWeatherIcon(code: number, isDay: boolean): { filename: string; description: string } {
    const timeOfDay = isDay ? 'day' : 'night';

    switch (code) {
      case 0:
        return {
          filename: isDay ? 'sunny' : 'partly-cloudy',
          description: isDay ? 'Clear sky' : 'Clear night'
        };
      case 1:
      case 2:
        return { filename: 'partly-cloudy', description: `Partly cloudy ${timeOfDay}` };
      case 3:
        return { filename: 'overcast', description: 'Overcast' };
      case 45:
      case 48:
        return { filename: 'fog', description: 'Foggy' };
      case 51:
      case 53:
      case 55:
      case 56:
      case 57:
        return { filename: 'drizzle', description: 'Drizzle' };
      case 61:
      case 63:
      case 65:
      case 66:
      case 67:
      case 80:
      case 81:
      case 82:
        return { filename: 'rain', description: 'Rain' };
      case 71:
      case 73:
      case 75:
      case 77:
      case 85:
      case 86:
        return { filename: 'snow', description: 'Snow' };
      case 95:
      case 96:
      case 99:
        return { filename: 'storm', description: 'Thunderstorm' };
      default:
        return {
          filename: isDay ? 'sunny' : 'partly-cloudy',
          description: isDay ? 'Clear' : 'Clear night'
        };
    }
  }
}
