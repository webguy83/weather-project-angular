import { Component, inject, viewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkMenuModule, CdkMenuTrigger } from '@angular/cdk/menu';
import { BreakpointService } from '../../services/breakpoint.service';

@Component({
  selector: 'app-search',
  imports: [FormsModule, CdkMenuModule],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search {
  readonly breakpointService = inject(BreakpointService);
  readonly isXSmall = this.breakpointService.isXSmall;

  readonly menuTrigger = viewChild.required(CdkMenuTrigger);

  searchQuery = signal('');
  filteredCities = signal<string[]>([]);
  selectedIndex = signal(0); // Auto-active first option

  // Dummy city data
  readonly cities = [
    'New York',
    'Los Angeles',
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
    'San Antonio',
    'San Diego',
    'Dallas',
    'San Jose',
    'Austin',
    'Jacksonville',
    'Fort Worth',
    'Columbus',
    'Charlotte',
    'San Francisco',
    'Indianapolis',
    'Seattle',
    'Denver',
    'Washington',
    'Boston',
    'Nashville',
    'Oklahoma City',
    'Las Vegas',
    'Portland',
    'Memphis',
    'Louisville',
    'Baltimore',
    'Milwaukee',
    'Albuquerque'
  ];

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const query = target.value.toLowerCase().trim();
    this.searchQuery.set(target.value);

    if (query.length > 0) {
      const filtered = this.cities
        .filter(city => city.toLowerCase().includes(query))
        .slice(0, 5); // Limit to 5 results

      this.filteredCities.set(filtered);
      this.selectedIndex.set(0); // Auto-active first option

      // Only open menu if there are filtered results
      if (filtered.length > 0) {
        this.menuTrigger().open();
      } else {
        this.menuTrigger().close();
      }
    } else {
      this.filteredCities.set([]);
      this.selectedIndex.set(0);
      this.menuTrigger().close();
    }
  }

  selectCity(city: string) {
    this.searchQuery.set(city);
    this.filteredCities.set([]);
    this.selectedIndex.set(0);
    this.menuTrigger().close();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.selectCurrentItem();
  }

  onEnterKey(event: Event) {
    event.preventDefault();
    if (this.filteredCities().length > 0) {
      this.selectCurrentItem();
    }
  }

  private selectCurrentItem() {
    const cities = this.filteredCities();
    const currentIndex = this.selectedIndex();

    if (cities.length > 0 && currentIndex >= 0 && currentIndex < cities.length) {
      const selectedCity = cities[currentIndex];
      this.selectCity(selectedCity);
    }
  }
}
