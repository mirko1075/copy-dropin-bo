import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ServiceProduct } from '../../../../core/models';
import { InMemoryDataService } from '../../../../core/services/in-memory-data.service';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormField,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    StatusBadgeComponent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductListComponent implements OnInit, OnDestroy {
  private dataService = inject(InMemoryDataService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  subscriptions: Subscription = new Subscription();
  filterValue: string = '';
  products = signal<ServiceProduct[]>([]);
  filteredProducts = signal<ServiceProduct[]>([]);
  displayedColumns = ['id', 'name', 'category', 'price', 'duration', 'status', 'actions'];
  statusArray: string[] = [];
  categoryArray: { id: string, name: string | undefined }[] = [];

  priceMin: number = 0;
  priceMax: number = 1000;
  selectedStatus: string = '';
  selectedCategory: string = '';

  onPriceMinChange(value: number) {
    this.priceMin = value;
    this.filterProducts();
  }

  onPriceMaxChange(value: number) {
    this.priceMax = value;
    this.filterProducts();
  }

  ngOnInit() {
    this.loadProducts();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadProducts() {
    this.subscriptions.add(this.dataService.getProducts().subscribe(products => {
      this.products.set(products);
      this.filteredProducts.set(products);
      this.statusArray = [...new Set(products.map(product => product.status))];
      // Ensure unique categoryId values
      this.getCategoriesArray(products);
    }));
  }


  private getCategoriesArray(products: ServiceProduct[]) {
    const categoryMap = new Map<string, string | undefined>();
    products.forEach(product => {
      categoryMap.set(product.categoryId.toString(), product.category);
    });
    this.categoryArray = Array.from(categoryMap.entries()).map(([id, name]) => ({ id, name }));
  }

  createProduct() {
    this.router.navigate(['/products/new']);
  }

  editProduct(product: ServiceProduct) {
    this.router.navigate(['/products', product.id]);
  }

  deleteProduct(product: ServiceProduct) {
    if (confirm(`Sei sicuro di voler eliminare "${product.name}"?`)) {
      this.dataService.deleteProduct(product.id).subscribe(() => {
        this.snackBar.open('Prodotto eliminato con successo', 'Chiudi', { duration: 3000 });
        this.loadProducts();
      });
    }
  }

  formatPrice(product: ServiceProduct): string {
    if (!product.price) return '-';
    return `€${product.price.toFixed(2)}`;
  }

  formatDuration(minutes?: number): string {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  }

  onTextFilterChange(value: string) {
    this.filterValue = value;
    this.filterProducts();
  }

  filterProducts() {
    const filtered = this.products().filter(product => {
      const matchesText = product.name.toLowerCase().includes(this.filterValue.toLowerCase())
        || product.category?.toLowerCase().includes(this.filterValue.toLowerCase());
      const matchesPrice = product.price >= this.priceMin && product.price <= this.priceMax;
      const matchesStatus = this.selectedStatus === '' || product.status === this.selectedStatus;
      const matchesCategory = this.selectedCategory === '' || product.categoryId.toString() === this.selectedCategory;
      return matchesText && matchesPrice && matchesStatus && matchesCategory;
    });
    this.filteredProducts.set(filtered);
    this.setFiltersRestingValues();
  }

  onStatusChange(value: string) {
    this.selectedStatus = value;
    this.filterProducts();
  }

  onCategoryChange(value: string) {
    this.selectedCategory = value;
    this.filterProducts();
  }

  setFiltersRestingValues() {
    this.statusArray = [...new Set(this.filteredProducts().map(product => product.status))];
    this.getCategoriesArray(this.filteredProducts());
    this.selectedStatus = '';
    this.selectedCategory = '';
  }
}
