import { Component, inject, signal, computed, linkedSignal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CdkMenuModule } from '@angular/cdk/menu';
import { BreakpointService } from '../../services/breakpoint.service';
import { DailyWeather, WeatherService } from '../../services/weather.service';
import { UnitsService } from '../../services/units.service';

interface HourlyForecastItem {
  time: string;
  temperature: number;
  icon: string;
  alt: string;
}

interface HourlyWeatherData {
  time: string[];
  weatherCode: number[];
  temperature2m: number[];
}

type HourlyDataByDay = Map<string, {
  weatherIcon: { filename: string; description: string };
  time: string;
  temperature: number;
}[]>;

@Component({
  selector: 'app-hourly-forecast',
  imports: [CdkMenuModule],
  templateUrl: './hourly-forecast.html',
  styleUrl: './hourly-forecast.scss'
})
export class HourlyForecast {
  readonly breakpointService = inject(BreakpointService);
  readonly weatherService = inject(WeatherService);
  readonly unitsService = inject(UnitsService);
  private readonly datePipe = inject(DatePipe);

  readonly isMobile = this.breakpointService.isXSmall;
  readonly weatherData = this.weatherService.weatherResource.value;
  readonly isLoading = this.weatherService.weatherResource.isLoading;

  readonly selectedDay = linkedSignal(() => {
    const data = this.weatherData();

    if (!data?.current) {
      return '--';
    }

    return this.datePipe.transform(data.current.time, 'EEEE');
  });

  readonly days = computed(() => {
    const data = this.weatherData();

    if (!data?.daily) {
      return [];
    }

    const processedDays = data.daily.time.map(dateString => {
      return this.datePipe.transform(dateString, 'EEEE');
    });

    return processedDays;
  });

  readonly hourlyForecast = computed((): HourlyForecastItem[] => {
    const data = this.weatherData();
    const selectedDay = this.selectedDay();

    if (!data?.hourly || !data?.current || !selectedDay) {
      return Array(24).fill(null).map((_) => ({
        time: '',
        temperature: 0,
        icon: '',
        alt: ''
      }));
    }

    const hourlyMap = this.createHourlyLookupMap(data.hourly, data.daily, data.current.time);
    const dayData = hourlyMap.get(selectedDay) || [];

    return dayData.map(item => ({
      time: this.datePipe.transform(item.time, 'h:mm a') || '',
      temperature: Math.round(this.unitsService.convertTemperature(item.temperature)),
      icon: item.weatherIcon.filename,
      alt: item.weatherIcon.description
    }));
  });

  onSelectDay(day: string) {
    this.selectedDay.set(day);
  }

  private roundDownToHour(dateStr: string) {
    const rounded = new Date(dateStr);
    rounded.setMinutes(0, 0, 0);
    return rounded;
  }


  private createHourlyLookupMap(hourlyData: HourlyWeatherData, dailyData: DailyWeather, currentTime: string): HourlyDataByDay {
    const sunriseSunsetMap = dailyData.time.reduce((map, date, index) => {
      map.set(date, {
        sunrise: new Date(dailyData.sunrise[index]),
        sunset: new Date(dailyData.sunset[index])
      });
      return map;
    }, new Map<string, { sunrise: Date; sunset: Date }>());

    return hourlyData.time.reduce((map: HourlyDataByDay, timeString: string, index: number) => {
      const dayName = this.datePipe.transform(timeString, 'EEEE') || '';

      if (!map.has(dayName)) {
        map.set(dayName, []);
      }

      const currentDate = this.roundDownToHour(currentTime);
      const timeStringDate = this.roundDownToHour(timeString);

      if (timeStringDate >= currentDate) {
        const dateKey = this.datePipe.transform(timeString, 'yyyy-MM-dd') || '';
        const dayTimes = sunriseSunsetMap.get(dateKey);
        const isDay = dayTimes ? new Date(timeString) >= dayTimes.sunrise && new Date(timeString) <= dayTimes.sunset : true;

        const weatherIcon = this.weatherService.getWeatherIcon(hourlyData.weatherCode[index], isDay);

        map.get(dayName)!.push({
          weatherIcon: weatherIcon,
          time: timeString,
          temperature: Math.round(hourlyData.temperature2m[index])
        });
      }

      return map;
    }, new Map());
  }
}
