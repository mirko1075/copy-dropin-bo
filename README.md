# Backoffice Servizi - Gestione Catalogo

Applicazione Angular backoffice per la gestione del catalogo prodotti/servizi per hotel, spa, ristoranti ed esperienze.

## 📋 Caratteristiche Principali

- **Gestione Prodotti/Servizi**: CRUD completo per prodotti e servizi
- **Gestione Categorie**: Organizzazione per categorie con traduzioni
- **Configurazione Prezzi**: Regole di prezzo per periodo e quantità
- **Disponibilità**: Gestione slot di disponibilità con calendario
- **Metodi di Pagamento**: Configurazione completa (Carta, Bonifico, PayPal, Scalapay)
- **Multi-tenancy**: Supporto a 3 livelli (Tenant → Vendor → Site)
- **Internazionalizzazione**: Traduzioni in 5 lingue (IT, EN, DE, FR, ES)

## 🚀 Stack Tecnologico

- **Angular 20+** (standalone components)
- **TypeScript 5+**
- **Angular Material** (UI components)
- **RxJS 7+** (reactive programming)
- **Signals API** (state management)
- **HTTP Interceptors** (auth & multi-tenancy)
- **Lazy Loading** (optimization)

## 🛠️ Setup e Installazione

### Prerequisiti

- Node.js 18+ e npm
- Angular CLI 20+

### Installazione

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo
ng serve

# Apri browser su http://localhost:4200
```

### Build per Produzione

```bash
ng build --configuration production
```

## 📁 Struttura del Progetto

```
src/app/
├── core/              # Services, guards, interceptors, models
├── layout/            # Main layout, sidebar, header
├── features/          # Lazy-loaded feature modules
│   ├── dashboard/     # Dashboard con statistiche
│   ├── products/      # Gestione prodotti
│   ├── categories/    # Gestione categorie
│   ├── pricing/       # Prezzi e disponibilità
│   ├── payment-config/# Configurazione pagamenti
│   └── settings/      # Impostazioni
└── shared/            # Shared components (da implementare)
```

## 🔧 Configurazione

Modifica i file environment in `src/environments/`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/backoffice/v1',
  auth: {
    clientId: 'backoffice-dev',
    authority: 'http://localhost:8080/auth'
  }
};
```

## 🚧 Stato Attuale e TODO

### ✅ Completato

- [x] Setup progetto Angular 20+ con standalone components
- [x] Configurazione Angular Material e tema
- [x] Struttura cartelle (core, features, layout, shared)
- [x] TypeScript models completi
- [x] Core services (Auth, TenantContext, Multi-tenancy API)
- [x] HTTP Interceptors (auth, tenant-context)
- [x] Route guards (auth, tenant-selection)
- [x] Layout components (main-layout, sidebar, header)
- [x] Dashboard con statistiche
- [x] Routing con lazy loading
- [x] Environment files
- [x] Mock data per testing

### 🚧 Da Implementare

#### Alta Priorità
- [ ] Product List & Form Components
- [ ] Category List & Form Components
- [ ] Translation Editor Component
- [ ] Status Badge Component
- [ ] Data Table Component

#### Media Priorità
- [ ] Pricing Rules Management
- [ ] Availability Calendar
- [ ] Payment Configuration UI
- [ ] Tenant Selector Component

#### Bassa Priorità
- [ ] Custom validators e pipes
- [ ] Error handling globale
- [ ] Loading indicators
- [ ] Notifications (MatSnackBar)
- [ ] Unit tests

## 📚 Documentazione

Per le specifiche complete, vedere:
- [ANGULAR_BACKOFFICE_INSTRUCTIONS.md](ANGULAR_BACKOFFICE_INSTRUCTIONS.md)

## 👥 Autori

Generato con Angular CLI 20.3.7

---

**Nota**: Progetto in sviluppo attivo. Molte funzionalità UI sono ancora da implementare.
# copy-dropin-bo
