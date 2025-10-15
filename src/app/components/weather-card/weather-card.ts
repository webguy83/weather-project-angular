import { Component, inject, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BreakpointService } from '../../services/breakpoint.service';
import { WeatherService } from '../../services/weather.service';
import { UnitsService } from '../../services/units.service';

@Component({
  selector: 'app-weather-card',
  imports: [DatePipe],
  templateUrl: './weather-card.html',
  styleUrl: './weather-card.scss'
})
export class WeatherCard {
  readonly breakpointService = inject(BreakpointService);
  readonly weatherService = inject(WeatherService);
  readonly unitsService = inject(UnitsService);

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
    return weather?.current.temperature ? Math.round(this.unitsService.convertTemperature(weather.current.temperature)) : null;
  });

  readonly isLoading = computed(() => {
    return this.weatherData.isLoading();
  });

  readonly weatherIcon = computed(() => {
    const weather = this.weatherData.value();
    const weatherCode = weather?.current.weatherCode ?? 0;
    const isDay = weather?.current.isDay ?? true;

    return this.weatherService.getWeatherIcon(weatherCode, isDay);
  });
}
