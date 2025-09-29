import { Component, inject } from '@angular/core';
import { BreakpointService } from '../../services/breakpoint.service';
import {CdkMenu, CdkMenuItem, CdkMenuTrigger} from '@angular/cdk/menu';

@Component({
  selector: 'app-units-menu',
  imports: [CdkMenu, CdkMenuItem, CdkMenuTrigger],
  templateUrl: './units-menu.html',
  styleUrl: './units-menu.scss'
})
export class UnitsMenu {
  readonly breakpointService = inject(BreakpointService);
  readonly isHandset = this.breakpointService.isHandset;
}
