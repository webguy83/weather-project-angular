import { Component, inject } from '@angular/core';
import { BreakpointService } from '../../services/breakpoint.service';
import { UnitsService, TemperatureUnit, WindSpeedUnit, PrecipitationUnit } from '../../services/units.service';
import {CdkMenu, CdkMenuItem, CdkMenuTrigger} from '@angular/cdk/menu';

@Component({
  selector: 'app-units-menu',
  imports: [CdkMenu, CdkMenuItem, CdkMenuTrigger],
  templateUrl: './units-menu.html',
  styleUrl: './units-menu.scss'
})
export class UnitsMenu {
  readonly breakpointService = inject(BreakpointService);
  readonly unitsService = inject(UnitsService);
  readonly isXSmall = this.breakpointService.isXSmall;

  readonly currentUnits = this.unitsService.currentUnits;
  readonly isImperial = this.unitsService.isImperial;
  readonly isMetric = this.unitsService.isMetric;

  onSwitchToImperial() {
    this.unitsService.switchToImperial();
  }

  onSwitchToMetric() {
    this.unitsService.switchToMetric();
  }

  onTemperatureUnitChange(unit: TemperatureUnit) {
    this.unitsService.setTemperatureUnit(unit);
  }

  onWindSpeedUnitChange(unit: WindSpeedUnit) {
    this.unitsService.setWindSpeedUnit(unit);
  }

  onPrecipitationUnitChange(unit: PrecipitationUnit) {
    this.unitsService.setPrecipitationUnit(unit);
  }
}
