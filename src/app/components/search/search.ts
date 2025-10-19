import { Component, inject, viewChild, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkMenuModule, CdkMenuTrigger } from '@angular/cdk/menu';
import { BreakpointService } from '../../services/breakpoint.service';
import { CitySearchService, CityResult } from '../../services/city-search.service';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-search',
  imports: [FormsModule, CdkMenuModule],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search {
  readonly breakpointService = inject(BreakpointService);
  readonly citySearchService = inject(CitySearchService);
  readonly weatherService = inject(WeatherService);
  readonly isXSmall = this.breakpointService.isXSmall;

  readonly menuTrigger = viewChild.required(CdkMenuTrigger);

  searchQuery = this.citySearchService.searchQuery;
  selectedIndex = 0;

  readonly searchResults = this.citySearchService.searchResults;
  readonly noResultsFound = this.weatherService.noResultsFound;

  readonly shouldShowMenu = computed(() => {
    const query = this.searchQuery();
    const status = this.searchResults.status();
    const isLoading = status === 'loading';
    const results = this.searchResults.value() || [];
    return query.length > 0 && (isLoading || results.length > 0);
  });

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const query = target.value.trim();

    this.citySearchService.updateSearchQuery(query);
    this.selectedIndex = 0;

    if (query.length === 0) {
      this.menuTrigger().close();
    } else if (query.length >= 2) {
      this.menuTrigger().open();
    }
  }

  selectCity(city: CityResult | null) {
    if (city) {
      const displayName = this.citySearchService.formatCityName(city);
      this.citySearchService.updateSearchQuery(displayName);
      this.weatherService.updateWeatherForLocation(city.lat, city.lon, displayName);
      this.weatherService.updatedNoResultsFound(false);
    } else {
      this.weatherService.updatedNoResultsFound(true);
    }
    this.selectedIndex = 0;
    this.menuTrigger().close();
  }

  onSubmit(event: SubmitEvent) {
    event.preventDefault();
    this.selectCurrentItem();
  }

  onEnterKey(event: Event) {
    event.preventDefault();
    if ((this.searchResults.value() || []).length > 0) {
      this.selectCurrentItem();
    } else {
      this.selectCity(null);
    }
  }

  private selectCurrentItem() {
    const cities = this.searchResults.value() || [];
    const currentIndex = this.selectedIndex;

    if (cities.length > 0 && currentIndex >= 0 && currentIndex < cities.length) {
      const selectedCity = cities[currentIndex];
      this.selectCity(selectedCity);
    } else {
      this.selectCity(null);
    }
  }
}
