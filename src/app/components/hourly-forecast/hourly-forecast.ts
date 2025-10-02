import { Component, inject, signal } from '@angular/core';
import { CdkMenuModule } from '@angular/cdk/menu';
import { BreakpointService } from '../../services/breakpoint.service';

@Component({
  selector: 'app-hourly-forecast',
  imports: [CdkMenuModule],
  templateUrl: './hourly-forecast.html',
  styleUrl: './hourly-forecast.scss'
})
export class HourlyForecast {
  readonly breakpointService = inject(BreakpointService);
  readonly isMobile = this.breakpointService.isXSmall;

  selectedDay = signal('Tuesday');

  readonly days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  selectDay(day: string) {
    this.selectedDay.set(day);
  }
}
