import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal, rxResource } from '@angular/core/rxjs-interop';
import { Observable, debounceTime, distinctUntilChanged, switchMap, catchError, of, startWith } from 'rxjs';

export interface CityResult {
  name: string;
  country: string;
  country_code: string;
  state?: string;
  lat: number;
  lon: number;
  population?: number;
}

interface OpenMeteoGeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
  admin2?: string;
  timezone: string;
  population: number;
}

interface OpenMeteoGeoResponse {
  results?: OpenMeteoGeoResult[];
  generationtime_ms: number;
}

interface SearchParams {
  query: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitySearchService {
  private readonly http = inject(HttpClient);

  private readonly BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

  readonly searchQuery = signal('');

  private readonly debouncedSearchQuery = toSignal(
    toObservable(this.searchQuery).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      startWith('')
    ),
    { initialValue: '' }
  );

  searchCities(query: string): Observable<CityResult[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    const { city, filterTokens } = this.parseSearchQuery(query);
    const url = `${this.BASE_URL}?name=${encodeURIComponent(city)}&count=10&language=en&format=json`;

    return this.http.get<OpenMeteoGeoResponse>(url).pipe(
      switchMap(response => {
        if (!response.results || response.results.length === 0) {
          return of([]);
        }

        const cities = this.transformAndFilterResults(response.results, filterTokens);
        const sortedCities = this.sortCitiesByRelevance(cities, city);

        return of(sortedCities);
      }),
      catchError(error => {
        console.error('Error fetching cities from Open-Meteo:', error);
        return of([]);
      })
    );
  }

  private parseSearchQuery(query: string): { city: string; filterTokens: Set<string> } {
    const tokens = query.split(',').map(s => s.trim()).filter(Boolean);
    const city = tokens[0];
    const filterTokens = new Set(tokens.slice(1).map(t => t.toLowerCase()));

    return { city, filterTokens };
  }

  private transformAndFilterResults(
    results: OpenMeteoGeoResult[],
    filterTokens: Set<string>
  ): CityResult[] {
    return results
      .map(result => this.mapTooCityResult(result))
      .filter(city => this.matchesFilterTokens(city, filterTokens));
  }

  private mapTooCityResult(result: OpenMeteoGeoResult): CityResult {
    return {
      name: result.name,
      country: result.country,
      country_code: result.country_code,
      state: result.admin1 || undefined,
      lat: result.latitude,
      lon: result.longitude,
      population: result.population || 0
    };
  }

  private matchesFilterTokens(city: CityResult, filterTokens: Set<string>): boolean {
    if (filterTokens.size === 0) {
      return true;
    }

    const state = city.state?.toLowerCase() || '';
    const country = city.country?.toLowerCase() || '';
    const countryCode = city.country_code?.toLowerCase() || '';

    return Array.from(filterTokens).every(token =>
      state.includes(token) ||
      country.includes(token) ||
      countryCode.includes(token)
    );
  }

  private sortCitiesByRelevance(cities: CityResult[], queryCity: string): CityResult[] {
    const queryCityLower = queryCity.toLowerCase();

    return cities.sort((a, b) => {
      const aExact = a.name.toLowerCase() === queryCityLower;
      const bExact = b.name.toLowerCase() === queryCityLower;

      if (aExact && !bExact) return -1;
      if (bExact && !aExact) return 1;

      return (b.population || 0) - (a.population || 0);
    });
  }

  readonly searchResults = rxResource({
    params: computed((): SearchParams => ({
      query: this.debouncedSearchQuery(),
    })),
    stream: ({ params }: { params: SearchParams }) => {
      return this.searchCities(params.query);
    },
    defaultValue: [] as CityResult[]
  });

  updateSearchQuery(query: string) {
    this.searchQuery.set(query);
  }

  formatCityName(city: CityResult): string {
    const parts = [city.name];
    if (city.state) {
      parts.push(city.state);
    }
    parts.push(city.country);
    return parts.join(', ');
  }
}
