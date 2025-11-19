export interface PricingRule {
  id: number;
  productId: number;
  validFrom: string;      // ISO date YYYY-MM-DD
  validTo: string;        // ISO date YYYY-MM-DD
  basePrice: number;
  currency: string;
  minQuantity?: number;
  maxQuantity?: number;
  daysOfWeek?: number[];  // 0=Sunday, 1=Monday, etc.
}

export interface AvailabilitySlot {
  id: number;
  productId: number;
  date: string;           // ISO date YYYY-MM-DD
  startTime?: string;     // HH:mm format
  endTime?: string;       // HH:mm format
  maxCapacity: number;
  bookedQuantity: number;
  available: boolean;
}
