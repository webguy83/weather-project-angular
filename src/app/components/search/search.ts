import { Component, inject, viewChild, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkMenuModule, CdkMenuTrigger } from '@angular/cdk/menu';
import { BreakpointService } from '../../services/breakpoint.service';
import { CitySearchService, CityResult } from '../../services/city-search.service';

@Component({
  selector: 'app-search',
  imports: [FormsModule, CdkMenuModule],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search {
  readonly breakpointService = inject(BreakpointService);
  readonly citySearchService = inject(CitySearchService);
  readonly isXSmall = this.breakpointService.isXSmall;

  readonly menuTrigger = viewChild.required(CdkMenuTrigger);

  searchQuery = signal('');
  selectedIndex = signal(0);

  readonly searchResults = this.citySearchService.searchResults;

  readonly shouldShowMenu = computed(() => {
    const query = this.citySearchService.searchQuery();
    const status = this.searchResults.status();
    const isLoading = status === 'loading';
    const results = this.searchResults.value() || [];
    
    console.log('Status:', status, 'Query:', query, 'Results:', results);
    
    return query.length > 0 && (isLoading || results.length > 0);
  });

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const query = target.value.trim();
    this.searchQuery.set(query);

    this.citySearchService.updateSearchQuery(query);
    this.selectedIndex.set(0);

    if (query.length === 0) {
      this.menuTrigger().close();
    } else if (query.length >= 2) {
      this.menuTrigger().open();
    }
  }

  selectCity(city: CityResult) {
    const displayName = this.citySearchService.formatCityName(city);
    this.searchQuery.set(displayName);
    this.citySearchService.updateSearchQuery('');
    this.selectedIndex.set(0);
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
    }
  }

  private selectCurrentItem() {
    const cities = this.searchResults.value() || [];
    const currentIndex = this.selectedIndex();

    if (cities.length > 0 && currentIndex >= 0 && currentIndex < cities.length) {
      const selectedCity = cities[currentIndex];
      this.selectCity(selectedCity);
    }
  }


}
