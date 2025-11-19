import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ServiceProduct, ProductStatus, ServiceCategory, CategoryStatus, DailyPrice, PriceType, PriceOverride } from '../models';
// Updated with calendar generation

@Injectable({ providedIn: 'root' })
export class InMemoryDataService {
  private productsSignal = signal<ServiceProduct[]>([
    {
      id: 1,
      name: 'Massaggio Rilassante',
      categoryId: 1,
      category: 'Wellness & SPA',
      status: ProductStatus.Pubblicato,
      price: 80.00,
      currency: 'EUR',
      duration: 60,
      numberOfPeople: 1,
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
      translations: {
        it: {
          name: 'Massaggio Rilassante',
          shortDescription: 'Un massaggio completo di 60 minuti per rilassare corpo e mente',
          longDescription: 'Massaggio rilassante di 60 minuti che utilizza oli essenziali naturali per ridurre lo stress e la tensione muscolare.'
        },
        en: {
          name: 'Relaxing Massage',
          shortDescription: 'A complete 60-minute massage to relax body and mind',
          longDescription: '60-minute relaxing massage using natural essential oils to reduce stress and muscle tension.'
        },
        de: {
          name: 'Entspannungsmassage',
          shortDescription: 'Eine komplette 60-minütige Massage für Körper und Geist',
          longDescription: '60-minütige Entspannungsmassage mit natürlichen ätherischen Ölen zur Reduzierung von Stress und Muskelverspannungen.'
        }
      }
    },
    {
      id: 2,
      name: 'Cena Romantica',
      categoryId: 2,
      category: 'Ristorante',
      status: ProductStatus.Pubblicato,
      price: 120.00,
      currency: 'EUR',
      duration: 180,
      numberOfPeople: 2,
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      translations: {
        it: {
          name: 'Cena Romantica',
          shortDescription: 'Menu degustazione per due persone',
          longDescription: 'Una serata indimenticabile con menu degustazione di 5 portate, vini abbinati e vista panoramica.'
        },
        en: {
          name: 'Romantic Dinner',
          shortDescription: 'Tasting menu for two people',
          longDescription: 'An unforgettable evening with a 5-course tasting menu, paired wines and panoramic view.'
        }
      }
    },
    {
      id: 3,
      name: 'Trattamento Viso Anti-Age',
      categoryId: 1,
      category: 'Wellness & SPA',
      status: ProductStatus.Bozza,
      price: 95.00,
      currency: 'EUR',
      duration: 90,
      numberOfPeople: 1,
      imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400',
      translations: {
        it: {
          name: 'Trattamento Viso Anti-Age',
          shortDescription: 'Trattamento viso con prodotti biologici certificati',
          longDescription: 'Trattamento viso completo di 90 minuti con prodotti anti-età biologici certificati.'
        },
        en: {
          name: 'Anti-Aging Facial Treatment',
          shortDescription: 'Facial treatment with certified organic products',
          longDescription: 'Complete 90-minute facial treatment with certified organic anti-aging products.'
        }
      }
    }
  ]);

  private categoriesSignal = signal<ServiceCategory[]>([
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
    },
    {
      id: 3,
      name: 'Esperienze',
      status: CategoryStatus.Attivo,
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      translations: {
        it: { name: 'Esperienze' },
        en: { name: 'Experiences' },
        de: { name: 'Erlebnisse' },
        fr: { name: 'Expériences' },
        es: { name: 'Experiencias' }
      }
    }
  ]);

  private productCount = signal<number>(this.productsSignal().length);
  private categoryCount = signal<number>(this.categoriesSignal().length);

  private nextProductId = 4;
  private nextCategoryId = 4;

  products = this.productsSignal.asReadonly();
  categories = this.categoriesSignal.asReadonly();
  publishedProducts = signal<ServiceProduct[]>(this.productsSignal().filter(p => p.status === ProductStatus.Pubblicato)).asReadonly();
  unpublishedProducts = signal<ServiceProduct[]>(this.productsSignal().filter(p => p.status !== ProductStatus.Pubblicato)).asReadonly();

  // Products CRUD
  getProducts(): Observable<ServiceProduct[]> {
    return of([...this.productsSignal()]).pipe(delay(300));
  }

  getProduct(id: number): Observable<ServiceProduct | undefined> {
    const product = this.productsSignal().find(p => p.id === id);
    return of(product).pipe(delay(200));
  }

  getProductCount(): Observable<number> {
    return of(this.productCount()).pipe(delay(100));
  }

  getPublishedProductCount(): Observable<number> {
    return of(this.publishedProducts().length).pipe(delay(100));
  }

  getUnpublishedProductCount(): Observable<number> {
    return of(this.unpublishedProducts().length).pipe(delay(100));
  }

  getCategoryCount(): Observable<number> {
    return of(this.categoryCount()).pipe(delay(100));
  }

  createProduct(product: Omit<ServiceProduct, 'id'>): Observable<ServiceProduct> {
    const newProduct: ServiceProduct = {
      ...product,
      id: this.nextProductId++
    };
    this.productsSignal.update(products => [...products, newProduct]);

    // Crea calendario automatico se ci sono date disponibilità
    this.createProductCalendar(newProduct);

    return of(newProduct).pipe(delay(300));
  }

  updateProduct(id: number, product: Partial<ServiceProduct>): Observable<ServiceProduct | null> {
    const index = this.productsSignal().findIndex(p => p.id === id);
    if (index === -1) return of(null);

    const updatedProduct: ServiceProduct = {
      ...this.productsSignal()[index],
      ...product,
      id
    };

    this.productsSignal.update(products => {
      const newProducts = [...products];
      newProducts[index] = updatedProduct;
      return newProducts;
    });

    // Ricrea calendario se date disponibilità sono cambiate
    this.createProductCalendar(updatedProduct);

    return of(updatedProduct).pipe(delay(300));
  }

  deleteProduct(id: number): Observable<boolean> {
    this.productsSignal.update(products => products.filter(p => p.id !== id));
    return of(true).pipe(delay(200));
  }

  // Categories CRUD
  getCategories(): Observable<ServiceCategory[]> {
    return of([...this.categoriesSignal()]).pipe(delay(300));
  }

  getCategory(id: number): Observable<ServiceCategory | undefined> {
    const category = this.categoriesSignal().find(c => c.id === id);
    return of(category).pipe(delay(200));
  }

  createCategory(category: Omit<ServiceCategory, 'id'>): Observable<ServiceCategory> {
    const newCategory: ServiceCategory = {
      ...category,
      id: this.nextCategoryId++
    };
    this.categoriesSignal.update(categories => [...categories, newCategory]);
    return of(newCategory).pipe(delay(300));
  }

  updateCategory(id: number, category: Partial<ServiceCategory>): Observable<ServiceCategory | null> {
    const index = this.categoriesSignal().findIndex(c => c.id === id);
    if (index === -1) return of(null);

    const updatedCategory: ServiceCategory = {
      ...this.categoriesSignal()[index],
      ...category,
      id
    };

    this.categoriesSignal.update(categories => {
      const newCategories = [...categories];
      newCategories[index] = updatedCategory;
      return newCategories;
    });

    return of(updatedCategory).pipe(delay(300));
  }

  deleteCategory(id: number): Observable<boolean> {
    // Check if any products use this category
    const hasProducts = this.productsSignal().some(p => p.categoryId === id);
    if (hasProducts) {
      return of(false).pipe(delay(200));
    }

    this.categoriesSignal.update(categories => categories.filter(c => c.id !== id));
    return of(true).pipe(delay(200));
  }

  // Daily Pricing
  private dailyPricesSignal = signal<DailyPrice[]>([]);
  private nextDailyPriceId = 1;

  getDailyPricesForProduct(productId: number, year: number, month: number): Observable<DailyPrice[]> {
    const prices = this.dailyPricesSignal().filter(p => {
      const date = new Date(p.date);
      return p.productId === productId &&
             date.getFullYear() === year &&
             date.getMonth() === month;
    });
    return of(prices).pipe(delay(200));
  }

  getDailyPrice(productId: number, date: string): Observable<DailyPrice | undefined> {
    const price = this.dailyPricesSignal().find(p =>
      p.productId === productId && p.date === date
    );
    return of(price).pipe(delay(100));
  }

  setPriceOverride(override: PriceOverride): Observable<DailyPrice> {
    const product = this.productsSignal().find(p => p.id === override.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const basePrice = product.price || 0;
    let finalPrice = basePrice;

    if (override.priceType === PriceType.Fixed && override.value !== undefined) {
      finalPrice = override.value;
    } else if (override.priceType === PriceType.Percentage && override.value !== undefined) {
      finalPrice = basePrice + (basePrice * override.value / 100);
    }

    const existingIndex = this.dailyPricesSignal().findIndex(p =>
      p.productId === override.productId && p.date === override.date
    );

    const existingPrice = existingIndex >= 0 ? this.dailyPricesSignal()[existingIndex] : null;

    const dailyPrice: DailyPrice = {
      id: existingIndex >= 0 ? existingPrice!.id : this.nextDailyPriceId++,
      productId: override.productId,
      date: override.date,
      priceType: override.priceType,
      fixedPrice: override.priceType === PriceType.Fixed ? override.value : undefined,
      percentageAdjustment: override.priceType === PriceType.Percentage ? override.value : undefined,
      finalPrice: finalPrice,
      currency: product.currency || 'EUR',
      stock: override.stock !== undefined ? override.stock : (existingPrice?.stock ?? undefined),
      isActive: override.isActive !== undefined ? override.isActive : (existingPrice?.isActive ?? true)
    };

    if (existingIndex >= 0) {
      this.dailyPricesSignal.update(prices => {
        const newPrices = [...prices];
        newPrices[existingIndex] = dailyPrice;
        return newPrices;
      });
    } else {
      this.dailyPricesSignal.update(prices => [...prices, dailyPrice]);
    }

    return of(dailyPrice).pipe(delay(200));
  }

  removePriceOverride(productId: number, date: string): Observable<boolean> {
    this.dailyPricesSignal.update(prices =>
      prices.filter(p => !(p.productId === productId && p.date === date))
    );
    return of(true).pipe(delay(100));
  }

  calculatePrice(productId: number, date: string): Observable<number> {
    const product = this.productsSignal().find(p => p.id === productId);
    if (!product) {
      return of(0);
    }

    const dailyPrice = this.dailyPricesSignal().find(p =>
      p.productId === productId && p.date === date
    );

    if (dailyPrice) {
      return of(dailyPrice.finalPrice).pipe(delay(100));
    }

    return of(product.price || 0).pipe(delay(100));
  }

  // Crea calendario automatico per il prodotto
  private createProductCalendar(product: ServiceProduct): void {
    if (!product.availabilityStartDate || !product.availabilityEndDate) {
      return;
    }

    const startDate = new Date(product.availabilityStartDate);
    const endDate = new Date(product.availabilityEndDate);

    // Rimuovi i daily prices esistenti per questo prodotto nel range
    this.dailyPricesSignal.update(prices =>
      prices.filter(p => {
        if (p.productId !== product.id) return true;
        const priceDate = new Date(p.date);
        return priceDate < startDate || priceDate > endDate;
      })
    );

    // Crea daily prices per ogni giorno nel range
    const newPrices: DailyPrice[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateString = this.formatDateToISO(currentDate);

      // Controlla se esiste già un override per questo giorno
      const existingOverride = this.dailyPricesSignal().find(p =>
        p.productId === product.id && p.date === dateString
      );

      // Se non c'è un override, crea un record base
      if (!existingOverride) {
        newPrices.push({
          id: this.nextDailyPriceId++,
          productId: product.id,
          date: dateString,
          priceType: PriceType.Base,
          finalPrice: product.price || 0,
          currency: product.currency || 'EUR',
          stock: product.stock
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aggiungi i nuovi prezzi
    if (newPrices.length > 0) {
      this.dailyPricesSignal.update(prices => [...prices, ...newPrices]);
    }
  }

  private formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
