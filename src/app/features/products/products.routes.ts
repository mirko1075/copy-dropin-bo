import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/product-list/product-list').then(m => m.ProductListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./components/product-form/product-form').then(m => m.ProductFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/product-form/product-form').then(m => m.ProductFormComponent)
  }
];
