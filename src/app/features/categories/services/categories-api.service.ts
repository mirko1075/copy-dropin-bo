import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ServiceCategory, CategoryFormData, CategoryStatus } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class CategoriesApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/categories`;

  getCategories(params: {
    tenantId: number;
    vendorId: number;
    siteId: number;
    status?: CategoryStatus;
  }): Observable<{ data: ServiceCategory[], total: number }> {
    let httpParams = new HttpParams()
      .set('tenantId', params.tenantId)
      .set('vendorId', params.vendorId)
      .set('siteId', params.siteId);

    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<{ data: ServiceCategory[], total: number }>(
      this.baseUrl,
      { params: httpParams }
    );
  }

  getCategory(id: number): Observable<ServiceCategory> {
    return this.http.get<ServiceCategory>(`${this.baseUrl}/${id}`);
  }

  createCategory(data: CategoryFormData): Observable<ServiceCategory> {
    return this.http.post<ServiceCategory>(this.baseUrl, data);
  }

  updateCategory(id: number, data: CategoryFormData): Observable<ServiceCategory> {
    return this.http.put<ServiceCategory>(`${this.baseUrl}/${id}`, data);
  }

  deleteCategory(id: number): Observable<{ success: boolean, message: string }> {
    return this.http.delete<{ success: boolean, message: string }>(`${this.baseUrl}/${id}`);
  }
}
