import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ServiceProduct, ProductFormData, ProductStatus } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/products`;

  getProducts(params: {
    tenantId: number;
    vendorId: number;
    siteId: number;
    status?: ProductStatus;
    categoryId?: number;
    page?: number;
    limit?: number;
  }): Observable<{ data: ServiceProduct[], total: number, page: number, limit: number }> {
    let httpParams = new HttpParams()
      .set('tenantId', params.tenantId)
      .set('vendorId', params.vendorId)
      .set('siteId', params.siteId);

    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);

    return this.http.get<{ data: ServiceProduct[], total: number, page: number, limit: number }>(
      this.baseUrl,
      { params: httpParams }
    );
  }

  getProduct(id: number): Observable<ServiceProduct> {
    return this.http.get<ServiceProduct>(`${this.baseUrl}/${id}`);
  }

  createProduct(data: ProductFormData): Observable<ServiceProduct> {
    return this.http.post<ServiceProduct>(this.baseUrl, data);
  }

  updateProduct(id: number, data: ProductFormData): Observable<ServiceProduct> {
    return this.http.put<ServiceProduct>(`${this.baseUrl}/${id}`, data);
  }

  deleteProduct(id: number): Observable<{ success: boolean, message: string }> {
    return this.http.delete<{ success: boolean, message: string }>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: number, status: ProductStatus): Observable<ServiceProduct> {
    return this.http.patch<ServiceProduct>(`${this.baseUrl}/${id}/status`, { status });
  }
}
