# Esempi Pratici e Testing - Sistema Prezzi e Disponibilità

## Indice

1. [Esempi di Uso Pratico](#esempi-di-uso-pratico)
2. [Casi d'Uso Comuni](#casi-duso-comuni)
3. [Test Cases](#test-cases)
4. [Mock Data](#mock-data)
5. [Troubleshooting](#troubleshooting)

---

## Esempi di Uso Pratico

### Esempio 1: Tour Giornaliero con Prezzi Dinamici

**Scenario**: Tour della città con prezzi variabili per alta/bassa stagione.

#### Setup Prodotto

```json
{
  "name": "Tour Storico di Roma",
  "description": "Tour guidato di 3 ore nel centro storico",
  "price": 35.00,
  "currency": "EUR",
  "category": "tours",
  "stock": 25,
  "availabilityStartDate": "2025-03-01",
  "availabilityEndDate": "2025-11-30"
}
```

#### Configurazione Prezzi

```javascript
// Bassa stagione (Marzo-Aprile): -15%
const lowSeason = generateDateRange('2025-03-01', '2025-04-30');
await applyPriceToRange(productId, lowSeason, {
  priceType: 'percentage',
  value: -15,
  stock: 25
});
// Risultato: €29.75

// Alta stagione (Luglio-Agosto): +30%
const highSeason = generateDateRange('2025-07-01', '2025-08-31');
await applyPriceToRange(productId, highSeason, {
  priceType: 'percentage',
  value: 30,
  stock: 15  // Ridotto per alta domanda
});
// Risultato: €45.50

// Festività speciali
const holidays = ['2025-08-15', '2025-12-25', '2025-12-26'];
await applyPriceToMultipleDays(productId, holidays, {
  priceType: 'fixed',
  value: 50.00,
  stock: 10
});
// Risultato: €50.00
```

### Esempio 2: Servizio Noleggio Barche

**Scenario**: Noleggio barche con disponibilità limitata e prezzi weekend.

#### Setup Prodotto

```json
{
  "name": "Noleggio Barca 4 posti",
  "description": "Noleggio giornaliero con skipper incluso",
  "price": 200.00,
  "currency": "EUR",
  "category": "rentals",
  "stock": 5,
  "availabilityStartDate": "2025-05-01",
  "availabilityEndDate": "2025-09-30"
}
```

#### Configurazione Dinamica

```javascript
// Funzione per applicare prezzi weekend
async function applyWeekendPricing(productId, year, month) {
  const days = getCalendarDays(year, month);

  for (const day of days) {
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;

    if (isWeekend) {
      await setPriceOverride({
        productId,
        date: formatDateISO(day),
        priceType: 'percentage',
        value: 25,  // +25% nei weekend
        stock: 3    // Solo 3 barche disponibili
      });
    }
  }
}

// Applica per tutta la stagione
for (let month = 4; month <= 8; month++) { // Maggio-Settembre
  await applyWeekendPricing(1, 2025, month);
}
```

### Esempio 3: Ristorante con Menu Stagionale

**Scenario**: Ristorante che chiude alcuni giorni e ha menu speciali.

#### Setup Prodotto

```json
{
  "name": "Menu Degustazione",
  "description": "Menu fisso 5 portate",
  "price": 45.00,
  "currency": "EUR",
  "category": "dining",
  "stock": 40,
  "availabilityStartDate": "2025-01-01",
  "availabilityEndDate": "2025-12-31"
}
```

#### Configurazione Chiusure e Eventi Speciali

```javascript
// Chiusura settimanale (Lunedì)
async function closeMondays(productId, year) {
  const mondays = getAllMondaysInYear(year);

  for (const monday of mondays) {
    await setPriceOverride({
      productId,
      date: monday,
      priceType: 'base',
      isActive: false  // Chiuso
    });
  }
}

// Menu speciale San Valentino
await setPriceOverride({
  productId: 1,
  date: '2025-02-14',
  priceType: 'fixed',
  value: 75.00,
  stock: 20,  // Solo 20 coperti
  isActive: true
});

// Menu di Natale
await setPriceOverride({
  productId: 1,
  date: '2025-12-25',
  priceType: 'fixed',
  value: 95.00,
  stock: 30,
  isActive: true
});
```

---

## Casi d'Uso Comuni

### Caso 1: Preparazione Stagione Estiva

```javascript
async function setupSummerSeason(productId) {
  const config = {
    // Giugno: Early booking -10%
    june: {
      startDate: '2025-06-01',
      endDate: '2025-06-30',
      discount: -10
    },
    // Luglio-Agosto: Alta stagione +20%
    peak: {
      startDate: '2025-07-01',
      endDate: '2025-08-31',
      increase: 20
    },
    // Settembre: Spalla -5%
    shoulder: {
      startDate: '2025-09-01',
      endDate: '2025-09-30',
      discount: -5
    }
  };

  // Applica Giugno
  const juneDates = generateDateRange(
    config.june.startDate,
    config.june.endDate
  );
  await applyBulkPriceOverride(productId, juneDates, {
    priceType: 'percentage',
    value: config.june.discount
  });

  // Applica Alta Stagione
  const peakDates = generateDateRange(
    config.peak.startDate,
    config.peak.endDate
  );
  await applyBulkPriceOverride(productId, peakDates, {
    priceType: 'percentage',
    value: config.peak.increase,
    stock: 15  // Riduce disponibilità
  });

  // Applica Settembre
  const shoulderDates = generateDateRange(
    config.shoulder.startDate,
    config.shoulder.endDate
  );
  await applyBulkPriceOverride(productId, shoulderDates, {
    priceType: 'percentage',
    value: config.shoulder.discount
  });

  console.log('Stagione estiva configurata con successo!');
}
```

### Caso 2: Last Minute Deals

```javascript
async function createLastMinuteDeals(productId, daysAhead = 3) {
  const today = new Date();
  const dealDates = [];

  // Identifica giorni con stock alto nei prossimi 3 giorni
  for (let i = 1; i <= daysAhead; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dailyPrice = await getDailyPrice(
      productId,
      formatDateISO(date)
    );

    // Se stock > 15, applica sconto last minute
    if (dailyPrice.stock && dailyPrice.stock > 15) {
      await setPriceOverride({
        productId,
        date: formatDateISO(date),
        priceType: 'percentage',
        value: -25,  // 25% sconto
        stock: dailyPrice.stock
      });

      dealDates.push(formatDateISO(date));
    }
  }

  return {
    message: `Last minute deals applicati a ${dealDates.length} giorni`,
    dates: dealDates
  };
}
```

### Caso 3: Gestione Overbooking

```javascript
async function handleOverbooking(productId, date, bookedCount) {
  const dailyPrice = await getDailyPrice(productId, date);

  if (!dailyPrice.stock) {
    throw new Error('Stock non configurato per questo prodotto');
  }

  const availableStock = dailyPrice.stock - bookedCount;

  if (availableStock <= 0) {
    // Stock esaurito - disattiva giorno
    await setPriceOverride({
      productId,
      date,
      priceType: dailyPrice.priceType,
      value: dailyPrice.adjustment,
      stock: 0,
      isActive: false
    });

    return {
      status: 'sold_out',
      message: 'Giorno disattivato - stock esaurito'
    };
  } else if (availableStock <= 3) {
    // Posti quasi esauriti - aumenta prezzo
    await setPriceOverride({
      productId,
      date,
      priceType: 'percentage',
      value: 15,  // +15% per scarsità
      stock: availableStock
    });

    return {
      status: 'low_stock',
      message: `Stock basso (${availableStock}), prezzo aumentato`
    };
  } else {
    // Aggiorna solo lo stock
    await setPriceOverride({
      productId,
      date,
      priceType: dailyPrice.priceType,
      value: dailyPrice.adjustment,
      stock: availableStock
    });

    return {
      status: 'ok',
      available: availableStock
    };
  }
}
```

### Caso 4: Promozione Flash

```javascript
async function createFlashSale(productId, duration = 24) {
  const now = new Date();
  const endTime = new Date(now.getTime() + (duration * 60 * 60 * 1000));

  // Applica sconto ai prossimi 7 giorni
  const saleDates = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    saleDates.push(formatDateISO(date));
  }

  await applyBulkPriceOverride(productId, saleDates, {
    priceType: 'percentage',
    value: -40  // 40% sconto!
  });

  // Programma ripristino automatico dopo 24h
  setTimeout(async () => {
    // Rimuovi tutti gli override
    for (const date of saleDates) {
      await removePriceOverride(productId, date);
    }
    console.log('Flash sale terminato, prezzi ripristinati');
  }, duration * 60 * 60 * 1000);

  return {
    message: 'Flash sale attivato!',
    discount: '40%',
    dates: saleDates,
    endsAt: endTime.toISOString()
  };
}
```

---

## Test Cases

### Test Suite: Calcolo Prezzi

```typescript
describe('Price Calculation', () => {
  const basePrice = 100;

  test('Base price - no override', () => {
    const result = calculateFinalPrice(basePrice, {
      priceType: PriceType.Base
    });
    expect(result).toBe(100);
  });

  test('Fixed price override', () => {
    const result = calculateFinalPrice(basePrice, {
      priceType: PriceType.Fixed,
      value: 120
    });
    expect(result).toBe(120);
  });

  test('Percentage increase +25%', () => {
    const result = calculateFinalPrice(basePrice, {
      priceType: PriceType.Percentage,
      value: 25
    });
    expect(result).toBe(125);
  });

  test('Percentage discount -20%', () => {
    const result = calculateFinalPrice(basePrice, {
      priceType: PriceType.Percentage,
      value: -20
    });
    expect(result).toBe(80);
  });

  test('Edge case: 100% discount', () => {
    const result = calculateFinalPrice(basePrice, {
      priceType: PriceType.Percentage,
      value: -100
    });
    expect(result).toBe(0);
  });
});
```

### Test Suite: Stock Management

```typescript
describe('Stock Management', () => {
  test('Stock reduces after booking', async () => {
    const initial = 20;
    await setPriceOverride({
      productId: 1,
      date: '2025-12-25',
      stock: initial
    });

    await handleOverbooking(1, '2025-12-25', 5);

    const result = await getDailyPrice(1, '2025-12-25');
    expect(result.stock).toBe(15);
  });

  test('Day becomes inactive when stock = 0', async () => {
    await setPriceOverride({
      productId: 1,
      date: '2025-12-25',
      stock: 5
    });

    await handleOverbooking(1, '2025-12-25', 5);

    const result = await getDailyPrice(1, '2025-12-25');
    expect(result.stock).toBe(0);
    expect(result.isActive).toBe(false);
  });

  test('Cannot book on inactive day', async () => {
    await setPriceOverride({
      productId: 1,
      date: '2025-12-25',
      isActive: false
    });

    await expect(
      createBooking(1, '2025-12-25')
    ).rejects.toThrow('Day is not active');
  });
});
```

### Test Suite: Date Range Selection

```typescript
describe('Multi-day Selection', () => {
  test('Select range calculates correctly', () => {
    const start = new Date('2025-12-15');
    const end = new Date('2025-12-20');

    const range = selectRange(start, end);

    expect(range.length).toBe(6); // 15,16,17,18,19,20
    expect(range[0].dateString).toBe('2025-12-15');
    expect(range[5].dateString).toBe('2025-12-20');
  });

  test('Excludes past days from selection', () => {
    const today = new Date();
    const past = new Date(today);
    past.setDate(today.getDate() - 5);

    const future = new Date(today);
    future.setDate(today.getDate() + 5);

    const range = selectRange(past, future);

    // Verifica che nessun giorno passato sia incluso
    const hasPastDays = range.some(day => day.isPast);
    expect(hasPastDays).toBe(false);
  });

  test('Includes other-month days', () => {
    // Dicembre 2025 - alcuni giorni sono di Novembre/Gennaio
    const days = generateCalendarDays(2025, 11);

    expect(days.length).toBe(42); // 6 settimane

    // Primo giorno potrebbe essere di Novembre
    const firstDay = days[0];
    expect(firstDay.date.getMonth()).toBeLessThanOrEqual(11);

    // Ultimo giorno potrebbe essere di Gennaio
    const lastDay = days[41];
    expect(lastDay.date.getMonth()).toBeGreaterThanOrEqual(11);
  });
});
```

### Test Suite: Override Preservation

```typescript
describe('Override Data Preservation', () => {
  test('Preserves price when updating stock', async () => {
    // Setup iniziale
    await setPriceOverride({
      productId: 1,
      date: '2025-12-25',
      priceType: PriceType.Fixed,
      value: 50,
      stock: 20,
      isActive: true
    });

    // Aggiorna solo stock
    await setStockOnly(1, '2025-12-25', 15);

    const result = await getDailyPrice(1, '2025-12-25');
    expect(result.priceType).toBe(PriceType.Fixed);
    expect(result.fixedPrice).toBe(50);
    expect(result.stock).toBe(15);
    expect(result.isActive).toBe(true);
  });

  test('Preserves stock when updating price', async () => {
    await setPriceOverride({
      productId: 1,
      date: '2025-12-25',
      priceType: PriceType.Base,
      stock: 15
    });

    await setPriceOverride({
      productId: 1,
      date: '2025-12-25',
      priceType: PriceType.Percentage,
      value: 20
    });

    const result = await getDailyPrice(1, '2025-12-25');
    expect(result.stock).toBe(15); // Preserved!
    expect(result.priceType).toBe(PriceType.Percentage);
  });
});
```

---

## Mock Data

### Dataset Completo per Testing

```typescript
// Products
export const MOCK_PRODUCTS: ServiceProduct[] = [
  {
    id: 1,
    name: 'Tour Colosseo',
    description: 'Visita guidata del Colosseo',
    price: 25.00,
    currency: 'EUR',
    category: 'tours',
    isActive: true,
    stock: 30,
    availabilityStartDate: '2025-01-01',
    availabilityEndDate: '2025-12-31'
  },
  {
    id: 2,
    name: 'Cooking Class',
    description: 'Corso di cucina italiana',
    price: 75.00,
    currency: 'EUR',
    category: 'experiences',
    isActive: true,
    stock: 12,
    availabilityStartDate: '2025-03-01',
    availabilityEndDate: '2025-10-31'
  },
  {
    id: 3,
    name: 'Noleggio Vespa',
    description: 'Noleggio giornaliero Vespa',
    price: 50.00,
    currency: 'EUR',
    category: 'rentals',
    isActive: true,
    stock: 8,
    availabilityStartDate: '2025-04-01',
    availabilityEndDate: '2025-09-30'
  }
];

// Daily Prices con casi diversi
export const MOCK_DAILY_PRICES: DailyPrice[] = [
  // Giorno base
  {
    id: 1,
    productId: 1,
    date: '2025-11-15',
    priceType: PriceType.Base,
    finalPrice: 25.00,
    currency: 'EUR',
    stock: 30,
    isActive: true
  },
  // Giorno con sconto
  {
    id: 2,
    productId: 1,
    date: '2025-11-20',
    priceType: PriceType.Percentage,
    percentageAdjustment: -15,
    finalPrice: 21.25,
    currency: 'EUR',
    stock: 30,
    isActive: true
  },
  // Giorno con prezzo fisso
  {
    id: 3,
    productId: 1,
    date: '2025-12-25',
    priceType: PriceType.Fixed,
    fixedPrice: 45.00,
    finalPrice: 45.00,
    currency: 'EUR',
    stock: 15,
    isActive: true
  },
  // Giorno non attivo
  {
    id: 4,
    productId: 1,
    date: '2025-11-11',
    priceType: PriceType.Base,
    finalPrice: 25.00,
    currency: 'EUR',
    stock: 0,
    isActive: false
  },
  // Stock ridotto
  {
    id: 5,
    productId: 1,
    date: '2025-12-31',
    priceType: PriceType.Fixed,
    fixedPrice: 50.00,
    finalPrice: 50.00,
    currency: 'EUR',
    stock: 5,
    isActive: true
  }
];
```

### Helper Functions per Testing

```typescript
// Genera date range
export function generateMockDateRange(
  startDate: string,
  endDate: string
): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// Crea bulk overrides
export function createBulkMockOverrides(
  productId: number,
  dates: string[],
  config: Partial<PriceOverride>
): DailyPrice[] {
  return dates.map((date, index) => ({
    id: 1000 + index,
    productId,
    date,
    priceType: config.priceType || PriceType.Base,
    fixedPrice: config.priceType === PriceType.Fixed ? config.value : undefined,
    percentageAdjustment: config.priceType === PriceType.Percentage ? config.value : undefined,
    finalPrice: calculateMockPrice(productId, config),
    currency: 'EUR',
    stock: config.stock || 20,
    isActive: config.isActive ?? true
  }));
}

// Simula response API
export function mockApiResponse<T>(data: T, delay = 200): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}
```

---

## Troubleshooting

### Problema 1: Prezzi Non Si Aggiornano

**Sintomi:**
- Modifiche al prezzo non si riflettono nel calendario
- Cache mostra dati vecchi

**Soluzione:**
```typescript
// 1. Verifica che l'override sia stato salvato
const saved = await getDailyPrice(productId, date);
console.log('Saved override:', saved);

// 2. Forza reload del calendario
this.generateCalendar();

// 3. Verifica cache
localStorage.clear(); // Se usi localStorage
```

### Problema 2: Stock Non Coerente

**Sintomi:**
- Stock mostrato non corrisponde a quello salvato
- Bookings superano lo stock disponibile

**Soluzione:**
```typescript
// Controlla conflitti di concorrenza
async function safeBooking(productId, date, quantity) {
  // 1. Lock della risorsa (implementa con DB transaction)
  const current = await getDailyPrice(productId, date);

  // 2. Verifica disponibilità
  if (!current.stock || current.stock < quantity) {
    throw new Error('Stock insufficiente');
  }

  // 3. Aggiorna atomicamente
  const newStock = current.stock - quantity;
  await setPriceOverride({
    productId,
    date,
    stock: newStock,
    // Preserva altri campi
    priceType: current.priceType,
    value: current.adjustment
  });

  return newStock;
}
```

### Problema 3: Selezione Range Non Funziona

**Sintomi:**
- Shift+click non seleziona range
- Drag non seleziona giorni

**Debug:**
```typescript
// Aggiungi logging
selectRange(start: CalendarDay, end: CalendarDay) {
  console.log('Start:', start.dateString);
  console.log('End:', end.dateString);

  const allDays = this.calendarDays();
  console.log('Total days:', allDays.length);

  const rangeDays = allDays.filter(day => {
    const inRange = day.date >= start.date && day.date <= end.date;
    const notPast = !day.isPast;

    if (inRange && !notPast) {
      console.warn('Day in range but is past:', day.dateString);
    }

    return inRange && notPast;
  });

  console.log('Selected:', rangeDays.length);
  this.selectedDays.set(rangeDays);
}
```

### Problema 4: Giorno Inattivo Ma Prenotabile

**Sintomi:**
- Giorno con isActive=false accetta bookings
- UI mostra giorno come disponibile

**Soluzione:**
```typescript
// Validazione server-side
async function validateBooking(productId, date) {
  const dailyPrice = await getDailyPrice(productId, date);

  if (!dailyPrice.isActive) {
    throw new Error('Product not available on this date');
  }

  if (dailyPrice.stock === 0) {
    throw new Error('No stock available');
  }

  // Verifica anche periodo validità prodotto
  const product = await getProduct(productId);
  const bookingDate = new Date(date);

  if (product.availabilityStartDate) {
    const start = new Date(product.availabilityStartDate);
    if (bookingDate < start) {
      throw new Error('Date before availability period');
    }
  }

  if (product.availabilityEndDate) {
    const end = new Date(product.availabilityEndDate);
    if (bookingDate > end) {
      throw new Error('Date after availability period');
    }
  }

  return true;
}
```

---

## Performance Tips

### 1. Ottimizza Caricamento Calendario

```typescript
// ❌ BAD - Carica ogni giorno singolarmente
for (const day of calendarDays) {
  await getDailyPrice(productId, day.dateString);
}

// ✅ GOOD - Carica batch per mese
const uniqueMonths = [...new Set(calendarDays.map(d => `${d.year}-${d.month}`))];
const allPrices = await Promise.all(
  uniqueMonths.map(month => getDailyPricesForMonth(productId, month))
);
```

### 2. Debounce Input Utente

```typescript
// Evita troppe chiamate durante selezione drag
private selectionDebounce: any;

onDayMouseEnter(day: CalendarDay) {
  if (this.selectionDebounce) {
    clearTimeout(this.selectionDebounce);
  }

  this.selectionDebounce = setTimeout(() => {
    this.selectRange(this.firstDay, day);
  }, 50); // 50ms debounce
}
```

### 3. Cache Intelligente

```typescript
class PriceCache {
  private cache = new Map<string, { data: any, expiry: number }>();
  private TTL = 60000; // 1 minuto

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.TTL
    });
  }
}
```

---

**Ultima modifica**: 30 Ottobre 2025
**Versione documento**: 1.0
