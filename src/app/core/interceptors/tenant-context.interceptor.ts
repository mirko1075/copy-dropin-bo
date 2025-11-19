import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantContextService } from '../services/tenant-context.service';

export const tenantContextInterceptor: HttpInterceptorFn = (req, next) => {
  const contextService = inject(TenantContextService);
  const context = contextService.context();

  if (context && !req.params.has('tenantId')) {
    // Aggiungi automaticamente tenant context se non già presente
    const modifiedReq = req.clone({
      params: req.params
        .set('tenantId', context.tenantId.toString())
        .set('vendorId', context.vendorId.toString())
        .set('siteId', context.siteId.toString())
    });
    return next(modifiedReq);
  }

  return next(req);
};
