export interface DailyPrice {
  id: number;
  productId: number;
  date: string;              // ISO date YYYY-MM-DD
  priceType: PriceType;
  fixedPrice?: number;       // Prezzo fisso per questo giorno
  percentageAdjustment?: number;  // Percentuale di sconto (-) o aumento (+)
  finalPrice: number;        // Prezzo finale calcolato
  currency: string;
  stock?: number;            // Disponibilità/stock per questo giorno
  isActive?: boolean;        // Se il prodotto è disponibile/attivo in questo giorno
}

export enum PriceType {
  Base = 'base',           // Usa prezzo base del prodotto
  Fixed = 'fixed',         // Prezzo fisso per questo giorno
  Percentage = 'percentage' // Sconto o aumento percentuale
}

export interface PriceOverride {
  productId: number;
  date: string;
  priceType: PriceType;
  value?: number;  // Prezzo fisso o percentuale
  stock?: number;  // Disponibilità/stock per questo giorno
  isActive?: boolean;  // Se il prodotto è disponibile/attivo in questo giorno
}

export interface CalendarDay {
  date: Date;
  dateString: string;
  basePrice: number;
  finalPrice: number;
  priceType: PriceType;
  adjustment?: number;
  stock?: number;            // Disponibilità/stock per questo giorno
  isActive?: boolean;        // Se il prodotto è disponibile/attivo in questo giorno
  isToday: boolean;
  isPast: boolean;
  isWeekend: boolean;
}
