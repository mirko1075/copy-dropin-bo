import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/settings/settings').then(m => m.SettingsComponent)
  }
];
