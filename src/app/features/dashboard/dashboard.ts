import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { InMemoryDataService } from '../../core/services/in-memory-data.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCardModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Placeholder for dashboard logic
  productCount: number = 0;
  categoryCount: number = 0;
  publishedProductCount: number = 0;
  unpublishedProductCount: number = 0;

  subscriptions: Subscription = new Subscription();
  router: Router = inject(Router);
  private dataService = inject(InMemoryDataService);
  constructor() { }

  ngOnInit() {
    this.loadCounters();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }


  private loadCounters() {
    this.subscriptions.add(this.loadProductCount());
    this.subscriptions.add(this.loadCategoryCount());
    this.subscriptions.add(this.loadPublishedProductCount());
    this.subscriptions.add(this.loadUnpublishedProductCount());
  }

  private loadProductCount() {
    this.dataService.getProductCount().subscribe(count => {
      this.productCount = count;
    });
  }

  private loadCategoryCount() {
    this.dataService.getCategoryCount().subscribe(count => {
      this.categoryCount = count;
    });
  }

  private loadPublishedProductCount() {
    this.dataService.getPublishedProductCount().subscribe(count => {
      this.publishedProductCount = count;
    });
  }

  private loadUnpublishedProductCount() {
    this.dataService.getUnpublishedProductCount().subscribe(count => {
      this.unpublishedProductCount = count;
    });
  }
}
