import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ServiceCategory } from '../../../../core/models';
import { InMemoryDataService } from '../../../../core/services/in-memory-data.service';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-category-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    StatusBadgeComponent
  ],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss',
})
export class CategoryListComponent implements OnInit {
  private dataService = inject(InMemoryDataService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  categories = signal<ServiceCategory[]>([]);
  displayedColumns = ['id', 'name', 'status', 'actions'];

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.dataService.getCategories().subscribe(categories => {
      this.categories.set(categories);
    });
  }

  createCategory() {
    this.router.navigate(['/categories/new']);
  }

  editCategory(category: ServiceCategory) {
    this.router.navigate(['/categories', category.id]);
  }

  deleteCategory(category: ServiceCategory) {
    if (confirm(`Sei sicuro di voler eliminare "${category.name}"?`)) {
      this.dataService.deleteCategory(category.id).subscribe(success => {
        if (success) {
          this.snackBar.open('Categoria eliminata con successo', 'Chiudi', { duration: 3000 });
          this.loadCategories();
        } else {
          this.snackBar.open('Impossibile eliminare: ci sono prodotti associati', 'Chiudi', { duration: 5000 });
        }
      });
    }
  }
}
