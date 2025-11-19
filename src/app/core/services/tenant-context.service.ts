import { Injectable, signal } from '@angular/core';
import { TenantContext } from '../models';

@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private contextSignal = signal<TenantContext | null>(null);

  context = this.contextSignal.asReadonly();

  setContext(context: TenantContext): void {
    this.contextSignal.set(context);
    localStorage.setItem('tenant-context', JSON.stringify(context));
  }

  loadContext(): void {
    const stored = localStorage.getItem('tenant-context');
    if (stored) {
      this.contextSignal.set(JSON.parse(stored));
    }
  }

  clearContext(): void {
    this.contextSignal.set(null);
    localStorage.removeItem('tenant-context');
  }

  hasContext(): boolean {
    return this.contextSignal() !== null;
  }
}
