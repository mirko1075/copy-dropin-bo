import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ServiceProduct } from '../../../../core/models';
import { InMemoryDataService } from '../../../../core/services/in-memory-data.service';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-pricing-list',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    StatusBadgeComponent
  ],
  templateUrl: './pricing-list.html',
  styleUrl: './pricing-list.scss',
})
export class PricingListComponent implements OnInit {
  private dataService = inject(InMemoryDataService);
  private router = inject(Router);

  products = signal<ServiceProduct[]>([]);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.dataService.getProducts().subscribe(products => {
      this.products.set(products);
    });
  }

  managePricing(product: ServiceProduct) {
    this.router.navigate(['/pricing', product.id]);
  }

  formatPrice(price?: number): string {
    if (!price) return '-';
    return '€' + price.toFixed(2);
  }
}
