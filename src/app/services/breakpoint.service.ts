import { Injectable, Inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BreakpointService {
  readonly isXSmall;
  readonly isSmall;
  readonly isMedium;
  readonly isLarge;
  readonly isXLarge;

  constructor(@Inject(BreakpointObserver) private breakpointObserver: BreakpointObserver) {
    this.isXSmall = toSignal(
      this.breakpointObserver.observe([Breakpoints.XSmall]).pipe(
        map((result: { matches: boolean }) => result.matches)
      ),
      { initialValue: false }
    );
    this.isSmall = toSignal(
      this.breakpointObserver.observe([Breakpoints.Small]).pipe(
        map((result: { matches: boolean }) => result.matches)
      ),
      { initialValue: false }
    );
    this.isMedium = toSignal(
      this.breakpointObserver.observe([Breakpoints.Medium]).pipe(
        map((result: { matches: boolean }) => result.matches)
      ),
      { initialValue: false }
    );
    this.isLarge = toSignal(
      this.breakpointObserver.observe([Breakpoints.Large]).pipe(
        map((result: { matches: boolean }) => result.matches)
      ),
      { initialValue: false }
    );
    this.isXLarge = toSignal(
      this.breakpointObserver.observe([Breakpoints.XLarge]).pipe(
        map((result: { matches: boolean }) => result.matches)
      ),
      { initialValue: false }
    );
  }
}
