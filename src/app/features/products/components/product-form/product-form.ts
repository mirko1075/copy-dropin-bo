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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ServiceProduct, ProductStatus, ServiceCategory } from '../../../../core/models';
import { InMemoryDataService } from '../../../../core/services/in-memory-data.service';

@Component({
  selector: 'app-product-form',
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
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dataService = inject(InMemoryDataService);
  private snackBar = inject(MatSnackBar);

  productForm!: FormGroup;
  isEditMode = signal(false);
  productId = signal<number | null>(null);
  categories = signal<ServiceCategory[]>([]);

  statuses = [
    { value: ProductStatus.Bozza, label: 'Bozza' },
    { value: ProductStatus.Pubblicato, label: 'Pubblicato' },
    { value: ProductStatus.Archiviato, label: 'Archiviato' }
  ];

  languages = [
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  ngOnInit() {
    this.initForm();
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.productId.set(+id);
      this.loadProduct(+id);
    }
  }

  initForm() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      categoryId: [null, Validators.required],
      status: [ProductStatus.Bozza, Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      currency: ['EUR', Validators.required],
      duration: [null, Validators.min(1)],
      numberOfPeople: [1, Validators.min(1)],
      stock: [null, Validators.min(0)],
      availabilityStartDate: [null],
      availabilityEndDate: [null],
      imageUrl: [''],
      translations: this.fb.group({
        it: this.fb.group({
          name: [''],
          shortDescription: [''],
          longDescription: ['']
        }),
        en: this.fb.group({
          name: [''],
          shortDescription: [''],
          longDescription: ['']
        }),
        de: this.fb.group({
          name: [''],
          shortDescription: [''],
          longDescription: ['']
        }),
        fr: this.fb.group({
          name: [''],
          shortDescription: [''],
          longDescription: ['']
        })
      })
    });
  }

  loadCategories() {
    this.dataService.getCategories().subscribe(categories => {
      this.categories.set(categories);
    });
  }

  loadProduct(id: number) {
    this.dataService.getProduct(id).subscribe(product => {
      if (product) {
        this.productForm.patchValue({
          name: product.name,
          categoryId: product.categoryId,
          status: product.status,
          price: product.price,
          currency: product.currency || 'EUR',
          duration: product.duration,
          numberOfPeople: product.numberOfPeople,
          stock: product.stock,
          availabilityStartDate: product.availabilityStartDate,
          availabilityEndDate: product.availabilityEndDate,
          imageUrl: product.imageUrl,
          translations: product.translations || {}
        });
      }
    });
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.snackBar.open('Compila tutti i campi obbligatori', 'Chiudi', { duration: 3000 });
      return;
    }

    const formValue = this.productForm.value;
    const category = this.categories().find(c => c.id === formValue.categoryId);

    const productData: any = {
      ...formValue,
      category: category?.name
    };

    if (this.isEditMode()) {
      this.dataService.updateProduct(this.productId()!, productData).subscribe(() => {
        this.snackBar.open('Prodotto aggiornato con successo', 'Chiudi', { duration: 3000 });
        this.router.navigate(['/products']);
      });
    } else {
      this.dataService.createProduct(productData).subscribe(() => {
        this.snackBar.open('Prodotto creato con successo', 'Chiudi', { duration: 3000 });
        this.router.navigate(['/products']);
      });
    }
  }

  cancel() {
    this.router.navigate(['/products']);
  }
}
