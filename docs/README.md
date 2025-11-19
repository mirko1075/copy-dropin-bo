# Documentazione Sistema Gestione Prezzi e Disponibilità

> Sistema completo per la gestione dinamica di prezzi, disponibilità e attivazione di prodotti/servizi turistici con calendario interattivo.

## 📚 Documentazione Disponibile

### 1. [OpenAPI Specification](./openapi.yaml) 🆕
**Specifica OpenAPI 3.0 completa delle API REST.**

**Features:**
- ✅ Formato standard OpenAPI 3.0.3
- ✅ Tutti gli endpoints documentati
- ✅ Schemi completi request/response
- ✅ Esempi multipli per ogni operazione
- ✅ Importabile in Swagger/Postman/Insomnia
- ✅ Generazione automatica client SDK

**Come usarla:**
- Importa in [Swagger Editor](https://editor.swagger.io) per UI interattiva
- Usa con Postman per testing automatico
- Genera client SDK per TypeScript/Java/Python/etc.
- Vedi [Guida OpenAPI](./OPENAPI_GUIDE.md) per dettagli

```bash
# Visualizza con Swagger UI
docker run -p 8080:8080 -e SWAGGER_JSON=/api/openapi.yaml \
  -v $(pwd)/docs:/api swaggerapi/swagger-ui

# Genera TypeScript SDK
openapi-generator-cli generate -i docs/openapi.yaml \
  -g typescript-axios -o src/generated/api
```

---

### 2. [API Documentation](./API_DOCUMENTATION.md)
Documentazione completa delle API REST, endpoints, request/response formats e business logic.

**Contenuti:**
- Struttura dati (Modelli TypeScript/JSON)
- Endpoints API con esempi
- Formati Request/Response
- Codici di stato HTTP
- Esempi pratici di chiamate API

**Quando usarla:**
- Integrazione con backend
- Sviluppo nuove features
- Debug problemi API

---

### 3. [Data Structure](./DATA_STRUCTURE.md)
Diagrammi ER, relazioni tra entità, vincoli e regole di business.

**Contenuti:**
- Diagrammi Entity-Relationship
- Schema database con indici
- Flussi operativi dettagliati
- Stati del sistema
- Calcoli e formule
- Vincoli e validazioni

**Quando usarla:**
- Progettazione database
- Comprensione architettura dati
- Ottimizzazione query
- Planning nuove funzionalità

---

### 4. [Examples and Testing](./EXAMPLES_AND_TESTING.md)
Casi d'uso reali, test cases, mock data e troubleshooting.

**Contenuti:**
- Esempi pratici step-by-step
- Casi d'uso comuni (stagionalità, promozioni, etc.)
- Test suite completa
- Mock data per sviluppo
- Guida troubleshooting
- Performance tips

**Quando usarla:**
- Implementazione nuove funzionalità
- Testing e QA
- Debugging problemi
- Ottimizzazione performance

---

## 🚀 Quick Start

### Per Sviluppatori Backend

1. **Leggi**: [API Documentation](./API_DOCUMENTATION.md) - Sezione "Endpoints API"
2. **Implementa**: Gli endpoints seguendo gli schemi forniti
3. **Testa**: Con gli esempi in [Examples and Testing](./EXAMPLES_AND_TESTING.md)

```bash
# Esempio: Implementa endpoint per prezzi giornalieri
GET  /api/daily-prices/product/:productId?year=2025&month=11
POST /api/daily-prices/override
```

### Per Sviluppatori Frontend

1. **Leggi**: [API Documentation](./API_DOCUMENTATION.md) - Sezione "Struttura Dati"
2. **Studia**: [Data Structure](./DATA_STRUCTURE.md) - Sezione "Flussi Operativi"
3. **Usa**: I mock data in [Examples and Testing](./EXAMPLES_AND_TESTING.md)

```typescript
// Esempio: Carica prezzi per calendario
const prices = await fetch(
  `/api/daily-prices/product/${productId}?year=2025&month=11`
).then(r => r.json());
```

### Per Product Manager

1. **Panoramica**: [Data Structure](./DATA_STRUCTURE.md) - Sezione "Diagramma ER"
2. **Casi d'uso**: [Examples and Testing](./EXAMPLES_AND_TESTING.md) - Sezione "Casi d'Uso Comuni"
3. **Business Logic**: [API Documentation](./API_DOCUMENTATION.md) - Sezione "Business Logic"

---

## 🎯 Caratteristiche Principali

### Gestione Prezzi Dinamici

- **Prezzo Base**: Default del prodotto
- **Prezzo Fisso**: Personalizzato per giorno specifico
- **Percentuale**: Sconto/aumento % sul prezzo base

**Esempio:**
```
Prodotto: Tour Città - Prezzo Base €25

Bassa Stagione:  -20% → €20
Alta Stagione:   +30% → €32.50
Natale:          Fisso €45
```

### Gestione Disponibilità (Stock)

- Stock di default a livello prodotto
- Override per giorno specifico
- Aggiornamento automatico dopo bookings
- Blocco quando stock = 0

**Esempio:**
```
Prodotto: 30 posti

Weekend:        20 posti (limitato)
Festività:      10 posti (ristretto)
Giorno Normale: 30 posti (default)
```

### Stato Attivazione Giornaliero

- Attivo: Prodotto vendibile
- Non Attivo: Chiusura, manutenzione, etc.

**Esempio:**
```
Lunedì:     Non Attivo (chiusura settimanale)
Mart-Dom:   Attivo
25 Dic:     Attivo con menu speciale
```

### Calendario Interattivo

- Vista mensile/annuale
- Selezione multipla giorni (drag, shift-click)
- Modifiche bulk
- Visualizzazione stato giorni
- Giorni altri mesi selezionabili

---

## 📊 Architettura

```
┌─────────────────────────────────────────┐
│           Frontend (Angular)            │
│  - Calendario Interattivo               │
│  - Gestione Selezione Multi-giorno      │
│  - Form Prezzi e Stock                  │
└────────────┬────────────────────────────┘
             │ HTTP/REST API
             ▼
┌─────────────────────────────────────────┐
│          Backend API (REST)             │
│  - Validazione Business Rules           │
│  - Calcolo Prezzi                       │
│  - Gestione Override                    │
└────────────┬────────────────────────────┘
             │ SQL/ORM
             ▼
┌─────────────────────────────────────────┐
│         Database (PostgreSQL)           │
│  - Products                             │
│  - DailyPrices                          │
│  - Categories                           │
└─────────────────────────────────────────┘
```

---

## 🔑 Concetti Chiave

### 1. Override vs Base

**Base**: Usa prezzo/stock del prodotto (default)
**Override**: Personalizzazione per giorno specifico

```typescript
// Senza Override
{
  date: "2025-11-15",
  priceType: "base",
  finalPrice: 25.00,  // = product.price
  stock: 30           // = product.stock
}

// Con Override
{
  date: "2025-12-25",
  priceType: "fixed",
  fixedPrice: 45.00,
  finalPrice: 45.00,  // Personalizzato!
  stock: 10           // Ridotto per Natale
}
```

### 2. Preservazione Dati

Quando aggiorni un campo, gli altri vengono **preservati**.

```typescript
// Stato iniziale
{ priceType: "fixed", value: 35, stock: 10 }

// Aggiorno solo stock
setPriceOverride({ stock: 8 })

// Risultato: priceType e value conservati!
{ priceType: "fixed", value: 35, stock: 8 }
```

### 3. Calcolo Prezzo Finale

```typescript
finalPrice = calculatePrice(product.price, override)

// Base: finalPrice = 25
// Fixed(35): finalPrice = 35
// Percentage(+20): finalPrice = 25 + (25 * 0.20) = 30
// Percentage(-15): finalPrice = 25 - (25 * 0.15) = 21.25
```

---

## 🛠️ Tecnologie

### Frontend
- **Angular 18+**: Framework
- **TypeScript**: Linguaggio
- **RxJS**: Gestione asincrona
- **Signals**: State management
- **Material Design**: UI Components

### Backend (da implementare)
- **Node.js + Express** o **NestJS**: Server
- **TypeORM** o **Prisma**: Database ORM
- **PostgreSQL**: Database

### Testing
- **Jest**: Unit testing
- **Cypress**: E2E testing

---

## 📝 Workflow Tipico

### 1. Creazione Prodotto

```typescript
POST /api/products
{
  "name": "Tour Città",
  "price": 25.00,
  "stock": 30,
  "availabilityStartDate": "2025-01-01",
  "availabilityEndDate": "2025-12-31"
}

// Backend auto-genera 365 DailyPrice entries
// Tutte con priceType='base', finalPrice=25, stock=30
```

### 2. Configurazione Stagione

```typescript
// Alta Stagione: Luglio-Agosto (+25%)
POST /api/daily-prices/bulk-override
{
  "productId": 1,
  "dates": ["2025-07-01", ..., "2025-08-31"],
  "priceType": "percentage",
  "value": 25,
  "stock": 20
}
```

### 3. Gestione Quotidiana

```typescript
// Booking ricevuto → Aggiorna stock
POST /api/daily-prices/override
{
  "productId": 1,
  "date": "2025-08-15",
  "stock": 15  // Era 20, vendute 5
}

// Stock basso → Aumenta prezzo
if (stock < 5) {
  POST /api/daily-prices/override
  {
    "priceType": "percentage",
    "value": 15  // +15% per scarsità
  }
}
```

---

## 🎨 UI/UX Features

### Calendario

- **Codici Colore**:
  - Verde: Oggi
  - Giallo: Weekend
  - Arancione: Prezzo personalizzato
  - Blu: Selezionato
  - Rosso: Non attivo
  - Grigio: Giorno passato

- **Selezione Multipla**:
  - Click: Seleziona singolo giorno
  - Shift+Click: Seleziona range
  - Double-Click+Drag: Selezione drag

- **Pannello Modifica**:
  - Toggle Attivo/Non Attivo
  - Input Stock
  - Radio Tipo Prezzo
  - Input Valore/Percentuale

### Feedback

- Snackbar per conferme
- Contatore giorni selezionati
- Anteprima prezzo calcolato
- Indicatori visivi stato

---

## 🔒 Validazioni

### Lato Client
- Prezzi >= 0
- Stock >= 0
- Date formato ISO (YYYY-MM-DD)
- Percentuali tra -100 e +1000
- Giorni passati non modificabili

### Lato Server
- Unicità (productId, date)
- Foreign key constraints
- Business rules (stock, prezzi)
- Transazioni atomiche

---

## 🐛 Common Issues

### Prezzi Non Aggiornati
**Causa**: Cache non invalidata
**Fix**: Ricarica calendario dopo modifica

### Stock Inconsistente
**Causa**: Race condition su bookings multipli
**Fix**: Usa transazioni database

### Selezione Non Funziona
**Causa**: Event handlers non configurati
**Fix**: Verifica mouseup listener su container

Vedi [Examples and Testing](./EXAMPLES_AND_TESTING.md#troubleshooting) per dettagli.

---

## 📈 Metriche e KPI

Il sistema può tracciare:

- **Revenue Management**:
  - Prezzo medio per giorno
  - Revenue totale per periodo
  - Occupancy rate

- **Inventory**:
  - Stock venduto vs disponibile
  - Giorni sold-out
  - Lead time medio bookings

- **Pricing**:
  - Distribuzione tipi prezzo (base/fixed/%)
  - Efficacia promozioni
  - Price elasticity

---

## 🔄 Roadmap Future

### Fase 1 (Completata)
- ✅ CRUD Prodotti
- ✅ Calendario interattivo
- ✅ Prezzi dinamici
- ✅ Gestione stock
- ✅ Stato attivazione
- ✅ Selezione multipla

### Fase 2 (Pianificata)
- [ ] Import/Export CSV
- [ ] Template prezzi stagionali
- [ ] Automazioni (es: last minute deals)
- [ ] Reporting e analytics
- [ ] Multi-currency
- [ ] API webhooks per integrazioni

### Fase 3 (Futura)
- [ ] ML price optimization
- [ ] Dynamic pricing automatico
- [ ] Integrazione meteo/eventi
- [ ] Mobile app
- [ ] Marketplace integration

---

## 👥 Contribuire

1. Leggi la documentazione
2. Crea feature branch
3. Scrivi test
4. Apri Pull Request
5. Aggiorna documentazione se necessario

---

## 📞 Supporto

- **Domande tecniche**: Vedi [API Documentation](./API_DOCUMENTATION.md)
- **Bug**: Vedi [Troubleshooting](./EXAMPLES_AND_TESTING.md#troubleshooting)
- **Features**: Vedi [Roadmap](#-roadmap-future)

---

## 📄 License

Proprietario - Tutti i diritti riservati

---

## 🔖 Changelog

### Version 1.0.0 (2025-10-30)
- Initial release
- Complete documentation
- All core features implemented

---

**Ultimo aggiornamento**: 30 Ottobre 2025
**Versione**: 1.0.0
**Autori**: Development Team
