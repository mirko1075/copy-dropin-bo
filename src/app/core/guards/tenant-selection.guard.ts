import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { TenantContextService } from '../services/tenant-context.service';

export const tenantSelectionGuard: CanActivateFn = (route, state) => {
  const contextService = inject(TenantContextService);
  const router = inject(Router);

  if (contextService.hasContext()) {
    return true;
  }

  // Redirect to tenant selection page
  return router.createUrlTree(['/settings/tenant-selector']);
};
