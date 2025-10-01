import { Component, inject } from '@angular/core';
import { BreakpointService } from '../../services/breakpoint.service';

@Component({
  selector: 'app-weather-stats',
  imports: [],
  templateUrl: './weather-stats.html',
  styleUrl: './weather-stats.scss'
})
export class WeatherStats {
  readonly breakpointService = inject(BreakpointService);
  readonly isMobile = this.breakpointService.isXSmall;
}
