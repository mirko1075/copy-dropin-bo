# Backoffice Backend API

Backend TypeScript professionale per il sistema Backoffice Servizi con **JWT Authentication**, **MySQL**, e **best practices di sicurezza**.

## 🎯 Caratteristiche

### Architettura
- **TypeScript** con strict mode
- **Express.js** framework
- **TypeORM** per database MySQL
- **Architettura Layered** (Controller → Service → Repository)
- **SOLID Principles** applicati
- **DRY Pattern** per codice riutilizzabile

### Sicurezza
- ✅ **JWT Authentication** (token validation - ora sempre valido per testing)
- ✅ **Helmet** - Security headers
- ✅ **CORS** configurato
- ✅ **Rate Limiting** - Protezione DDoS
- ✅ **Input Validation** - express-validator
- ✅ **NoSQL Injection Protection**
- ✅ **HPP Protection** - HTTP Parameter Pollution
- ✅ **Request Sanitization**
- ✅ **XSS Protection**
- ✅ **CSRF Protection**

### Features
- ✅ Multi-tenancy (Tenant → Vendor → Site)
- ✅ CRUD Categories (multi-language: IT, EN, DE, FR, ES)
- ✅ CRUD Products (multi-language: IT, EN, DE)
- ✅ Pagination support
- ✅ Search functionality
- ✅ Soft delete
- ✅ Health checks
- ✅ Winston logging
- ✅ Error handling centralizzato
- ✅ Response standardizzate

---

## 📋 Prerequisiti

- **Node.js** >= 18.x
- **MySQL** >= 8.x
- **npm** o **yarn**

---

## 🚀 Installation

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

Copia `.env.example` in `.env` e configura le variabili:

```bash
cp .env.example .env
```

Modifica `.env` con le tue configurazioni:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=backoffice_db

# JWT Secret (CAMBIA IN PRODUZIONE!)
JWT_SECRET=your-super-secret-jwt-key
```

### 3. Setup Database

Crea il database MySQL:

```sql
CREATE DATABASE backoffice_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run Database Migrations

TypeORM creerà automaticamente le tabelle al primo avvio (in development mode con `DB_SYNCHRONIZE=true`):

```bash
npm run dev
```

**NOTA**: In produzione, disabilita `DB_SYNCHRONIZE` e usa le migrations:

```bash
npm run migration:generate -- -n MigrationName
npm run migration:run
```

---

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

Server runs on: `http://localhost:3000`

### Production Mode

```bash
npm run build
npm start
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:3000/backoffice/v1
```

### Authentication

Tutte le routes (eccetto `/health`) richiedono un JWT token nell'header:

```http
Authorization: Bearer <your-jwt-token>
```

**NOTA**: Per ora il JWT è sempre validato come valido per il testing. La logica per validazione reale è già implementata e commentata in `auth.middleware.ts`.

---

## 🔐 API Endpoints

### Health Check

#### GET /backoffice/v1/health
Basic health check

```bash
curl http://localhost:3000/backoffice/v1/health
```

#### GET /backoffice/v1/health/ready
Readiness check (include database connectivity)

#### GET /backoffice/v1/health/info
Service information

---

### Categories

#### GET /backoffice/v1/categories
Get all categories (with pagination)

```bash
curl -H "Authorization: Bearer your-token" \
  "http://localhost:3000/backoffice/v1/categories?page=1&limit=10"
```

#### GET /backoffice/v1/categories/active
Get active categories only

#### GET /backoffice/v1/categories/:id
Get category by ID

#### GET /backoffice/v1/categories/code/:code
Get category by code

#### POST /backoffice/v1/categories
Create new category (Admin, Manager only)

```bash
curl -X POST \
  -H "Authorization: Bearer your-token" \
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

#### PUT /backoffice/v1/categories/:id
Update category (Admin, Manager, Editor)

#### PATCH /backoffice/v1/categories/:id/status
Update category status (Admin, Manager)

```bash
curl -X PATCH \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}' \
  http://localhost:3000/backoffice/v1/categories/:id/status
```

#### DELETE /backoffice/v1/categories/:id
Delete category (Admin only)

---

### Products

#### GET /backoffice/v1/products
Get all products (with filters)

Query params:
- `siteId` - Filter by site
- `categoryId` - Filter by category
- `status` - Filter by status
- `page` - Page number
- `limit` - Items per page

```bash
curl -H "Authorization: Bearer your-token" \
  "http://localhost:3000/backoffice/v1/products?siteId=xxx&page=1&limit=10"
```

#### GET /backoffice/v1/products/:id
Get product by ID

#### GET /backoffice/v1/products/category/:categoryId
Get products by category

#### GET /backoffice/v1/products/site/:siteId
Get products by site

#### GET /backoffice/v1/products/search?q=massage
Search products by name

#### POST /backoffice/v1/products
Create new product (Admin, Manager, Editor)

```bash
curl -X POST \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "hot-stone-massage",
    "categoryId": "category-uuid",
    "siteId": "site-uuid",
    "nameIt": "Massaggio Pietre Calde",
    "nameEn": "Hot Stone Massage",
    "nameDe": "Hot Stone Massage",
    "basePrice": 85.00,
    "duration": 60,
    "status": "published"
  }' \
  http://localhost:3000/backoffice/v1/products
```

#### PUT /backoffice/v1/products/:id
Update product (Admin, Manager, Editor)

#### PATCH /backoffice/v1/products/:id/status
Update product status (Admin, Manager)

#### DELETE /backoffice/v1/products/:id
Delete product (Admin only)

---

## 🔑 User Roles & Permissions

| Role | Categories | Products | Delete |
|------|-----------|----------|--------|
| **Admin** | ✅ Full CRUD | ✅ Full CRUD | ✅ Yes |
| **Manager** | ✅ Create/Edit | ✅ Full CRUD | ❌ No |
| **Editor** | ✅ Edit only | ✅ Create/Edit | ❌ No |
| **Viewer** | 👁️ Read only | 👁️ Read only | ❌ No |

---

## 🗄️ Database Structure

### Tables

```
tenants
├── vendors
│   └── sites
│       ├── service_products
│       └── pricing_availability
│
service_categories
└── service_products

users
payment_configs
```

### Multi-tenancy Hierarchy

```
Tenant (Organization)
  └── Vendor (Hotel Group)
      └── Site (Individual Hotel/Spa)
          └── Products (Services)
```

---

## 🛡️ Security Features

### 1. Helmet
Imposta security headers:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Content-Security-Policy
- HSTS

### 2. CORS
Configurato per accettare richieste solo da frontend autorizzato.

### 3. Rate Limiting
- **Global**: 100 requests per 15 minuti
- **Auth routes**: 5 attempts per 15 minuti

### 4. Input Validation
Ogni endpoint valida e sanitizza gli input con `express-validator`.

### 5. NoSQL Injection Protection
Rimuove caratteri pericolosi (`$`, `.`) dai parametri.

### 6. HPP Protection
Previene HTTP Parameter Pollution attacks.

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.config.ts
│   │   └── env.config.ts
│   │
│   ├── entities/            # TypeORM entities
│   │   ├── base.entity.ts
│   │   ├── tenant.entity.ts
│   │   ├── vendor.entity.ts
│   │   ├── site.entity.ts
│   │   ├── service-category.entity.ts
│   │   ├── service-product.entity.ts
│   │   ├── pricing-availability.entity.ts
│   │   ├── payment-config.entity.ts
│   │   └── user.entity.ts
│   │
│   ├── repositories/        # Data access layer
│   │   ├── base.repository.ts
│   │   ├── category.repository.ts
│   │   └── product.repository.ts
│   │
│   ├── services/            # Business logic
│   │   ├── category.service.ts
│   │   └── product.service.ts
│   │
│   ├── controllers/         # Request handlers
│   │   ├── category.controller.ts
│   │   ├── product.controller.ts
│   │   └── health.controller.ts
│   │
│   ├── routes/              # API routes
│   │   ├── category.routes.ts
│   │   ├── product.routes.ts
│   │   ├── health.routes.ts
│   │   └── index.ts
│   │
│   ├── middlewares/         # Express middlewares
│   │   ├── auth.middleware.ts
│   │   ├── tenant-context.middleware.ts
│   │   ├── security.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   │
│   ├── utils/               # Utilities
│   │   ├── logger.ts
│   │   ├── errors.ts
│   │   └── response.ts
│   │
│   ├── types/               # TypeScript types
│   │   └── express.d.ts
│   │
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
│
├── logs/                    # Log files
├── dist/                    # Compiled JavaScript
├── .env                     # Environment variables
├── .env.example             # Example environment
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🧪 Testing JWT Authentication

### Generate a test JWT

Puoi usare [jwt.io](https://jwt.io) per generare un token di test con questo payload:

```json
{
  "id": "test-user-id",
  "email": "admin@example.com",
  "role": "admin",
  "tenantId": "test-tenant-id",
  "permissions": ["*"]
}
```

**NOTA**: Per ora qualsiasi token viene accettato come valido. Per attivare la validazione reale, decommentare il codice in `src/middlewares/auth.middleware.ts`.

---

## 🔧 Scripts

```bash
# Development
npm run dev              # Start with nodemon (hot reload)

# Production
npm run build            # Compile TypeScript
npm start                # Run compiled code

# Database
npm run typeorm          # Run TypeORM CLI
npm run migration:generate  # Generate migration
npm run migration:run    # Run migrations
npm run migration:revert # Revert last migration

# Linting
npm run lint             # Check code quality
npm run lint:fix         # Fix linting errors
```

---

## 📊 Logging

Winston logger con 3 livelli:

- **error.log** - Solo errori
- **combined.log** - Tutti i log
- **Console** - In development mode

Log format:
```
2025-01-15 10:30:45 [INFO]: Server started on port 3000
```

---

## 🚨 Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": [...],
  "timestamp": "2025-01-15T10:30:45.123Z",
  "stack": "..." // Solo in development
}
```

### Standard Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...},
  "timestamp": "2025-01-15T10:30:45.123Z"
}
```

### HTTP Status Codes

- **200** - Success
- **201** - Created
- **204** - No Content
- **400** - Bad Request / Validation Error
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict (duplicate resource)
- **500** - Internal Server Error

---

## 🔐 JWT Authentication (Full Implementation)

### Attuale (Testing Mode)

Il JWT è sempre validato come valido. Qualsiasi token viene accettato.

### Attivare Validazione Reale

In `src/middlewares/auth.middleware.ts`, decommentare questo blocco:

```typescript
try {
  const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
  req.user = {
    id: decoded.id,
    email: decoded.email,
    role: decoded.role,
    tenantId: decoded.tenantId,
    permissions: decoded.permissions,
  };
} catch (error) {
  if (error instanceof jwt.TokenExpiredError) {
    throw new UnauthorizedError('Token expired');
  }
  if (error instanceof jwt.JsonWebTokenError) {
    throw new UnauthorizedError('Invalid token');
  }
  throw error;
}
```

E commentare/rimuovere il blocco temporaneo sopra.

---

## 🌐 Multi-tenancy

Ogni richiesta può includere questi headers per il contesto:

```http
X-Tenant-Id: tenant-uuid
X-Vendor-Id: vendor-uuid
X-Site-Id: site-uuid
```

Il backend li estrae automaticamente tramite `tenantContext` middleware.

---

## 📝 TODO Future

- [ ] Implementare endpoints per Tenants, Vendors, Sites
- [ ] Implementare endpoints per Pricing & Availability
- [ ] Implementare endpoints per Payment Config
- [ ] Aggiungere test unitari (Jest)
- [ ] Aggiungere test integration
- [ ] Implementare refresh token
- [ ] Aggiungere email service
- [ ] Aggiungere file upload (S3/local)
- [ ] Implementare audit log
- [ ] Aggiungere OpenAPI/Swagger docs
- [ ] Docker setup
- [ ] CI/CD pipeline

---

## 📄 License

ISC

---

## 👨‍💻 Author

Backoffice Backend Team

---

## 🆘 Support

Per problemi o domande:
1. Controlla i log in `backend/logs/`
2. Verifica la configurazione `.env`
3. Verifica che MySQL sia running
4. Verifica che il database sia creato

---

## 🎉 Pronto per l'uso!

```bash
cd backend
npm install
npm run dev
```

Il server sarà disponibile su `http://localhost:3000` 🚀
