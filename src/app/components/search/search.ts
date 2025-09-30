import { Component, inject } from '@angular/core';
import { BreakpointService } from '../../services/breakpoint.service';

@Component({
  selector: 'app-search',
  imports: [],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search {
  readonly breakpointService = inject(BreakpointService);
  readonly isXSmall = this.breakpointService.isXSmall;
}
