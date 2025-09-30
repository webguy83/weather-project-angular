
import { Component, inject } from '@angular/core';
import { Header } from './components/header/header';
import { Search } from './components/search/search';
import { WeatherCard } from './components/weather-card/weather-card';
import { WeatherStats } from './components/weather-stats/weather-stats';
import { DailyForecast } from './components/daily-forecast/daily-forecast';
import { HourlyForecast } from './components/hourly-forecast/hourly-forecast';
import { BreakpointService } from './services/breakpoint.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
  imports: [Header, Search, WeatherCard, WeatherStats, DailyForecast, HourlyForecast],
})
export class App {
  readonly breakpointService = inject(BreakpointService);
  readonly isMobile = this.breakpointService.isXSmall;
  readonly isTablet = this.breakpointService.isSmall;
}
