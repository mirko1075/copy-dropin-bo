import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tenant, Vendor, Site } from '../models';

@Injectable({ providedIn: 'root' })
export class MultiTenancyApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api`;

  getTenants(): Observable<{ data: Tenant[] }> {
    return this.http.get<{ data: Tenant[] }>(`${this.baseUrl}/tenants`);
  }

  getVendors(tenantId: number): Observable<{ data: Vendor[] }> {
    return this.http.get<{ data: Vendor[] }>(`${this.baseUrl}/vendors`, {
      params: { tenantId: tenantId.toString() }
    });
  }

  getSites(vendorId: number): Observable<{ data: Site[] }> {
    return this.http.get<{ data: Site[] }>(`${this.baseUrl}/sites`, {
      params: { vendorId: vendorId.toString() }
    });
  }
}
