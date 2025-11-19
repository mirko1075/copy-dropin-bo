# API Documentation - Sistema Gestione Prezzi e Disponibilità

## Indice

1. [Panoramica](#panoramica)
2. [Struttura Dati](#struttura-dati)
3. [Endpoints API](#endpoints-api)
4. [Esempi di Utilizzo](#esempi-di-utilizzo)
5. [Business Logic](#business-logic)

---

## Panoramica

Il sistema gestisce prezzi e disponibilità giornaliera per prodotti/servizi turistici. Ogni prodotto ha un prezzo base e può avere personalizzazioni per specifici giorni, inclusi:

- **Prezzi personalizzati** (fissi o percentuali)
- **Disponibilità/Stock** (numero posti disponibili)
- **Stato attivazione** (se il prodotto è vendibile in quel giorno)

---

## Struttura Dati

### 1. ServiceProduct

Rappresenta un prodotto/servizio turistico.

```typescript
interface ServiceProduct {
  id: number;
  name: string;
  description: string;
  price: number;                    // Prezzo base
  currency: string;                 // Default: 'EUR'
  category: string;
  imageUrl?: string;
  isActive: boolean;
  stock?: number;                   // Stock di default
  availabilityStartDate?: string;   // YYYY-MM-DD - Inizio validità
  availabilityEndDate?: string;     // YYYY-MM-DD - Fine validità
  translations?: ProductTranslation[];
}
```

**Esempio:**
```json
{
  "id": 1,
  "name": "Tour della città",
  "description": "Tour guidato di 2 ore",
  "price": 25.00,
  "currency": "EUR",
  "category": "tours",
  "isActive": true,
  "stock": 20,
  "availabilityStartDate": "2025-01-01",
  "availabilityEndDate": "2025-12-31"
}
```

### 2. DailyPrice

Rappresenta il prezzo e la disponibilità per un giorno specifico.

```typescript
interface DailyPrice {
  id: number;
  productId: number;
  date: string;                      // YYYY-MM-DD
  priceType: PriceType;              // 'base' | 'fixed' | 'percentage'
  fixedPrice?: number;               // Prezzo fisso se priceType = 'fixed'
  percentageAdjustment?: number;     // Percentuale se priceType = 'percentage'
  finalPrice: number;                // Prezzo finale calcolato
  currency: string;
  stock?: number;                    // Disponibilità per questo giorno
  isActive?: boolean;                // Se il prodotto è attivo/vendibile
}
```

**Esempio - Prezzo Base:**
```json
{
  "id": 1,
  "productId": 1,
  "date": "2025-11-15",
  "priceType": "base",
  "finalPrice": 25.00,
  "currency": "EUR",
  "stock": 20,
  "isActive": true
}
```

**Esempio - Prezzo Fisso:**
```json
{
  "id": 2,
  "productId": 1,
  "date": "2025-12-25",
  "priceType": "fixed",
  "fixedPrice": 35.00,
  "finalPrice": 35.00,
  "currency": "EUR",
  "stock": 15,
  "isActive": true
}
```

**Esempio - Sconto Percentuale:**
```json
{
  "id": 3,
  "productId": 1,
  "date": "2025-11-01",
  "priceType": "percentage",
  "percentageAdjustment": -20,
  "finalPrice": 20.00,
  "currency": "EUR",
  "stock": 25,
  "isActive": true
}
```

### 3. PriceType

Enumerazione dei tipi di prezzo.

```typescript
enum PriceType {
  Base = 'base',           // Usa prezzo base del prodotto
  Fixed = 'fixed',         // Prezzo fisso personalizzato
  Percentage = 'percentage' // Sconto/aumento percentuale
}
```

### 4. PriceOverride

Oggetto usato per modificare prezzo/disponibilità di un giorno.

```typescript
interface PriceOverride {
  productId: number;
  date: string;              // YYYY-MM-DD
  priceType: PriceType;
  value?: number;            // Prezzo fisso o percentuale
  stock?: number;            // Nuova disponibilità
  isActive?: boolean;        // Stato attivazione
}
```

**Esempio - Imposta Prezzo Fisso e Stock:**
```json
{
  "productId": 1,
  "date": "2025-12-31",
  "priceType": "fixed",
  "value": 50.00,
  "stock": 10,
  "isActive": true
}
```

**Esempio - Disattiva Prodotto:**
```json
{
  "productId": 1,
  "date": "2025-11-11",
  "priceType": "base",
  "isActive": false
}
```

### 5. CalendarDay

Rappresentazione di un giorno nel calendario UI.

```typescript
interface CalendarDay {
  date: Date;
  dateString: string;        // YYYY-MM-DD
  basePrice: number;         // Prezzo base del prodotto
  finalPrice: number;        // Prezzo finale (con eventuali override)
  priceType: PriceType;
  adjustment?: number;       // Valore dell'override (fisso o %)
  stock?: number;
  isActive?: boolean;        // Stato attivazione giorno
  isToday: boolean;
  isPast: boolean;
  isWeekend: boolean;
}
```

---

## Endpoints API

### Products

#### GET /api/products
Recupera lista di tutti i prodotti.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Tour della città",
      "price": 25.00,
      "currency": "EUR",
      "isActive": true
    }
  ]
}
```

#### GET /api/products/:id
Recupera dettagli di un prodotto.

**Parameters:**
- `id` (number) - ID del prodotto

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Tour della città",
    "description": "Tour guidato di 2 ore",
    "price": 25.00,
    "currency": "EUR",
    "category": "tours",
    "isActive": true,
    "stock": 20,
    "availabilityStartDate": "2025-01-01",
    "availabilityEndDate": "2025-12-31"
  }
}
```

#### POST /api/products
Crea un nuovo prodotto.

**Request Body:**
```json
{
  "name": "Tour della città",
  "description": "Tour guidato di 2 ore",
  "price": 25.00,
  "currency": "EUR",
  "category": "tours",
  "stock": 20,
  "availabilityStartDate": "2025-01-01",
  "availabilityEndDate": "2025-12-31"
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Tour della città",
    "price": 25.00,
    "isActive": true
  }
}
```

#### PUT /api/products/:id
Aggiorna un prodotto esistente.

**Parameters:**
- `id` (number) - ID del prodotto

**Request Body:**
```json
{
  "name": "Tour della città - Aggiornato",
  "price": 30.00
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Tour della città - Aggiornato",
    "price": 30.00
  }
}
```

#### DELETE /api/products/:id
Elimina un prodotto.

**Parameters:**
- `id` (number) - ID del prodotto

**Response:**
```json
{
  "success": true,
  "message": "Prodotto eliminato con successo"
}
```

---

### Daily Pricing

#### GET /api/daily-prices
Recupera tutti i prezzi giornalieri.

**Query Parameters:**
- `productId` (optional) - Filtra per prodotto
- `startDate` (optional) - Data inizio (YYYY-MM-DD)
- `endDate` (optional) - Data fine (YYYY-MM-DD)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "productId": 1,
      "date": "2025-11-15",
      "priceType": "base",
      "finalPrice": 25.00,
      "currency": "EUR",
      "stock": 20,
      "isActive": true
    },
    {
      "id": 2,
      "productId": 1,
      "date": "2025-12-25",
      "priceType": "fixed",
      "fixedPrice": 35.00,
      "finalPrice": 35.00,
      "currency": "EUR",
      "stock": 15,
      "isActive": true
    }
  ]
}
```

#### GET /api/daily-prices/product/:productId
Recupera prezzi giornalieri per un prodotto specifico.

**Parameters:**
- `productId` (number) - ID del prodotto

**Query Parameters:**
- `year` (number) - Anno
- `month` (number) - Mese (0-11)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "productId": 1,
      "date": "2025-11-15",
      "priceType": "base",
      "finalPrice": 25.00,
      "stock": 20,
      "isActive": true
    }
  ]
}
```

#### POST /api/daily-prices/override
Imposta/aggiorna prezzo per un giorno specifico.

**Request Body:**
```json
{
  "productId": 1,
  "date": "2025-12-25",
  "priceType": "fixed",
  "value": 35.00,
  "stock": 15,
  "isActive": true
}
```

**Response:**
```json
{
  "data": {
    "id": 123,
    "productId": 1,
    "date": "2025-12-25",
    "priceType": "fixed",
    "fixedPrice": 35.00,
    "finalPrice": 35.00,
    "currency": "EUR",
    "stock": 15,
    "isActive": true
  }
}
```

#### DELETE /api/daily-prices/override/:productId/:date
Rimuove override per un giorno specifico.

**Parameters:**
- `productId` (number) - ID del prodotto
- `date` (string) - Data (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "message": "Override rimosso con successo"
}
```

---

## Esempi di Utilizzo

### Scenario 1: Impostare Prezzo Speciale per Natale

```javascript
// 1. Recupera il prodotto
const product = await fetch('/api/products/1').then(r => r.json());

// 2. Imposta prezzo speciale per Natale
const override = {
  productId: 1,
  date: '2025-12-25',
  priceType: 'fixed',
  value: 45.00,
  stock: 10,
  isActive: true
};

await fetch('/api/daily-prices/override', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(override)
});
```

### Scenario 2: Applicare Sconto del 20% per Novembre

```javascript
// Ottieni tutti i giorni di novembre
const startDate = new Date(2025, 10, 1); // Novembre 2025
const endDate = new Date(2025, 10, 30);

for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
  const dateString = d.toISOString().split('T')[0];

  const override = {
    productId: 1,
    date: dateString,
    priceType: 'percentage',
    value: -20,  // Sconto del 20%
    isActive: true
  };

  await fetch('/api/daily-prices/override', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(override)
  });
}
```

### Scenario 3: Disattivare Prodotto per Manutenzione

```javascript
// Disattiva prodotto dal 15 al 20 gennaio
const dates = [
  '2025-01-15',
  '2025-01-16',
  '2025-01-17',
  '2025-01-18',
  '2025-01-19',
  '2025-01-20'
];

for (const date of dates) {
  const override = {
    productId: 1,
    date: date,
    priceType: 'base',
    isActive: false
  };

  await fetch('/api/daily-prices/override', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(override)
  });
}
```

### Scenario 4: Aggiornare Solo lo Stock

```javascript
// Riduce disponibilità per giorno specifico
const override = {
  productId: 1,
  date: '2025-12-31',
  priceType: 'base',  // Mantiene prezzo base
  stock: 5,           // Riduce a 5 posti
  isActive: true
};

await fetch('/api/daily-prices/override', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(override)
});
```

---

## Business Logic

### Calcolo Prezzo Finale

Il prezzo finale viene calcolato in base al tipo:

1. **Base**: `finalPrice = product.price`
2. **Fixed**: `finalPrice = override.value`
3. **Percentage**: `finalPrice = product.price + (product.price * override.value / 100)`

**Esempi:**
```
Prezzo Base: €25.00

Percentage +10%: €25.00 + (€25.00 * 10 / 100) = €27.50
Percentage -20%: €25.00 + (€25.00 * -20 / 100) = €20.00
Fixed: €35.00
```

### Gestione Stock

- **Stock Prodotto**: Valore di default
- **Stock Override**: Valore specifico per quel giorno
- Se non specificato, mantiene il valore esistente o usa quello del prodotto

### Stato Attivazione (isActive)

- `isActive = true`: Prodotto vendibile in quel giorno
- `isActive = false`: Prodotto NON vendibile (manutenzione, chiusura, etc.)
- Se non specificato, default è `true`

### Priorità Override

Quando si imposta un override:
1. Se esiste già un override per quel giorno → **AGGIORNA**
2. Se non esiste → **CREA NUOVO**
3. I campi non specificati vengono **PRESERVATI**

**Esempio:**
```javascript
// Giorno ha già: priceType='fixed', value=35, stock=10, isActive=true

// Aggiorno solo lo stock
override = {
  productId: 1,
  date: '2025-12-25',
  priceType: 'fixed',  // Mantiene
  value: 35,           // Mantiene
  stock: 8,            // AGGIORNA
  isActive: true       // Mantiene
}

// Risultato: Solo stock cambia da 10 a 8
```

### Validazioni

1. **Date**: Formato ISO 8601 (YYYY-MM-DD)
2. **Prezzi**: Numeri positivi, max 2 decimali
3. **Stock**: Numeri interi >= 0
4. **Percentuali**: Possono essere negative (sconto) o positive (aumento)
5. **Giorni Passati**: Non possono essere selezionati/modificati dalla UI

---

## Note di Implementazione

### Cache e Performance

- I dati vengono caricati per mese
- Utilizzare `forkJoin` per caricare più mesi in parallelo
- Cache lato client per evitare richieste duplicate

### Multilingua

Il sistema supporta traduzioni per:
- Nome prodotto
- Descrizione
- Categoria

Vedere `ProductTranslation` interface per dettagli.

### Periodo di Validità

- `availabilityStartDate`: Prima data disponibile
- `availabilityEndDate`: Ultima data disponibile
- I giorni fuori da questo range non sono selezionabili

---

## Versionamento API

**Versione corrente**: v1
**Base URL**: `/api/v1/`

Per compatibilità futura, tutti gli endpoint dovrebbero includere la versione.

---

## Codici di Stato HTTP

- `200 OK`: Operazione riuscita
- `201 Created`: Risorsa creata con successo
- `204 No Content`: Operazione riuscita senza contenuto
- `400 Bad Request`: Dati invalidi
- `404 Not Found`: Risorsa non trovata
- `422 Unprocessable Entity`: Validazione fallita
- `500 Internal Server Error`: Errore del server

---

## Contatti e Supporto

Per domande o supporto, contattare il team di sviluppo.

**Ultima modifica**: 30 Ottobre 2025
**Versione documento**: 1.0
