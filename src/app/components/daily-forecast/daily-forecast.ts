import { Component, inject, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { WeatherService } from '../../services/weather.service';
import { UnitsService } from '../../services/units.service';

interface DailyForecastItem {
  day: string;
  icon: string;
  alt: string;
  high: number;
  low: number;
}

@Component({
  selector: 'app-daily-forecast',
  imports: [],
  templateUrl: './daily-forecast.html',
  styleUrl: './daily-forecast.scss'
})
export class DailyForecast {
  readonly weatherService = inject(WeatherService);
  readonly unitsService = inject(UnitsService);
  private readonly datePipe = inject(DatePipe);

  readonly weatherData = this.weatherService.weatherResource.value;
  readonly isLoading = this.weatherService.weatherResource.isLoading;
  readonly dataPipe = inject(DatePipe);

  readonly dailyForecast = computed((): DailyForecastItem[] => {
    const data = this.weatherData();
    if (!data?.daily) {
      return Array(7).fill(null).map((_) => ({
        day: '',
        icon: '',
        alt: '',
        high: 0,
        low: 0
      }));
    }

    const daily = data.daily;

    return daily.time.map((dateString, index) => {
      const dayName = this.datePipe.transform(dateString, 'EEE') || '';
      const weatherCode = daily.weatherCode[index];
      const iconData = this.weatherService.getWeatherIcon(weatherCode, true);

      return {
        day: dayName,
        icon: `assets/images/icon-${iconData.filename}.webp`,
        alt: iconData.description,
        high: Math.round(this.unitsService.convertTemperature(daily.temperature2mMax[index])),
        low: Math.round(this.unitsService.convertTemperature(daily.temperature2mMin[index]))
      };
    });
  });
}
