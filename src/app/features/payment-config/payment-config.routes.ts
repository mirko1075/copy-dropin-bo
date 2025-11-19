import { Routes } from '@angular/router';

export const PAYMENT_CONFIG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/payment-config/payment-config').then(m => m.PaymentConfigComponent)
  }
];
