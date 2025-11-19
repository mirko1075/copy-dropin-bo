import { Routes } from '@angular/router';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/category-list/category-list').then(m => m.CategoryListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./components/category-form/category-form').then(m => m.CategoryFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/category-form/category-form').then(m => m.CategoryFormComponent)
  }
];
