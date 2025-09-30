import { Component, inject } from '@angular/core';
import { BreakpointService } from '../../services/breakpoint.service';

@Component({
  selector: 'app-weather-card',
  imports: [],
  templateUrl: './weather-card.html',
  styleUrl: './weather-card.scss'
})
export class WeatherCard {
  readonly breakpointService = inject(BreakpointService);
  readonly isMobile = this.breakpointService.isXSmall;
}
