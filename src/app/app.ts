
import { Component, signal } from '@angular/core';
import { Header } from './components/header/header';
import { Search } from './components/search/search';
import { WeatherCard } from './components/weather-card/weather-card';
import { WeatherStats } from './components/weather-stats/weather-stats';
import { DailyForecast } from './components/daily-forecast/daily-forecast';
import { HourlyForecast } from './components/hourly-forecast/hourly-forecast';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
  imports: [Header, Search, WeatherCard, WeatherStats, DailyForecast, HourlyForecast],
})
export class App {
  protected readonly title = signal('weather-project');
}
