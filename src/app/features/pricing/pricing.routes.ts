import { Routes } from '@angular/router';

export const PRICING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/pricing-list/pricing-list').then(m => m.PricingListComponent)
  },
  {
    path: ':productId',
    loadComponent: () => import('./components/pricing-calendar/pricing-calendar').then(m => m.PricingCalendarComponent)
  }
];
