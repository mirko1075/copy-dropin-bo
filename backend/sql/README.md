# SQL Scripts - Backoffice Database

Scripts SQL per la creazione e gestione del database MySQL del backend.

## 📁 File Disponibili

### 1️⃣ **01_create_database.sql**
Crea il database `backoffice_db` con encoding UTF8MB4.

```bash
mysql -u root -p < sql/01_create_database.sql
```

### 2️⃣ **02_create_tables.sql**
Crea tutte le 8 tabelle con relazioni, indici e constraints.

Tabelle create:
- `tenants` - Organizzazioni (top level)
- `vendors` - Fornitori/Hotel Group
- `sites` - Siti fisici (hotel, spa, ristoranti)
- `service_categories` - Categorie servizi (multi-lingua)
- `service_products` - Prodotti/Servizi (multi-lingua)
- `pricing_availability` - Prezzi e disponibilità
- `payment_configs` - Configurazioni pagamento
- `users` - Utenti del sistema

```bash
mysql -u root -p < sql/02_create_tables.sql
```

### 3️⃣ **03_seed_data.sql**
Inserisce dati di esempio per testing:
- 1 Tenant
- 1 Vendor
- 2 Sites (Milano Spa, Roma Hotel)
- 3 Categorie
- 4 Prodotti
- 3 Prezzi
- 2 Users

```bash
mysql -u root -p < sql/03_seed_data.sql
```

### 4️⃣ **04_useful_queries.sql**
Query utili per development:
- Visualizzare prodotti con categoria e site
- Visualizzare pricing con info prodotto
- Gerarchia multi-tenancy
- Statistiche per categoria/site
- Ricerca prodotti (multi-lingua)
- Trovare slot disponibili
- Cleanup soft delete
- Statistiche database

```bash
mysql -u root -p backoffice_db < sql/04_useful_queries.sql
```

### 9️⃣ **99_drop_tables.sql**
⚠️ **ATTENZIONE**: Elimina TUTTE le tabelle e i dati!

Usa solo per reset completo del database.

```bash
mysql -u root -p backoffice_db < sql/99_drop_tables.sql
```

---

## 🚀 Setup Completo (Quick Start)

### Opzione 1: Setup Completo con Dati di Esempio

```bash
# 1. Crea database
mysql -u root -p < sql/01_create_database.sql

# 2. Crea tabelle
mysql -u root -p backoffice_db < sql/02_create_tables.sql

# 3. Inserisci dati di esempio
mysql -u root -p backoffice_db < sql/03_seed_data.sql
```

### Opzione 2: Setup Solo Struttura (Senza Dati)

```bash
# 1. Crea database
mysql -u root -p < sql/01_create_database.sql

# 2. Crea tabelle
mysql -u root -p backoffice_db < sql/02_create_tables.sql
```

### Opzione 3: Script Combinato

Puoi anche eseguire tutti gli script in sequenza:

```bash
cat sql/01_create_database.sql \
    sql/02_create_tables.sql \
    sql/03_seed_data.sql | mysql -u root -p
```

---

## 🗄️ Struttura Database

### Gerarchia Multi-Tenancy

```
Tenant (Organization)
  └── Vendor (Hotel Group)
      └── Site (Hotel/Spa)
          ├── Products (Services)
          └── Pricing (Availability)
```

### Relazioni Principali

```
service_categories
  └── service_products (1:N)
      └── pricing_availability (1:N)

tenants
  ├── vendors (1:N)
  │   └── sites (1:N)
  │       └── service_products (1:N)
  └── users (1:N)
```

---

## 📊 Caratteristiche Tabelle

### Tutte le tabelle includono:

✅ **UUID** come primary key
✅ **Soft delete** (campo `deleted_at`)
✅ **Timestamps** (`created_at`, `updated_at`)
✅ **Indici** su campi chiave
✅ **Foreign keys** con cascade
✅ **UTF8MB4** encoding

### Multi-lingua:

- **Categories**: IT, EN, DE, FR, ES
- **Products**: IT, EN, DE

---

## 🔍 Query Utili

### Visualizzare tutti i prodotti con categoria

```sql
SELECT
  p.name_it,
  c.name_it AS category,
  s.name AS site,
  p.base_price,
  p.status
FROM service_products p
LEFT JOIN service_categories c ON p.category_id = c.id
LEFT JOIN sites s ON p.site_id = s.id
WHERE p.deleted_at IS NULL;
```

### Contare prodotti per categoria

```sql
SELECT
  c.name_it AS category,
  COUNT(p.id) AS total_products
FROM service_categories c
LEFT JOIN service_products p ON p.category_id = c.id
GROUP BY c.id, c.name_it;
```

### Trovare disponibilità per una data

```sql
SELECT
  p.name_it,
  pr.price,
  pr.max_capacity - pr.current_bookings AS available
FROM pricing_availability pr
JOIN service_products p ON pr.product_id = p.id
WHERE '2025-01-15' BETWEEN pr.start_date AND pr.end_date
  AND pr.status = 'active';
```

---

## 🔧 Manutenzione

### Backup Database

```bash
mysqldump -u root -p backoffice_db > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
mysql -u root -p backoffice_db < backup_20250115.sql
```

### Reset Completo

```bash
# Drop tables
mysql -u root -p backoffice_db < sql/99_drop_tables.sql

# Ricrea tutto
mysql -u root -p backoffice_db < sql/02_create_tables.sql
mysql -u root -p backoffice_db < sql/03_seed_data.sql
```

---

## ⚠️ Note Importanti

### Development vs Production

**Development** (`DB_SYNCHRONIZE=true` in `.env`):
- TypeORM sincronizza automaticamente le entities
- Non serve eseguire script SQL manualmente
- Le tabelle vengono create/aggiornate all'avvio

**Production** (`DB_SYNCHRONIZE=false`):
- Usa questi script SQL per creare il database
- Oppure usa TypeORM migrations
- Mai usare `synchronize=true` in produzione!

### Soft Delete

Tutte le tabelle supportano **soft delete**:
- I record non vengono eliminati fisicamente
- Campo `deleted_at` viene impostato con timestamp
- Le query escludono automaticamente i record eliminati
- Per cleanup permanente, usa query in `04_useful_queries.sql`

### Foreign Keys

Le foreign keys hanno **CASCADE DELETE**:
- Eliminando un Tenant → vengono eliminati Vendors, Sites, Users
- Eliminando un Vendor → vengono eliminati Sites
- Eliminando un Site → vengono eliminati Products, Pricing
- **RESTRICT** su Categories → non si possono eliminare se hanno Products

---

## 📝 Checklist Setup

- [ ] MySQL 8.x installato e running
- [ ] Database `backoffice_db` creato
- [ ] Tutte le 8 tabelle create
- [ ] Dati di esempio inseriti (opzionale)
- [ ] Verificato con query di test
- [ ] Backend configurato con credenziali corrette
- [ ] TypeORM si connette correttamente

---

## 🆘 Troubleshooting

### Errore: Access denied

```bash
# Verifica credenziali MySQL
mysql -u root -p

# Se necessario, crea nuovo utente
CREATE USER 'backoffice_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON backoffice_db.* TO 'backoffice_user'@'localhost';
FLUSH PRIVILEGES;
```

### Errore: Database already exists

```bash
# Drop database esistente (ATTENZIONE: cancella tutti i dati!)
mysql -u root -p -e "DROP DATABASE backoffice_db;"

# Ricrea
mysql -u root -p < sql/01_create_database.sql
```

### Errore: Foreign key constraint fails

Assicurati di eseguire gli script nell'ordine corretto:
1. Database
2. Tabelle
3. Seed data

---

## 📚 Riferimenti

- [MySQL 8.x Documentation](https://dev.mysql.com/doc/)
- [TypeORM Documentation](https://typeorm.io/)
- Backend README: `../README.md`

---

**Database pronto per l'uso!** 🎉
