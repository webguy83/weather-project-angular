import { Component, inject, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BreakpointService } from '../../services/breakpoint.service';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-weather-card',
  imports: [DatePipe],
  templateUrl: './weather-card.html',
  styleUrl: './weather-card.scss'
})
export class WeatherCard {
  readonly breakpointService = inject(BreakpointService);
  readonly weatherService = inject(WeatherService);

  readonly isMobile = this.breakpointService.isXSmall;

  readonly currentLocation = this.weatherService.currentLocation;
  readonly weatherData = this.weatherService.weatherResource;

  readonly cityName = computed(() => {
    const location = this.currentLocation();
    return location ? location.name : '';
  });

  readonly weatherDate = computed(() => {
    const weather = this.weatherData.value();
    return weather?.current.time || new Date();
  });

  readonly temperature = computed(() => {
    const weather = this.weatherData.value();
    return weather?.current.temperature ? Math.round(weather.current.temperature) : null;
  });

  readonly isLoading = computed(() => {
    return this.weatherData.isLoading();
  });

  readonly weatherIcon = computed(() => {
    const weather = this.weatherData.value();
    const weatherCode = weather?.current.weatherCode ?? 0;
    const isDay = weather?.current.isDay ?? true;

    return this.getWeatherIcon(weatherCode, isDay);
  });

  private getWeatherIcon(code: number, isDay: boolean): { filename: string; description: string } {
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
