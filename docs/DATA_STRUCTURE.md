# Struttura Dati - Sistema Gestione Prezzi e Disponibilità

## Diagramma ER (Entity-Relationship)

```
┌─────────────────────────────────────┐
│         ServiceProduct              │
├─────────────────────────────────────┤
│ PK  id: number                      │
│     name: string                    │
│     description: string             │
│     price: number                   │
│     currency: string                │
│     category: string                │
│     imageUrl: string?               │
│     isActive: boolean               │
│     stock: number?                  │
│     availabilityStartDate: string?  │
│     availabilityEndDate: string?    │
└─────────────────────────────────────┘
           │
           │ 1:N
           │
           ▼
┌─────────────────────────────────────┐
│         DailyPrice                  │
├─────────────────────────────────────┤
│ PK  id: number                      │
│ FK  productId: number               │
│     date: string (YYYY-MM-DD)       │
│     priceType: PriceType            │
│     fixedPrice: number?             │
│     percentageAdjustment: number?   │
│     finalPrice: number              │
│     currency: string                │
│     stock: number?                  │
│     isActive: boolean?              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         Category                    │
├─────────────────────────────────────┤
│ PK  id: number                      │
│     name: string                    │
│     description: string             │
│     imageUrl: string?               │
│     isActive: boolean               │
└─────────────────────────────────────┘
           │
           │ 1:N
           │
           ▼
    (ServiceProduct.category)
```

## Relazioni

### ServiceProduct → DailyPrice (1:N)
- Un prodotto può avere molti prezzi giornalieri
- Ogni DailyPrice è legato a un solo prodotto
- Chiave esterna: `DailyPrice.productId → ServiceProduct.id`
- Vincolo: Coppia (productId, date) deve essere unica

### Category → ServiceProduct (1:N)
- Una categoria può contenere molti prodotti
- Ogni prodotto appartiene a una sola categoria
- Relazione: `ServiceProduct.category → Category.name`

## Indici Consigliati

```sql
-- Tabella: daily_prices
CREATE INDEX idx_product_date ON daily_prices(product_id, date);
CREATE INDEX idx_date_range ON daily_prices(date);
CREATE INDEX idx_product_active ON daily_prices(product_id, is_active);

-- Tabella: products
CREATE INDEX idx_category ON products(category);
CREATE INDEX idx_active ON products(is_active);
CREATE INDEX idx_availability ON products(availability_start_date, availability_end_date);
```

## Schema Dettagliato dei Modelli

### 1. ServiceProduct

| Campo | Tipo | Obbligatorio | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| id | number | ✓ | auto | Identificatore unico |
| name | string | ✓ | - | Nome del prodotto |
| description | string | ✓ | - | Descrizione dettagliata |
| price | number | ✓ | - | Prezzo base in valuta |
| currency | string | ✓ | 'EUR' | Codice ISO 4217 |
| category | string | ✓ | - | Categoria di appartenenza |
| imageUrl | string | ✗ | null | URL immagine prodotto |
| isActive | boolean | ✓ | true | Se il prodotto è attivo |
| stock | number | ✗ | null | Stock di default |
| availabilityStartDate | string | ✗ | null | Data inizio validità (YYYY-MM-DD) |
| availabilityEndDate | string | ✗ | null | Data fine validità (YYYY-MM-DD) |

**Vincoli:**
- `price >= 0`
- `stock >= 0` se specificato
- `availabilityEndDate >= availabilityStartDate` se entrambi specificati

### 2. DailyPrice

| Campo | Tipo | Obbligatorio | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| id | number | ✓ | auto | Identificatore unico |
| productId | number | ✓ | - | FK verso ServiceProduct |
| date | string | ✓ | - | Data (YYYY-MM-DD) |
| priceType | PriceType | ✓ | 'base' | Tipo di prezzo |
| fixedPrice | number | ✗ | null | Prezzo fisso (se type=fixed) |
| percentageAdjustment | number | ✗ | null | Percentuale (se type=percentage) |
| finalPrice | number | ✓ | - | Prezzo finale calcolato |
| currency | string | ✓ | 'EUR' | Codice ISO 4217 |
| stock | number | ✗ | null | Stock specifico per questo giorno |
| isActive | boolean | ✓ | true | Se vendibile in questo giorno |

**Vincoli:**
- `finalPrice >= 0`
- `stock >= 0` se specificato
- UNIQUE(productId, date)

**Regole di Validazione:**
```
SE priceType = 'fixed':
  - fixedPrice DEVE essere specificato
  - percentageAdjustment DEVE essere null

SE priceType = 'percentage':
  - percentageAdjustment DEVE essere specificato
  - fixedPrice DEVE essere null

SE priceType = 'base':
  - fixedPrice DEVE essere null
  - percentageAdjustment DEVE essere null
```

### 3. PriceType (Enum)

| Valore | Descrizione | Calcolo |
|--------|-------------|---------|
| base | Prezzo base del prodotto | `finalPrice = product.price` |
| fixed | Prezzo fisso personalizzato | `finalPrice = override.value` |
| percentage | Sconto/aumento percentuale | `finalPrice = product.price * (1 + value/100)` |

### 4. Category

| Campo | Tipo | Obbligatorio | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| id | number | ✓ | auto | Identificatore unico |
| name | string | ✓ | - | Nome categoria (univoco) |
| description | string | ✓ | - | Descrizione categoria |
| imageUrl | string | ✗ | null | URL immagine categoria |
| isActive | boolean | ✓ | true | Se la categoria è attiva |

**Vincoli:**
- UNIQUE(name)

## Flussi Operativi

### Flusso 1: Creazione Prodotto

```
┌─────────────┐
│  UI: Form   │
│  Prodotto   │
└──────┬──────┘
       │
       │ POST /api/products
       │ { name, price, ... }
       ▼
┌─────────────────┐
│   Backend API   │
│  - Valida dati  │
│  - Crea Product │
└──────┬──────────┘
       │
       │ Auto-genera calendario
       │ (createProductCalendar)
       ▼
┌──────────────────────┐
│ Genera DailyPrice    │
│ per periodo validità │
│ (365 giorni)         │
└──────┬───────────────┘
       │
       │ Tutti con:
       │ - priceType = 'base'
       │ - finalPrice = product.price
       │ - stock = product.stock
       │ - isActive = true
       ▼
┌─────────────────┐
│  Salva in DB    │
└─────────────────┘
```

### Flusso 2: Modifica Prezzo Giornaliero

```
┌────────────────┐
│ UI: Calendario │
│ Seleziona      │
│ giorni         │
└───────┬────────┘
        │
        │ Click su "Imposta Prezzo Fisso"
        │ Input: €35.00
        ▼
┌────────────────────────┐
│ Component              │
│ setPriceOverride()     │
│ Per ogni giorno:       │
│ - Crea PriceOverride   │
└───────┬────────────────┘
        │
        │ POST /api/daily-prices/override
        │ {
        │   productId: 1,
        │   date: "2025-12-25",
        │   priceType: "fixed",
        │   value: 35.00,
        │   stock: 10,
        │   isActive: true
        │ }
        ▼
┌────────────────────────┐
│ Backend: Service       │
│ setPriceOverride()     │
│                        │
│ 1. Trova prodotto      │
│ 2. Calcola finalPrice  │
│ 3. Cerca DailyPrice    │
│    esistente           │
└───────┬────────────────┘
        │
        ├─► Esiste?
        │   ├─ SI → UPDATE
        │   └─ NO → INSERT
        ▼
┌────────────────────────┐
│ Salva DailyPrice       │
│ id: 123                │
│ productId: 1           │
│ date: "2025-12-25"     │
│ priceType: "fixed"     │
│ fixedPrice: 35.00      │
│ finalPrice: 35.00      │
│ stock: 10              │
│ isActive: true         │
└───────┬────────────────┘
        │
        │ Response: DailyPrice
        ▼
┌────────────────────────┐
│ UI: Aggiorna           │
│ Calendario             │
│ - Ricarica mese        │
│ - Mostra nuovo prezzo  │
└────────────────────────┘
```

### Flusso 3: Caricamento Calendario

```
┌────────────────┐
│ UI: Calendario │
│ Component      │
│ ngOnInit()     │
└───────┬────────┘
        │
        │ loadProduct(id)
        ▼
┌────────────────────────┐
│ GET /api/products/:id  │
└───────┬────────────────┘
        │
        │ Prodotto ricevuto
        ▼
┌────────────────────────┐
│ generateCalendar()     │
│ - Genera 42 giorni     │
│   (6 settimane)        │
│ - Calcola first/last   │
│   giorno visibile      │
└───────┬────────────────┘
        │
        │ loadPricesForVisibleDays()
        ▼
┌────────────────────────┐
│ Identifica mesi        │
│ visibili nel calendario│
│ Es: Nov, Dic, Gen      │
└───────┬────────────────┘
        │
        │ forkJoin([...])
        │ GET /api/daily-prices/product/1?year=2025&month=10
        │ GET /api/daily-prices/product/1?year=2025&month=11
        │ GET /api/daily-prices/product/1?year=2025&month=0
        ▼
┌────────────────────────┐
│ Combina risultati      │
│ - Merge array          │
│ - Crea priceMap        │
└───────┬────────────────┘
        │
        │ calendarDays.update()
        ▼
┌────────────────────────┐
│ Per ogni giorno:       │
│ - Se ha DailyPrice:    │
│   usa dati da DB       │
│ - Altrimenti:          │
│   usa prezzo base      │
└───────┬────────────────┘
        │
        ▼
┌────────────────────────┐
│ UI: Render Calendario  │
│ - 42 celle             │
│ - Prezzi aggiornati    │
│ - Stock visibile       │
│ - Giorni inattivi      │
│   evidenziati          │
└────────────────────────┘
```

### Flusso 4: Selezione Multipla e Bulk Update

```
┌────────────────┐
│ UI: Utente     │
│ doppio-click   │
│ su giorno 15   │
└───────┬────────┘
        │
        │ onDayDoubleClick(day15)
        ▼
┌────────────────────────┐
│ isSelecting = true     │
│ selectedDays = [day15] │
│ lastClickedDay = day15 │
└────────────────────────┘
        │
        │ Utente muove mouse
        │ sopra giorno 20
        ▼
┌────────────────────────┐
│ onDayMouseEnter(day20) │
│                        │
│ selectRange(day15,     │
│             day20)     │
└───────┬────────────────┘
        │
        │ Calcola range
        ▼
┌────────────────────────┐
│ selectedDays =         │
│ [day15, day16, day17,  │
│  day18, day19, day20]  │
│                        │
│ UI: Evidenzia giorni   │
└────────────────────────┘
        │
        │ Utente rilascia mouse
        ▼
┌────────────────────────┐
│ onMouseUp()            │
│ isSelecting = false    │
└───────┬────────────────┘
        │
        │ Utente modifica stock
        │ Input: 15 posti
        │ Click: "Aggiorna Disponibilità"
        ▼
┌────────────────────────┐
│ setStockOnly(15)       │
│                        │
│ Per OGNI giorno:       │
│ - Crea override        │
│ - stock = 15           │
│ - Mantiene priceType   │
│ - Mantiene isActive    │
└───────┬────────────────┘
        │
        │ 6 chiamate POST in parallelo
        │ (una per ogni giorno)
        ▼
┌────────────────────────┐
│ Backend: 6 volte       │
│ setPriceOverride()     │
│                        │
│ Aggiorna/Crea          │
│ DailyPrice per ogni    │
│ giorno                 │
└───────┬────────────────┘
        │
        │ Tutte completate
        ▼
┌────────────────────────┐
│ Snackbar:              │
│ "Disponibilità         │
│  aggiornata per        │
│  6 giorni"             │
│                        │
│ generateCalendar()     │
│ selectedDays = []      │
└────────────────────────┘
```

## Stati del Sistema

### Stati del Giorno (CalendarDay)

```
┌──────────────────────────┐
│    Giorno del Mese       │
└──────────┬───────────────┘
           │
           ├─► isPast = true
           │   └─► NON selezionabile
           │       Background grigio
           │       Opacità 0.6
           │
           ├─► isToday = true
           │   └─► Bordo verde
           │       Background verde chiaro
           │
           ├─► isWeekend = true
           │   └─► Background giallo chiaro
           │
           ├─► other-month = true
           │   └─► Opacità 0.4
           │       MA selezionabile
           │
           ├─► priceType ≠ 'base'
           │   └─► has-override
           │       Bordo arancione
           │       Icona stella
           │
           ├─► isActive = false
           │   └─► Background rosso chiaro
           │       Bordo rosso
           │       Grande X sovrapposta
           │       Opacità testi 0.6
           │
           └─► selected = true
               └─► Bordo blu spesso
                   Background blu chiaro
```

### Transizioni di Stato

```
Stato Iniziale
    ↓
[Giorno Base]
priceType = 'base'
finalPrice = product.price
stock = product.stock
isActive = true
    ↓
    │ setPriceOverride(fixed, 35)
    ↓
[Giorno con Override Fisso]
priceType = 'fixed'
fixedPrice = 35
finalPrice = 35
has-override = true
    ↓
    │ setActiveStatus(false)
    ↓
[Giorno Inattivo]
isActive = false
Visualmente disabilitato
    ↓
    │ removeOverride()
    ↓
[Torna a Giorno Base]
priceType = 'base'
finalPrice = product.price
has-override = false
```

## Calcoli e Formule

### 1. Calcolo Prezzo Finale

```typescript
function calculateFinalPrice(
  product: ServiceProduct,
  override: PriceOverride
): number {
  const basePrice = product.price;

  switch (override.priceType) {
    case PriceType.Base:
      return basePrice;

    case PriceType.Fixed:
      return override.value ?? basePrice;

    case PriceType.Percentage:
      const percentage = override.value ?? 0;
      return basePrice + (basePrice * percentage / 100);

    default:
      return basePrice;
  }
}
```

**Esempi:**
```
basePrice = 100

PriceType.Base:
  → 100

PriceType.Fixed, value = 120:
  → 120

PriceType.Percentage, value = 10:
  → 100 + (100 * 10 / 100) = 110

PriceType.Percentage, value = -20:
  → 100 + (100 * -20 / 100) = 80
```

### 2. Generazione Range Date

```typescript
function generateDateRange(
  startDate: Date,
  endDate: Date
): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(formatDateISO(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
```

### 3. Calcolo Settimane Calendario

```typescript
function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay(); // 0 = Domenica

  // Calcola giorni da mostrare dal mese precedente
  const daysFromPrevMonth = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - daysFromPrevMonth);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) { // 6 settimane × 7 giorni
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }

  return days;
}
```

## Vincoli e Regole di Business

### 1. Vincoli Temporali

- **Giorno Passato**: `day.date < today` → NON modificabile
- **Periodo Validità**: `product.availabilityStartDate <= day.date <= product.availabilityEndDate`
- **Range Selezione**: Massimo 60 giorni consecutivi per operazione bulk

### 2. Vincoli Numerici

- **Prezzo**: `0 <= price <= 999999.99` (max 2 decimali)
- **Stock**: `0 <= stock <= 9999` (intero)
- **Percentuale**: `-100 <= percentage <= 1000`

### 3. Regole Override

- **Preservazione Dati**: Campi non specificati vengono mantenuti
- **Unicità**: Solo un override per coppia (productId, date)
- **Cascata**: Eliminazione prodotto elimina tutti i DailyPrice associati

### 4. Validazioni UI

```typescript
// Esempio validazioni form
const validations = {
  stock: {
    required: false,
    min: 0,
    max: 9999,
    integer: true
  },
  fixedPrice: {
    required: true, // se priceType = 'fixed'
    min: 0,
    max: 999999.99,
    decimals: 2
  },
  percentage: {
    required: true, // se priceType = 'percentage'
    min: -100,
    max: 1000,
    integer: true
  }
};
```

## Performance e Ottimizzazioni

### 1. Query Ottimizzate

```sql
-- Carica prezzi per range di date
SELECT * FROM daily_prices
WHERE product_id = :productId
  AND date BETWEEN :startDate AND :endDate
ORDER BY date ASC;

-- Usa indici composti
CREATE INDEX idx_product_date_range
ON daily_prices(product_id, date, is_active);
```

### 2. Caching Strategy

```typescript
interface CacheStrategy {
  // Cache prodotti (raramente cambiano)
  products: {
    ttl: 300000,  // 5 minuti
    key: 'product:{id}'
  },

  // Cache prezzi mensili
  dailyPrices: {
    ttl: 60000,   // 1 minuto
    key: 'prices:{productId}:{year}-{month}'
  }
}
```

### 3. Batch Operations

```typescript
// Invece di N chiamate separate
for (const day of selectedDays) {
  await setPriceOverride(day);
}

// Usa una chiamata batch
await batchSetPriceOverrides(selectedDays);
```

---

**Ultima modifica**: 30 Ottobre 2025
**Versione documento**: 1.0
