import { Component, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  imports: [],
  templateUrl: './error-state.html',
  styleUrl: './error-state.scss'
})
export class ErrorState {
  readonly retry = output<void>();

  onRetry() {
    this.retry.emit();
  }
}
