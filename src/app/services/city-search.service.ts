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

interface OpenMeteoGeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country_code: string;
  admin1?: string;
  admin2?: string;
  timezone: string;
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

    const url = `${this.BASE_URL}?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;

    return this.http.get<OpenMeteoGeoResponse>(url).pipe(
      switchMap(response => {
        if (!response.results || response.results.length === 0) {
          return of([]);
        }

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
        return of([]);
      })
    );
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
