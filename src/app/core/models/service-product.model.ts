export interface ServiceProduct {
  id: number;
  name: string;
  category?: string;
  categoryId: number;
  status: ProductStatus;
  price: number;
  currency?: string;
  duration?: number;              // Durata in minuti
  numberOfPeople?: number;        // Capacità/numero persone
  stock?: number;                 // Disponibilità base giornaliera
  availabilityStartDate?: string; // Data inizio disponibilità (ISO YYYY-MM-DD)
  availabilityEndDate?: string;   // Data fine disponibilità (ISO YYYY-MM-DD)
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
  stock?: number;
  availabilityStartDate?: string;
  availabilityEndDate?: string;
  imageUrl?: string;
  translations: {
    it: ProductTranslation;
    en: ProductTranslation;
    de: ProductTranslation;
    fr: ProductTranslation;
    es: ProductTranslation;
  };
}
