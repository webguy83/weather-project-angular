import { Injectable, signal, computed } from '@angular/core';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph';
export type PrecipitationUnit = 'mm' | 'in';

export interface UnitsConfig {
  temperature: TemperatureUnit;
  windSpeed: WindSpeedUnit;
  precipitation: PrecipitationUnit;
}

@Injectable({
  providedIn: 'root'
})
export class UnitsService {
  // Private signals for each unit type
  private readonly temperatureUnit = signal<TemperatureUnit>('celsius');
  private readonly windSpeedUnit = signal<WindSpeedUnit>('kmh');
  private readonly precipitationUnit = signal<PrecipitationUnit>('mm');

  // Public readonly computed signals
  readonly currentUnits = computed((): UnitsConfig => ({
    temperature: this.temperatureUnit(),
    windSpeed: this.windSpeedUnit(),
    precipitation: this.precipitationUnit()
  }));

  readonly isImperial = computed(() =>
    this.temperatureUnit() === 'fahrenheit' &&
    this.windSpeedUnit() === 'mph' &&
    this.precipitationUnit() === 'in'
  );

  readonly isMetric = computed(() =>
    this.temperatureUnit() === 'celsius' &&
    this.windSpeedUnit() === 'kmh' &&
    this.precipitationUnit() === 'mm'
  );

  // Unit setters
  setTemperatureUnit(unit: TemperatureUnit) {
    this.temperatureUnit.set(unit);
  }

  setWindSpeedUnit(unit: WindSpeedUnit) {
    this.windSpeedUnit.set(unit);
  }

  setPrecipitationUnit(unit: PrecipitationUnit) {
    this.precipitationUnit.set(unit);
  }

  // Convenience methods to switch all units at once
  switchToImperial() {
    this.temperatureUnit.set('fahrenheit');
    this.windSpeedUnit.set('mph');
    this.precipitationUnit.set('in');
  }

  switchToMetric() {
    this.temperatureUnit.set('celsius');
    this.windSpeedUnit.set('kmh');
    this.precipitationUnit.set('mm');
  }

  // Conversion helper methods
  convertTemperature(celsius: number): number {
    return this.temperatureUnit() === 'fahrenheit'
      ? (celsius * 9/5) + 32
      : celsius;
  }

  convertWindSpeed(kmh: number): number {
    return this.windSpeedUnit() === 'mph'
      ? kmh * 0.621371
      : kmh;
  }

  convertPrecipitation(mm: number): number {
    return this.precipitationUnit() === 'in'
      ? mm * 0.0393701
      : mm;
  }

  // Format helpers that include units
  formatTemperature(celsius: number): string {
    const value = Math.round(this.convertTemperature(celsius));
    const unit = this.temperatureUnit() === 'fahrenheit' ? '°F' : '°C';
    return `${value}${unit}`;
  }

  formatWindSpeed(kmh: number): string {
    const value = Math.round(this.convertWindSpeed(kmh));
    const unit = this.windSpeedUnit() === 'mph' ? 'mph' : 'km/h';
    return `${value} ${unit}`;
  }

  formatPrecipitation(mm: number): string {
    const converted = this.convertPrecipitation(mm);
    const unit = this.precipitationUnit() === 'in' ? 'in' : 'mm';

    if (converted === 0) {
      return `0 ${unit}`;
    }

    // Round to appropriate precision and let JS handle formatting
    const value = unit === 'in'
      ? Math.round(converted * 100) / 100  // 2 decimal places
      : Math.round(converted * 10) / 10;   // 1 decimal place

    return `${value} ${unit}`;
  }

  // Get unit labels for display
  getTemperatureLabel(): string {
    return this.temperatureUnit() === 'fahrenheit' ? 'Fahrenheit (°F)' : 'Celsius (°C)';
  }

  getWindSpeedLabel(): string {
    return this.windSpeedUnit() === 'mph' ? 'mph' : 'km/h';
  }

  getPrecipitationLabel(): string {
    return this.precipitationUnit() === 'in' ? 'Inches (in)' : 'Millimeters (mm)';
  }
}
