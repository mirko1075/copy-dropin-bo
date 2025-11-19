# 🚀 Getting Started - Backend API

Guida rapida per avviare il backend TypeScript.

## ⚡ Quick Start

### 1. Installa dipendenze

```bash
cd backend
npm install
```

### 2. Configura MySQL

Crea il database:

```sql
CREATE DATABASE backoffice_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configura variabili ambiente

Il file `.env` è già configurato con valori di default. Modifica se necessario:

```env
DB_HOST=localhost
DB_USERNAME=root
DB_PASSWORD=          # Inserisci la tua password MySQL
DB_DATABASE=backoffice_db
```

### 4. Avvia il server

```bash
npm run dev
```

Il server partirà su: **http://localhost:3000**

### 5. Testa il server

```bash
# Health check
curl http://localhost:3000/backoffice/v1/health

# Response:
# {
#   "success": true,
#   "message": "Service is healthy",
#   "data": {
#     "status": "OK",
#     "timestamp": "...",
#     "uptime": 123.45
#   }
# }
```

---

## 🧪 Test API con curl

### Creare una categoria

```bash
curl -X POST \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "spa-treatments",
    "nameIt": "Trattamenti Spa",
    "nameEn": "Spa Treatments",
    "nameDe": "Spa-Behandlungen",
    "status": "active"
  }' \
  http://localhost:3000/backoffice/v1/categories
```

### Ottenere tutte le categorie

```bash
curl -H "Authorization: Bearer test-token" \
  http://localhost:3000/backoffice/v1/categories
```

### Creare un prodotto

Prima crea una categoria e un site (o usa UUID temporanei), poi:

```bash
curl -X POST \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "hot-stone-massage",
    "categoryId": "YOUR-CATEGORY-UUID",
    "siteId": "YOUR-SITE-UUID",
    "nameIt": "Massaggio Pietre Calde",
    "nameEn": "Hot Stone Massage",
    "nameDe": "Hot Stone Massage",
    "basePrice": 85.00,
    "duration": 60,
    "status": "published"
  }' \
  http://localhost:3000/backoffice/v1/products
```

---

## 📚 Endpoints Disponibili

### Health

- `GET /backoffice/v1/health` - Health check
- `GET /backoffice/v1/health/ready` - Readiness (DB check)
- `GET /backoffice/v1/health/info` - Service info

### Categories

- `GET /backoffice/v1/categories` - Lista categorie
- `GET /backoffice/v1/categories/active` - Solo categorie attive
- `GET /backoffice/v1/categories/:id` - Categoria per ID
- `POST /backoffice/v1/categories` - Crea categoria
- `PUT /backoffice/v1/categories/:id` - Aggiorna categoria
- `DELETE /backoffice/v1/categories/:id` - Elimina categoria

### Products

- `GET /backoffice/v1/products` - Lista prodotti
- `GET /backoffice/v1/products/:id` - Prodotto per ID
- `GET /backoffice/v1/products/search?q=termo` - Cerca prodotti
- `POST /backoffice/v1/products` - Crea prodotto
- `PUT /backoffice/v1/products/:id` - Aggiorna prodotto
- `DELETE /backoffice/v1/products/:id` - Elimina prodotto

---

## 🔐 Autenticazione

**NOTA IMPORTANTE**: Per ora il JWT è sempre valido (per testing). Qualsiasi token nell'header `Authorization: Bearer xxx` viene accettato.

Per attivare la validazione reale:
1. Apri `src/middlewares/auth.middleware.ts`
2. Decommenta il blocco "FULL IMPLEMENTATION"
3. Commenta il blocco "TEMPORARY"

---

## 🗄️ Database

TypeORM creerà automaticamente le tabelle al primo avvio (solo in development con `DB_SYNCHRONIZE=true`).

Tabelle create:
- `tenants`
- `vendors`
- `sites`
- `service_categories`
- `service_products`
- `pricing_availability`
- `payment_configs`
- `users`

---

## 🛠️ Sviluppo

### Hot reload attivo

Nodemon monitora i cambiamenti nei file `.ts` e riavvia automaticamente il server.

### Visualizza i log

I log sono salvati in:
- `backend/logs/error.log` - Solo errori
- `backend/logs/combined.log` - Tutti i log

### Build per produzione

```bash
npm run build
npm start
```

---

## ⚠️ Troubleshooting

### Errore: Cannot connect to MySQL

Verifica:
1. MySQL è running: `mysql --version`
2. Database esiste: `SHOW DATABASES;`
3. Credenziali corrette in `.env`

### Errore: Port 3000 already in use

Cambia porta in `.env`:
```env
PORT=3001
```

### Errore: Module not found

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📖 Documentazione Completa

Leggi il [README.md](./README.md) per la documentazione completa.

---

## ✅ Checklist Setup

- [ ] MySQL installato e running
- [ ] Database `backoffice_db` creato
- [ ] File `.env` configurato
- [ ] Dipendenze installate (`npm install`)
- [ ] Server avviato (`npm run dev`)
- [ ] Health check funzionante
- [ ] Prima categoria creata
- [ ] Primo prodotto creato

---

**Pronto! Il tuo backend è online! 🎉**
