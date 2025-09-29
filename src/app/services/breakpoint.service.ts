import { Injectable, Inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BreakpointService {
  readonly isHandset;
  readonly isTablet;
  readonly isWeb;

  constructor(@Inject(BreakpointObserver) private breakpointObserver: BreakpointObserver) {
    this.isHandset = toSignal(
      this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
        map((result: { matches: boolean }) => result.matches)
      ),
      { initialValue: false }
    );
    this.isTablet = toSignal(
      this.breakpointObserver.observe([Breakpoints.Tablet]).pipe(
        map((result: { matches: boolean }) => result.matches)
      ),
      { initialValue: false }
    );
    this.isWeb = toSignal(
      this.breakpointObserver.observe([Breakpoints.Web]).pipe(
        map((result: { matches: boolean }) => result.matches)
      ),
      { initialValue: false }
    );
  }
}
