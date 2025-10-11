import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal, rxResource } from '@angular/core/rxjs-interop';
import { Observable, debounceTime, distinctUntilChanged, switchMap, catchError, of, startWith } from 'rxjs';

export interface CityResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

// Open-Meteo API response interfaces
interface OpenMeteoGeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country_code: string;
  admin1?: string; // State/Province
  admin2?: string; // County/Region
  timezone: string;
}

interface OpenMeteoGeoResponse {
  results?: OpenMeteoGeoResult[];
  generationtime_ms: number;
}

// Interface for rxResource params
interface SearchParams {
  query: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitySearchService {
  private readonly http = inject(HttpClient);

  private readonly BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

  // Create the search query signal
  readonly searchQuery = signal('');

  // Create debounced search query signal
  private readonly debouncedSearchQuery = toSignal(
    toObservable(this.searchQuery).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      startWith('')
    ),
    { initialValue: '' }
  );

  /**
   * Search for cities
   * @param query - The search query string
   * @returns Observable of city results
   */
  searchCities(query: string): Observable<CityResult[]> {
    // Don't search if query is empty or too short
    if (!query || query.length < 2) {
      return of([]);
    }

    // Open-Meteo API URL - no API key required!
    const url = `${this.BASE_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;

    return this.http.get<OpenMeteoGeoResponse>(url).pipe(
      switchMap(response => {
        if (!response.results || response.results.length === 0) {
          return of([]); // Return empty array instead of empty observable
        }

        // Transform Open-Meteo format to our CityResult format
        const cities: CityResult[] = response.results.map(result => ({
          name: result.name,
          country: result.country_code,
          state: result.admin1 || undefined,
          lat: result.latitude,
          lon: result.longitude
        }));

        return of(cities);
      }),
      catchError(error => {
        console.error('Error fetching cities from Open-Meteo:', error);
        return of([]); // Return empty array instead of empty observable
      })
    );
  }

  /**
   * Reactive search results using rxResource
   * Uses the correct params + stream pattern for proper loading states
   */
  readonly searchResults = rxResource({
    params: computed((): SearchParams => ({
      query: this.debouncedSearchQuery(), // Use debounced signal
    })),
    stream: ({ params }: { params: SearchParams }) => {
      // No need for debouncing here since params are already debounced
      return this.searchCities(params.query);
    },
    defaultValue: [] as CityResult[]
  });

  /**
   * Update the search query
   * @param query - The new search query
   */
  updateSearchQuery(query: string) {
    this.searchQuery.set(query);
  }

  /**
   * Format city display name including country and state if available
   */
  formatCityName(city: CityResult): string {
    const parts = [city.name];
    if (city.state) {
      parts.push(city.state);
    }
    parts.push(city.country);
    return parts.join(', ');
  }
}
