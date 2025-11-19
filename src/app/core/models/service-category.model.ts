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
