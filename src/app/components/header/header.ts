import { Component, inject, input } from '@angular/core';
import { BreakpointService } from '../../services/breakpoint.service';
import { UnitsMenu } from '../units-menu/units-menu';

@Component({
  selector: 'app-header',
  imports: [UnitsMenu],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly breakpointService = inject(BreakpointService);
  readonly isXSmall = this.breakpointService.isXSmall;
  readonly hasError = input(false);
}
