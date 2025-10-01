import { Component, inject } from '@angular/core';
import { BreakpointService } from '../../services/breakpoint.service';

@Component({
  selector: 'app-hourly-forecast',
  imports: [],
  templateUrl: './hourly-forecast.html',
  styleUrl: './hourly-forecast.scss'
})
export class HourlyForecast {
  readonly breakpointService = inject(BreakpointService);
  readonly isMobile = this.breakpointService.isXSmall;
}
