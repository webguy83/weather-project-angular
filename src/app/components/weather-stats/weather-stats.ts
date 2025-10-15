import { Component, inject, computed, signal } from '@angular/core';
import { BreakpointService } from '../../services/breakpoint.service';
import { WeatherService } from '../../services/weather.service';
import { UnitsService } from '../../services/units.service';

interface WeatherStat {
  label: string;
  value: string;
}

@Component({
  selector: 'app-weather-stats',
  imports: [],
  templateUrl: './weather-stats.html',
  styleUrl: './weather-stats.scss'
})
export class WeatherStats {
  readonly breakpointService = inject(BreakpointService);
  readonly weatherService = inject(WeatherService);
  readonly unitsService = inject(UnitsService);
  readonly isMobile = this.breakpointService.isXSmall;

  readonly weatherData = this.weatherService.weatherResource.value;
  readonly isLoading = this.weatherService.weatherResource.isLoading;

  readonly weatherStats = computed((): WeatherStat[] => {
    const data = this.weatherData();
    if (!data?.current) {
      return [
        { label: 'Feels Like', value: '--' },
        { label: 'Humidity', value: '--' },
        { label: 'Wind', value: '--' },
        { label: 'Precipitation', value: '--' }
      ];
    }

    const current = data.current;

    return [
      {
        label: 'Feels Like',
        value: this.unitsService.formatTemperature(current.apparentTemperature)
      },
      {
        label: 'Humidity',
        value: `${Math.round(current.humidity)}%`
      },
      {
        label: 'Wind',
        value: this.unitsService.formatWindSpeed(current.windSpeed)
      },
      {
        label: 'Precipitation',
        value: this.unitsService.formatPrecipitation(current.precipitation || 0)
      }
    ];
  });


}
