import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoryStatus } from '../../../../core/models';
import { InMemoryDataService } from '../../../../core/services/in-memory-data.service';

@Component({
  selector: 'app-category-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule
  ],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss',
})
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dataService = inject(InMemoryDataService);
  private snackBar = inject(MatSnackBar);

  categoryForm!: FormGroup;
  isEditMode = signal(false);
  categoryId = signal<number | null>(null);

  statuses = [
    { value: CategoryStatus.Attivo, label: 'Attivo' },
    { value: CategoryStatus.Inattivo, label: 'Inattivo' }
  ];

  languages = [
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  ngOnInit() {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.categoryId.set(+id);
      this.loadCategory(+id);
    }
  }

  initForm() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      status: [CategoryStatus.Attivo, Validators.required],
      imageUrl: [''],
      translations: this.fb.group({
        it: this.fb.group({ name: [''] }),
        en: this.fb.group({ name: [''] }),
        de: this.fb.group({ name: [''] }),
        fr: this.fb.group({ name: [''] }),
        es: this.fb.group({ name: [''] })
      })
    });
  }

  loadCategory(id: number) {
    this.dataService.getCategory(id).subscribe(category => {
      if (category) {
        this.categoryForm.patchValue({
          name: category.name,
          status: category.status,
          imageUrl: category.imageUrl,
          translations: category.translations || {}
        });
      }
    });
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      this.snackBar.open('Compila tutti i campi obbligatori', 'Chiudi', { duration: 3000 });
      return;
    }

    const categoryData = this.categoryForm.value;

    if (this.isEditMode()) {
      this.dataService.updateCategory(this.categoryId()!, categoryData).subscribe(() => {
        this.snackBar.open('Categoria aggiornata con successo', 'Chiudi', { duration: 3000 });
        this.router.navigate(['/categories']);
      });
    } else {
      this.dataService.createCategory(categoryData).subscribe(() => {
        this.snackBar.open('Categoria creata con successo', 'Chiudi', { duration: 3000 });
        this.router.navigate(['/categories']);
      });
    }
  }

  cancel() {
    this.router.navigate(['/categories']);
  }
}
