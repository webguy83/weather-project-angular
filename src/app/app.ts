import { Component, inject, computed } from '@angular/core';
import { Header } from './components/header/header';
import { Search } from './components/search/search';
import { WeatherCard } from './components/weather-card/weather-card';
import { WeatherStats } from './components/weather-stats/weather-stats';
import { DailyForecast } from './components/daily-forecast/daily-forecast';
import { HourlyForecast } from './components/hourly-forecast/hourly-forecast';
import { ErrorState } from './components/error-state/error-state';
import { BreakpointService } from './services/breakpoint.service';
import { WeatherService } from './services/weather.service';
import { CitySearchService } from './services/city-search.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
  imports: [Header, Search, WeatherCard, WeatherStats, DailyForecast, HourlyForecast, ErrorState],
})
export class App {
  readonly breakpointService = inject(BreakpointService);
  readonly weatherService = inject(WeatherService);
  readonly citySearchService = inject(CitySearchService);
  readonly noResultsFound = this.weatherService.noResultsFound;

  readonly isMobile = this.breakpointService.isXSmall;
  readonly isTablet = this.breakpointService.isSmall;
  readonly hasWeatherData = this.weatherService.hasSelectedLocation;

  // Check for errors from both weather and city search APIs
  readonly hasError = computed(() =>
    !!this.weatherService.weatherResource.error() ||
    !!this.citySearchService.searchResults.error()
  );

  onRetry() {
    // Retry whichever resource has an error
    if (this.weatherService.weatherResource.error()) {
      this.weatherService.weatherResource.reload();
    }
    if (this.citySearchService.searchResults.error()) {
      this.citySearchService.searchResults.reload();
    }
  }
}
