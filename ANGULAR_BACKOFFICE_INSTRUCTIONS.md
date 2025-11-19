# ISTRUZIONI COMPLETE: Angular Backoffice per Gestione Catalogo Servizi

## 📋 INDICE
1. [Overview del Sistema](#overview)
2. [Requisiti Tecnici](#requisiti)
3. [Struttura Dati TypeScript](#struttura-dati)
4. [API Endpoints](#api-endpoints)
5. [Architettura Angular](#architettura)
6. [Funzionalità da Implementare](#funzionalita)
7. [UI/UX Specifications](#ui-ux)
8. [Multi-Tenancy Implementation](#multi-tenancy)
9. [Internazionalizzazione](#i18n)
10. [Examples & Mock Data](#examples)
11. [Comandi Quick Start](#quick-start)
12. [Testing Requirements](#testing)
13. [Deployment](#deployment)
14. [Security Considerations](#security)
15. [Performance Optimization](#performance)
16. [Documentazione Aggiuntiva](#docs)

---

## 1. OVERVIEW DEL SISTEMA {#overview}

Costruire un'applicazione Angular backoffice per gestire:
- **Catalogo Prodotti/Servizi** (hotel spa, ristorante, esperienze, room service)
- **Categorie** con traduzioni multilingua
- **Prezzi e Disponibilità** per periodo e quantità
- **Configurazione Payment Methods** (carta credito, bonifico, PayPal, Scalapay)
- **Multi-tenancy** a 3 livelli (Tenant → Vendor → Site)

### Stack Tecnologico Richiesto
```
- Angular 18+ (ultime versioni)
- TypeScript 5+
- Angular Material (UI components)
- RxJS per reactive programming
- NgRx o Signals per state management (raccomandato)
- Angular Router con guards
- HttpClient per API calls
- Angular Forms (Reactive Forms)
```

---

## 2. REQUISITI TECNICI {#requisiti}

### Versioni Minime
```json
{
  "@angular/core": "^18.0.0",
  "@angular/material": "^18.0.0",
  "typescript": "~5.4.0",
  "rxjs": "~7.8.0"
}
```

### Features Angular da Utilizzare
- Standalone Components (raccomandato)
- Signals API per reactivity
- Typed Forms
- HTTP Interceptors per auth/multi-tenancy
- Route Guards per protezione routes
- Lazy Loading per moduli

---

## 3. STRUTTURA DATI TYPESCRIPT {#struttura-dati}

### 3.1 Product Models

```typescript
// models/service-product.model.ts
export interface ServiceProduct {
  id: number;
  name: string;
  category?: string;
  categoryId: number;
  status: ProductStatus;
  price?: number;
  currency?: string;
  duration?: number;              // Durata in minuti
  numberOfPeople?: number;        // Capacità/numero persone
  imageUrl?: string;
  translations?: ProductTranslations;
}

export enum ProductStatus {
  Bozza = 'bozza',               // Draft - non visibile
  Pubblicato = 'pubblicato',     // Published - visibile nel dropin
  Archiviato = 'archiviato'      // Archived - nascosto ma storicizzato
}

export interface ProductTranslations {
  it?: ProductTranslation;
  en?: ProductTranslation;
  de?: ProductTranslation;
  fr?: ProductTranslation;
  es?: ProductTranslation;
}

export interface ProductTranslation {
  name?: string;
  shortDescription?: string;
  longDescription?: string;
}

// Per il form di creazione/edit
export interface ProductFormData {
  id?: number;
  name: string;
  categoryId: number;
  status: ProductStatus;
  price: number;
  currency: string;
  duration?: number;
  numberOfPeople?: number;
  imageUrl?: string;
  translations: {
    it: ProductTranslation;
    en: ProductTranslation;
    de: ProductTranslation;
    fr: ProductTranslation;
    es: ProductTranslation;
  };
}
```

### 3.2 Category Models

```typescript
// models/service-category.model.ts
export interface ServiceCategory {
  id: number;
  name: string;
  status: CategoryStatus;
  imageUrl?: string;
  translations?: CategoryTranslations;
}

export enum CategoryStatus {
  Attivo = 'attivo',      // Active - visibile
  Inattivo = 'inattivo'   // Inactive - nascosto
}

export interface CategoryTranslations {
  it?: CategoryTranslation;
  en?: CategoryTranslation;
  de?: CategoryTranslation;
  fr?: CategoryTranslation;
  es?: CategoryTranslation;
}

export interface CategoryTranslation {
  name?: string;
}

export interface CategoryFormData {
  id?: number;
  name: string;
  status: CategoryStatus;
  imageUrl?: string;
  translations: {
    it: CategoryTranslation;
    en: CategoryTranslation;
    de: CategoryTranslation;
    fr: CategoryTranslation;
    es: CategoryTranslation;
  };
}
```

### 3.3 Pricing & Availability Models

```typescript
// models/pricing-availability.model.ts
export interface PricingRule {
  id: number;
  productId: number;
  validFrom: string;      // ISO date YYYY-MM-DD
  validTo: string;        // ISO date YYYY-MM-DD
  basePrice: number;
  currency: string;
  minQuantity?: number;
  maxQuantity?: number;
  daysOfWeek?: number[];  // 0=Sunday, 1=Monday, etc.
}

export interface AvailabilitySlot {
  id: number;
  productId: number;
  date: string;           // ISO date YYYY-MM-DD
  startTime?: string;     // HH:mm format
  endTime?: string;       // HH:mm format
  maxCapacity: number;
  bookedQuantity: number;
  available: boolean;
}
```

### 3.4 Payment Configuration Models

```typescript
// models/payment-config.model.ts
export interface PaymentConfig {
  id?: number;
  tenantId: number;
  vendorId: number;
  siteId: number;
  paymentMethods: PaymentMethodsConfig;
  paymentOptions: PaymentOptionsConfig;
}

export interface PaymentMethodsConfig {
  creditCard: CreditCardConfig;
  bankTransfer: BankTransferConfig;
  paypal: PayPalConfig;
  scalapay: ScalapayConfig;
}

export interface CreditCardConfig {
  enabled: boolean;
  types: CreditCardType[];        // Multiple card types
  requiresCvv: boolean;
  gatewayProvider: PaymentGatewayProvider;
  isGuarantee: boolean;
}

export enum CreditCardType {
  Visa = 1,
  Mastercard = 2,
  Amex = 4,
  Discover = 8,
  DinersClub = 16,
  JCB = 32
}

export type PaymentGatewayProvider =
  | 'stripe'
  | 'braintree'
  | 'paypal'
  | 'nexi'
  | 'gestpay'
  | 'custom';

export interface BankTransferConfig {
  enabled: boolean;
  minDaysBeforeArrival: number;
  ibanRequired: boolean;
  accountDetails?: {
    bankName: string;
    iban: string;
    swift: string;
    accountHolder: string;
    additionalInfo?: string;
  };
}

export interface PayPalConfig {
  enabled: boolean;
  clientId?: string;
  environment: 'sandbox' | 'production';
}

export interface ScalapayConfig {
  enabled: boolean;
  numInstallments: number;       // Es: 3 rate
  minAmount: number;
  maxAmount?: number;
}

export interface PaymentOptionsConfig {
  allowFullPayment: boolean;
  allowDeposit: boolean;
  allowInstallments: boolean;
  depositPercentage?: number;    // Es: 30 (%)
  depositFixedAmount?: number;   // Es: 50.00 (EUR)
}
```

### 3.5 Multi-Tenancy Models

```typescript
// models/multi-tenancy.model.ts
export interface Tenant {
  id: number;
  name: string;
  domain?: string;
  logoUrl?: string;
  active: boolean;
}

export interface Vendor {
  id: number;
  tenantId: number;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  active: boolean;
}

export interface Site {
  id: number;
  vendorId: number;
  name: string;
  locale: string;         // Es: 'it_IT', 'en_US'
  active: boolean;
}

export interface TenantContext {
  tenantId: number;
  vendorId: number;
  siteId: number;
  locale: string;
}
```

---

## 4. API ENDPOINTS {#api-endpoints}

### Base URL
```
https://api.example.com/backoffice/v1
```

### Authentication
Tutti gli endpoint richiedono autenticazione JWT:
```
Authorization: Bearer <jwt-token>
```

### 4.1 Products Endpoints

```typescript
// GET /api/products
// Query params: tenantId, vendorId, siteId, status?, categoryId?, page?, limit?
GET /api/products?tenantId=1&vendorId=1&siteId=1&status=pubblicato
Response: {
  data: ServiceProduct[],
  total: number,
  page: number,
  limit: number
}

// GET /api/products/:id
GET /api/products/101
Response: ServiceProduct

// POST /api/products
POST /api/products
Body: ProductFormData
Response: ServiceProduct

// PUT /api/products/:id
PUT /api/products/101
Body: ProductFormData
Response: ServiceProduct

// DELETE /api/products/:id
DELETE /api/products/101
Response: { success: boolean, message: string }

// PATCH /api/products/:id/status
PATCH /api/products/101/status
Body: { status: ProductStatus }
Response: ServiceProduct
```

### 4.2 Categories Endpoints

```typescript
// GET /api/categories
GET /api/categories?tenantId=1&vendorId=1&siteId=1&status=attivo
Response: {
  data: ServiceCategory[],
  total: number
}

// GET /api/categories/:id
GET /api/categories/1
Response: ServiceCategory

// POST /api/categories
POST /api/categories
Body: CategoryFormData
Response: ServiceCategory

// PUT /api/categories/:id
PUT /api/categories/1
Body: CategoryFormData
Response: ServiceCategory

// DELETE /api/categories/:id
DELETE /api/categories/1
Response: { success: boolean, message: string }
```

### 4.3 Pricing & Availability Endpoints

```typescript
// GET /api/pricing-rules
GET /api/pricing-rules?productId=101
Response: {
  data: PricingRule[]
}

// POST /api/pricing-rules
POST /api/pricing-rules
Body: PricingRule
Response: PricingRule

// GET /api/availability
GET /api/availability?productId=101&dateFrom=2025-01-01&dateTo=2025-01-31
Response: {
  data: AvailabilitySlot[]
}

// PUT /api/availability/:id
PUT /api/availability/1
Body: AvailabilitySlot
Response: AvailabilitySlot

// POST /api/availability/bulk
POST /api/availability/bulk
Body: {
  productId: number,
  dateFrom: string,
  dateTo: string,
  maxCapacity: number,
  slots?: { startTime: string, endTime: string }[]
}
Response: { created: number, slots: AvailabilitySlot[] }
```

### 4.4 Payment Configuration Endpoints

```typescript
// GET /api/payment-config
GET /api/payment-config?tenantId=1&vendorId=1&siteId=1
Response: PaymentConfig

// PUT /api/payment-config
PUT /api/payment-config
Body: PaymentConfig
Response: PaymentConfig

// Cascading: ottieni config con inherit da livelli superiori
GET /api/payment-config/cascading?tenantId=1&vendorId=1&siteId=1
Response: {
  config: PaymentConfig,
  inheritedFrom: 'tenant' | 'vendor' | 'site'
}
```

### 4.5 Multi-Tenancy Endpoints

```typescript
// GET /api/tenants
GET /api/tenants
Response: { data: Tenant[] }

// GET /api/vendors
GET /api/vendors?tenantId=1
Response: { data: Vendor[] }

// GET /api/sites
GET /api/sites?vendorId=1
Response: { data: Site[] }
```

---

## 5. ARCHITETTURA ANGULAR {#architettura}

### 5.1 Struttura Cartelle

```
src/
├── app/
│   ├── core/                    # Singleton services, guards, interceptors
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── tenant-context.service.ts
│   │   │   └── api-base.service.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── tenant-selection.guard.ts
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts
│   │   │   └── tenant-context.interceptor.ts
│   │   └── models/
│   │       └── (tutti i models TS)
│   │
│   ├── shared/                  # Shared components, pipes, directives
│   │   ├── components/
│   │   │   ├── page-header/
│   │   │   ├── data-table/
│   │   │   ├── status-badge/
│   │   │   ├── translation-editor/
│   │   │   └── image-uploader/
│   │   ├── pipes/
│   │   │   ├── currency.pipe.ts
│   │   │   └── status-label.pipe.ts
│   │   └── validators/
│   │       └── custom-validators.ts
│   │
│   ├── features/                # Feature modules (lazy loaded)
│   │   ├── dashboard/
│   │   │   ├── dashboard.component.ts
│   │   │   └── dashboard.routes.ts
│   │   │
│   │   ├── products/
│   │   │   ├── components/
│   │   │   │   ├── product-list/
│   │   │   │   ├── product-form/
│   │   │   │   └── product-detail/
│   │   │   ├── services/
│   │   │   │   └── products-api.service.ts
│   │   │   └── products.routes.ts
│   │   │
│   │   ├── categories/
│   │   │   ├── components/
│   │   │   │   ├── category-list/
│   │   │   │   └── category-form/
│   │   │   ├── services/
│   │   │   │   └── categories-api.service.ts
│   │   │   └── categories.routes.ts
│   │   │
│   │   ├── pricing/
│   │   │   ├── components/
│   │   │   │   ├── pricing-rules-list/
│   │   │   │   ├── pricing-rule-form/
│   │   │   │   └── availability-calendar/
│   │   │   ├── services/
│   │   │   │   ├── pricing-api.service.ts
│   │   │   │   └── availability-api.service.ts
│   │   │   └── pricing.routes.ts
│   │   │
│   │   ├── payment-config/
│   │   │   ├── components/
│   │   │   │   ├── payment-methods-config/
│   │   │   │   └── payment-options-config/
│   │   │   ├── services/
│   │   │   │   └── payment-config-api.service.ts
│   │   │   └── payment-config.routes.ts
│   │   │
│   │   └── settings/
│   │       ├── components/
│   │       │   ├── tenant-selector/
│   │       │   └── profile-settings/
│   │       └── settings.routes.ts
│   │
│   ├── layout/                  # Layout components
│   │   ├── main-layout/
│   │   ├── sidebar/
│   │   ├── header/
│   │   └── breadcrumbs/
│   │
│   └── app.routes.ts            # Main routing
│
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

### 5.2 Services Principali

#### TenantContextService
```typescript
// core/services/tenant-context.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private contextSignal = signal<TenantContext | null>(null);

  context = this.contextSignal.asReadonly();

  setContext(context: TenantContext): void {
    this.contextSignal.set(context);
    localStorage.setItem('tenant-context', JSON.stringify(context));
  }

  loadContext(): void {
    const stored = localStorage.getItem('tenant-context');
    if (stored) {
      this.contextSignal.set(JSON.parse(stored));
    }
  }

  clearContext(): void {
    this.contextSignal.set(null);
    localStorage.removeItem('tenant-context');
  }
}
```

#### ProductsApiService
```typescript
// features/products/services/products-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

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
  }): Observable<{ data: ServiceProduct[], total: number }> {
    let httpParams = new HttpParams()
      .set('tenantId', params.tenantId)
      .set('vendorId', params.vendorId)
      .set('siteId', params.siteId);

    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);

    return this.http.get<{ data: ServiceProduct[], total: number }>(
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

  deleteProduct(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: number, status: ProductStatus): Observable<ServiceProduct> {
    return this.http.patch<ServiceProduct>(`${this.baseUrl}/${id}/status`, { status });
  }
}
```

### 5.3 HTTP Interceptor per Multi-Tenancy

```typescript
// core/interceptors/tenant-context.interceptor.ts
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
```

---

## 6. FUNZIONALITÀ DA IMPLEMENTARE {#funzionalita}

### 6.1 Gestione Prodotti

**Product List Component**
- Tabella con colonne: ID, Nome, Categoria, Prezzo, Status, Azioni
- Filtri: Status, Categoria, Ricerca per nome
- Paginazione
- Azioni: Edit, Delete, Change Status
- Badge colorati per status (Draft=yellow, Published=green, Archived=gray)

**Product Form Component**
- Form reattivo con validazione
- Campi:
  - Nome (required)
  - Categoria (select, required)
  - Status (select, required)
  - Prezzo (number, min=0)
  - Valuta (select: EUR, USD, GBP)
  - Durata in minuti (number)
  - Numero persone (number)
  - URL immagine
  - **Translation Editor**: Tab per ogni lingua (IT, EN, DE, FR, ES)
    - Nome tradotto
    - Descrizione breve
    - Descrizione lunga (textarea o rich text editor)

**Validazioni:**
```typescript
productForm = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(3)]],
  categoryId: [null, Validators.required],
  status: ['bozza', Validators.required],
  price: [0, [Validators.required, Validators.min(0)]],
  currency: ['EUR', Validators.required],
  duration: [null, Validators.min(1)],
  numberOfPeople: [null, Validators.min(1)],
  imageUrl: ['', Validators.pattern(/^https?:\/\/.+/)],
  translations: this.fb.group({
    it: this.fb.group({
      name: [''],
      shortDescription: [''],
      longDescription: ['']
    }),
    en: this.fb.group({ /* same */ }),
    de: this.fb.group({ /* same */ }),
    fr: this.fb.group({ /* same */ }),
    es: this.fb.group({ /* same */ })
  })
});
```

### 6.2 Gestione Categorie

**Category List Component**
- Tabella semplice: ID, Nome, Status, Azioni
- Filtro per Status
- Drag & drop per riordinare (opzionale)

**Category Form Component**
- Nome (required)
- Status (select)
- URL immagine
- Translation Editor per nome in 5 lingue

### 6.3 Gestione Prezzi e Disponibilità

**Pricing Rules Component**
- Tabella regole di prezzo per prodotto
- Campi:
  - Periodo validità (data inizio/fine)
  - Prezzo base
  - Quantità min/max
  - Giorni settimana applicabili
- Possibilità di sovrapporre regole (priorità per data più recente)

**Availability Calendar Component**
- Calendario mensile con slot di disponibilità
- Click su giorno per editare:
  - Capacità massima
  - Orari disponibili (opzionale)
  - Stato (disponibile/non disponibile)
- Bulk create: genera slot per range date

### 6.4 Configurazione Payment Methods

**Payment Methods Config Component**
- Sezioni con toggle per ogni metodo:

**Credit Card Section:**
- Enable/Disable toggle
- Multiselect card types (Visa, Mastercard, Amex, etc.)
- Gateway provider (select)
- Requires CVV (checkbox)
- Is Guarantee (checkbox)

**Bank Transfer Section:**
- Enable/Disable toggle
- Min days before arrival (number)
- IBAN required (checkbox)
- Account details (form group)

**PayPal Section:**
- Enable/Disable toggle
- Client ID (input)
- Environment (select: sandbox/production)

**Scalapay Section:**
- Enable/Disable toggle
- Number of installments (select: 3/4)
- Min/Max amount

**Payment Options Section:**
- Allow full payment (checkbox)
- Allow deposit (checkbox)
- Deposit percentage (number, if deposit enabled)
- Allow installments (checkbox)

### 6.5 Multi-Tenancy Management

**Tenant Selector Component**
- Dropdown a 3 livelli:
  1. Seleziona Tenant
  2. Seleziona Vendor (filtered by tenant)
  3. Seleziona Site (filtered by vendor)
- Salva selezione in localStorage
- Aggiorna automaticamente context service
- Mostra context corrente in header/sidebar

**Cascading Configuration Indicator**
- Mostra badge se config è ereditata da livello superiore
- Pulsante "Override" per creare config custom al livello corrente

---

## 7. UI/UX SPECIFICATIONS {#ui-ux}

### 7.1 Angular Material Components da Utilizzare

```typescript
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
```

### 7.2 Layout Principale

```
┌─────────────────────────────────────────────────────────┐
│ HEADER                                           [User] │
│ Catalogo Servizi Backoffice    [Tenant: X | Vendor: Y] │
├─────────┬───────────────────────────────────────────────┤
│ SIDEBAR │ MAIN CONTENT                                  │
│         │                                               │
│ Dashboard│ ┌────────────────────────────────────────┐   │
│ Prodotti │ │  PAGE HEADER                          │   │
│ Categorie│ │  Breadcrumbs > Products > List        │   │
│ Prezzi   │ └────────────────────────────────────────┘   │
│ Disponib.│                                               │
│ Payment  │ ┌────────────────────────────────────────┐   │
│ Config   │ │  FILTERS & ACTIONS                    │   │
│ Settings │ │  [Search] [Status Filter] [+ New]     │   │
│          │ └────────────────────────────────────────┘   │
│          │                                               │
│          │ ┌────────────────────────────────────────┐   │
│          │ │  DATA TABLE                           │   │
│          │ │  ┌──┬─────┬─────┬──────┬──────────┐   │   │
│          │ │  │ID│Name │Cat  │Price │Status│Act│   │   │
│          │ │  ├──┼─────┼─────┼──────┼──────────┤   │   │
│          │ │  │..│.... │.... │..... │......│...│   │   │
│          │ │  └──┴─────┴─────┴──────┴──────────┘   │   │
│          │ │                                       │   │
│          │ │  [Pagination: 1-10 of 50]             │   │
│          │ └────────────────────────────────────────┘   │
└─────────┴───────────────────────────────────────────────┘
```

### 7.3 Color Scheme & Status Badges

```scss
// Status colors
$status-draft: #FFA726;      // Orange
$status-published: #66BB6A;  // Green
$status-archived: #BDBDBD;   // Gray
$status-active: #66BB6A;     // Green
$status-inactive: #F44336;   // Red

// Primary colors
$primary: #1976D2;           // Blue
$accent: #FF4081;            // Pink
$warn: #F44336;              // Red
```

**Status Badge Component:**
```html
<mat-chip [ngClass]="'status-' + status">
  {{ status | statusLabel }}
</mat-chip>
```

### 7.4 Responsive Breakpoints

```scss
$mobile: 600px;
$tablet: 960px;
$desktop: 1280px;

@media (max-width: $mobile) {
  // Mobile: hide sidebar, hamburger menu
  mat-sidenav { display: none; }
  mat-toolbar { /* compact */ }
}

@media (min-width: $tablet) {
  // Tablet/Desktop: show sidebar
  mat-sidenav { width: 250px; }
}
```

---

## 8. MULTI-TENANCY IMPLEMENTATION {#multi-tenancy}

### 8.1 Context Selection Flow

```typescript
// 1. User selects tenant
selectTenant(tenantId: number): void {
  this.selectedTenant = tenantId;
  this.loadVendors(tenantId);
  this.selectedVendor = null;
  this.selectedSite = null;
}

// 2. User selects vendor
selectVendor(vendorId: number): void {
  this.selectedVendor = vendorId;
  this.loadSites(vendorId);
  this.selectedSite = null;
}

// 3. User selects site
selectSite(siteId: number): void {
  this.selectedSite = siteId;
  this.applyContext();
}

// 4. Apply context globally
applyContext(): void {
  const context: TenantContext = {
    tenantId: this.selectedTenant!,
    vendorId: this.selectedVendor!,
    siteId: this.selectedSite!,
    locale: 'it_IT'
  };

  this.tenantContextService.setContext(context);
  this.router.navigate(['/dashboard']);
}
```

### 8.2 Cascading Configuration Logic

```typescript
// Esempio: Payment Config con cascading
async loadPaymentConfig(): Promise<void> {
  const context = this.tenantContextService.context();
  if (!context) return;

  // Prima tenta di caricare config specifico del site
  try {
    const siteConfig = await this.api.getPaymentConfig(
      context.tenantId,
      context.vendorId,
      context.siteId
    ).toPromise();

    if (siteConfig) {
      this.config = siteConfig;
      this.inheritedFrom = 'site';
      return;
    }
  } catch (e) {
    // Nessun config site, prova vendor
  }

  // Se non esiste, carica config vendor
  try {
    const vendorConfig = await this.api.getPaymentConfig(
      context.tenantId,
      context.vendorId,
      0  // siteId = 0
    ).toPromise();

    if (vendorConfig) {
      this.config = vendorConfig;
      this.inheritedFrom = 'vendor';
      return;
    }
  } catch (e) {
    // Nessun config vendor, usa tenant
  }

  // Fallback a tenant-level config
  const tenantConfig = await this.api.getPaymentConfig(
    context.tenantId,
    0,  // vendorId = 0
    0   // siteId = 0
  ).toPromise();

  this.config = tenantConfig;
  this.inheritedFrom = 'tenant';
}
```

### 8.3 UI Indicator per Config Ereditata

```html
<mat-card class="config-card">
  <mat-card-header>
    <mat-card-title>Payment Configuration</mat-card-title>
    <mat-chip *ngIf="inheritedFrom !== 'site'" color="accent">
      Inherited from {{ inheritedFrom }}
    </mat-chip>
  </mat-card-header>

  <mat-card-content>
    <!-- Form fields -->
  </mat-card-content>

  <mat-card-actions>
    <button
      mat-raised-button
      color="primary"
      *ngIf="inheritedFrom !== 'site'"
      (click)="createSiteOverride()"
    >
      <mat-icon>content_copy</mat-icon>
      Create Site Override
    </button>

    <button
      mat-raised-button
      color="primary"
      (click)="saveConfig()"
    >
      <mat-icon>save</mat-icon>
      Save
    </button>
  </mat-card-actions>
</mat-card>
```

---

## 9. INTERNAZIONALIZZAZIONE {#i18n}

### 9.1 Setup @angular/localize

```bash
ng add @angular/localize
```

```typescript
// app.config.ts
import { provideTranslations } from '@angular/localize/init';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTranslations({
      locale: 'it-IT',
      translations: {
        // ... translations
      }
    })
  ]
};
```

### 9.2 Translation Editor Component

```typescript
@Component({
  selector: 'app-translation-editor',
  template: `
    <mat-tab-group>
      <mat-tab label="🇮🇹 Italiano">
        <ng-container [ngTemplateOutlet]="langForm"
                      [ngTemplateOutletContext]="{lang: 'it'}">
        </ng-container>
      </mat-tab>

      <mat-tab label="🇬🇧 English">
        <ng-container [ngTemplateOutlet]="langForm"
                      [ngTemplateOutletContext]="{lang: 'en'}">
        </ng-container>
      </mat-tab>

      <!-- Repeat for DE, FR, ES -->
    </mat-tab-group>

    <ng-template #langForm let-lang="lang">
      <div [formGroupName]="lang" class="translation-form">
        <mat-form-field>
          <mat-label>Name</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>

        <mat-form-field>
          <mat-label>Short Description</mat-label>
          <textarea matInput formControlName="shortDescription"></textarea>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Long Description</mat-label>
          <textarea matInput
                    formControlName="longDescription"
                    rows="5">
          </textarea>
        </mat-form-field>
      </div>
    </ng-template>
  `
})
export class TranslationEditorComponent {
  @Input() translationsGroup!: FormGroup;
}
```

### 9.3 Supported Locales

```typescript
export const SUPPORTED_LOCALES = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];
```

---

## 10. EXAMPLES & MOCK DATA {#examples}

### 10.1 Mock Products (da usare per testing)

```typescript
export const MOCK_PRODUCTS: ServiceProduct[] = [
  {
    id: 101,
    name: 'Massaggio Rilassante',
    category: 'Wellness & SPA',
    categoryId: 1,
    status: ProductStatus.Pubblicato,
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
    price: 80.00,
    currency: 'EUR',
    duration: 60,
    translations: {
      it: {
        name: 'Massaggio Rilassante',
        shortDescription: 'Un massaggio completo di 60 minuti',
        longDescription: 'Massaggio rilassante di 60 minuti che utilizza oli essenziali naturali...'
      },
      en: {
        name: 'Relaxing Massage',
        shortDescription: 'A complete 60-minute massage',
        longDescription: '60-minute relaxing massage using natural essential oils...'
      }
    }
  },
  {
    id: 201,
    name: 'Cena Romantica',
    category: 'Ristorante',
    categoryId: 2,
    status: ProductStatus.Pubblicato,
    price: 120.00,
    currency: 'EUR',
    numberOfPeople: 2,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    duration: 180,
    translations: {
      it: {
        name: 'Cena Romantica',
        shortDescription: 'Menu degustazione per due persone',
        longDescription: 'Una serata indimenticabile con menu degustazione di 5 portate...'
      },
      en: {
        name: 'Romantic Dinner',
        shortDescription: 'Tasting menu for two people',
        longDescription: 'An unforgettable evening with a 5-course tasting menu...'
      }
    }
  }
];
```

### 10.2 Mock Categories

```typescript
export const MOCK_CATEGORIES: ServiceCategory[] = [
  {
    id: 1,
    name: 'Wellness & SPA',
    status: CategoryStatus.Attivo,
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
    translations: {
      it: { name: 'Benessere & SPA' },
      en: { name: 'Wellness & SPA' },
      de: { name: 'Wellness & SPA' },
      fr: { name: 'Bien-être & SPA' },
      es: { name: 'Bienestar & SPA' }
    }
  },
  {
    id: 2,
    name: 'Ristorante',
    status: CategoryStatus.Attivo,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    translations: {
      it: { name: 'Ristorante' },
      en: { name: 'Restaurant' },
      de: { name: 'Restaurant' },
      fr: { name: 'Restaurant' },
      es: { name: 'Restaurante' }
    }
  }
];
```

### 10.3 Mock Payment Config

```typescript
export const MOCK_PAYMENT_CONFIG: PaymentConfig = {
  tenantId: 1,
  vendorId: 1,
  siteId: 1,
  paymentMethods: {
    creditCard: {
      enabled: true,
      types: [
        CreditCardType.Visa,
        CreditCardType.Mastercard,
        CreditCardType.Amex
      ],
      requiresCvv: true,
      gatewayProvider: 'stripe',
      isGuarantee: false
    },
    bankTransfer: {
      enabled: true,
      minDaysBeforeArrival: 7,
      ibanRequired: true,
      accountDetails: {
        bankName: 'Banca Intesa',
        iban: 'IT60X0542811101000000123456',
        swift: 'BCITITMM',
        accountHolder: 'Hotel Management SRL'
      }
    },
    paypal: {
      enabled: true,
      clientId: 'AeA1QIZXbfe...',
      environment: 'production'
    },
    scalapay: {
      enabled: true,
      numInstallments: 3,
      minAmount: 50,
      maxAmount: 1500
    }
  },
  paymentOptions: {
    allowFullPayment: true,
    allowDeposit: true,
    allowInstallments: false,
    depositPercentage: 30
  }
};
```

---

## 11. COMANDI QUICK START {#quick-start}

```bash
# 1. Crea nuovo progetto Angular
ng new backoffice-servizi --routing --style=scss --standalone

cd backoffice-servizi

# 2. Installa Angular Material
ng add @angular/material

# 3. Installa dipendenze extra
npm install @ngrx/store @ngrx/effects  # se usi NgRx
# OPPURE
# (niente da installare se usi Signals - già in Angular 18+)

# 4. Genera struttura
ng generate component core/layout/main-layout
ng generate component core/layout/sidebar
ng generate component core/layout/header

ng generate service core/services/tenant-context
ng generate service core/services/auth
ng generate guard core/guards/auth

ng generate component features/products/components/product-list
ng generate component features/products/components/product-form
ng generate service features/products/services/products-api

ng generate component features/categories/components/category-list
ng generate component features/categories/components/category-form
ng generate service features/categories/services/categories-api

# 5. Crea interceptors
ng generate interceptor core/interceptors/auth
ng generate interceptor core/interceptors/tenant-context

# 6. Avvia dev server
ng serve
```

---

## 12. TESTING REQUIREMENTS {#testing}

### Unit Tests
```typescript
// Example: ProductsApiService test
describe('ProductsApiService', () => {
  let service: ProductsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductsApiService]
    });
    service = TestBed.inject(ProductsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch products with correct params', () => {
    const mockProducts = { data: MOCK_PRODUCTS, total: 2 };

    service.getProducts({
      tenantId: 1,
      vendorId: 1,
      siteId: 1
    }).subscribe(result => {
      expect(result.data.length).toBe(2);
      expect(result.total).toBe(2);
    });

    const req = httpMock.expectOne(
      req => req.url.includes('/api/products')
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('tenantId')).toBe('1');
    req.flush(mockProducts);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
```

### E2E Tests
```typescript
// Example: Product creation flow
describe('Product Management', () => {
  it('should create a new product', () => {
    cy.visit('/products');
    cy.get('[data-test="new-product-btn"]').click();

    // Fill form
    cy.get('[formControlName="name"]').type('New Product');
    cy.get('[formControlName="categoryId"]').select('1');
    cy.get('[formControlName="price"]').type('99.99');

    // Submit
    cy.get('[data-test="save-btn"]').click();

    // Verify
    cy.get('mat-snack-bar').should('contain', 'Product created');
    cy.url().should('include', '/products');
  });
});
```

---

## 13. DEPLOYMENT {#deployment}

### Environment Files

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  auth: {
    clientId: 'backoffice-dev',
    authority: 'http://localhost:8080/auth'
  }
};

// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com',
  auth: {
    clientId: 'backoffice-prod',
    authority: 'https://auth.example.com'
  }
};
```

### Build Commands

```bash
# Development build
ng build

# Production build
ng build --configuration production

# Build with specific environment
ng build --configuration staging
```

---

## 14. SECURITY CONSIDERATIONS {#security}

### Authentication
- Implementare JWT-based authentication
- Refresh token mechanism
- Auto-logout dopo inattività

### Authorization
- Role-based access control (RBAC)
- Ruoli: Admin, Manager, Editor, Viewer
- Proteggere routes con guards

```typescript
export enum UserRole {
  Admin = 'admin',
  Manager = 'manager',
  Editor = 'editor',
  Viewer = 'viewer'
}

// Guard example
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const user = authService.currentUser();

  if (user?.role === UserRole.Admin) {
    return true;
  }

  return inject(Router).createUrlTree(['/unauthorized']);
};
```

### Data Protection
- Validare sempre input client-side E server-side
- Sanitize HTML content (use DomSanitizer)
- HTTPS only in production
- CORS configuration

---

## 15. PERFORMANCE OPTIMIZATION {#performance}

### Lazy Loading
```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes')
      .then(m => m.PRODUCTS_ROUTES)
  },
  {
    path: 'categories',
    loadChildren: () => import('./features/categories/categories.routes')
      .then(m => m.CATEGORIES_ROUTES)
  }
];
```

### Virtual Scrolling per Tabelle Grandi
```html
<cdk-virtual-scroll-viewport itemSize="50" class="table-viewport">
  <table mat-table [dataSource]="products">
    <!-- columns -->
  </table>
</cdk-virtual-scroll-viewport>
```

### OnPush Change Detection
```typescript
@Component({
  selector: 'app-product-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class ProductListComponent { }
```

---

## 16. DOCUMENTAZIONE AGGIUNTIVA {#docs}

### README.md
```markdown
# Backoffice Servizi - Gestione Catalogo

Applicazione Angular per la gestione del catalogo prodotti/servizi.

## Setup Locale
1. `npm install`
2. Configura `environment.ts` con API URL
3. `ng serve`
4. Apri http://localhost:4200

## Build Produzione
`ng build --configuration production`

## Test
- Unit: `ng test`
- E2E: `ng e2e`

## Architettura
- **Core**: Services singleton, guards, interceptors
- **Shared**: Componenti riutilizzabili
- **Features**: Moduli lazy-loaded per funzionalità

## API
Vedi `/docs/API.md` per documentazione completa endpoint.
```

---

## CONCLUSIONE

Queste istruzioni coprono tutti gli aspetti necessari per costruire un backoffice Angular completo per la gestione del catalogo servizi.

**Punti chiave:**
✅ TypeScript models completamente tipizzati
✅ API endpoints con pattern REST
✅ Multi-tenancy a 3 livelli (Tenant/Vendor/Site)
✅ Sistema traduzioni 5 lingue
✅ UI moderna con Angular Material
✅ Architettura scalabile e mantenibile
✅ Security best practices
✅ Testing strategy

**Next Steps:**
1. Copia queste istruzioni e forniscile allo sviluppatore Angular
2. Setup progetto con `ng new`
3. Implementare feature per feature (products → categories → pricing → payment)
4. Iterare e testare

Buon lavoro! 🚀
