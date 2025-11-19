# OpenAPI Specification - Guida d'Uso

## 📋 Panoramica

Il file [openapi.yaml](./openapi.yaml) contiene la specifica completa OpenAPI 3.0 delle API del sistema.

## 🚀 Come Utilizzare

### 1. Visualizzare con Swagger UI

#### 🚀 Locale - File HTML (Più Semplice!)
Abbiamo già creato un file HTML standalone pronto all'uso:

1. Apri semplicemente [api-docs.html](./api-docs.html) nel browser
2. ✅ Nessuna installazione richiesta
3. ✅ Funziona offline
4. ✅ UI interattiva completa

```bash
# Apri direttamente nel browser
open docs/api-docs.html  # macOS
xdg-open docs/api-docs.html  # Linux
start docs/api-docs.html  # Windows
```

#### Online (Swagger Editor)
1. Vai su [editor.swagger.io](https://editor.swagger.io/)
2. File → Import File → Seleziona `openapi.yaml`
3. Esplora la documentazione interattiva

#### Locale con Docker
```bash
docker run -p 8080:8080 \
  -e SWAGGER_JSON=/api/openapi.yaml \
  -v $(pwd)/docs:/api \
  swaggerapi/swagger-ui
```

Poi apri: http://localhost:8080

#### Con NPM
```bash
# Installa swagger-ui-express
npm install swagger-ui-express yamljs

# In Express app
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./docs/openapi.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

### 2. Generare Client SDK

#### TypeScript/JavaScript
```bash
npm install @openapitools/openapi-generator-cli -g

openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g typescript-axios \
  -o src/generated/api
```

#### Java
```bash
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g java \
  -o java-client
```

#### Python
```bash
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g python \
  -o python-client
```

### 3. Validare Spec

```bash
# Con Swagger CLI
npm install -g @apidevtools/swagger-cli
swagger-cli validate docs/openapi.yaml

# Con openapi-generator
openapi-generator-cli validate -i docs/openapi.yaml
```

### 4. Testare API con Postman

1. Apri Postman
2. Import → Link → Incolla URL del file openapi.yaml
3. Postman genera automaticamente le collection

### 5. Generare Documentazione Statica

#### ReDoc
```bash
npm install -g redoc-cli

redoc-cli bundle docs/openapi.yaml \
  -o docs/api-documentation.html \
  --title "API Documentation"
```

#### Slate
```bash
npm install -g widdershins
npm install -g shins

widdershins docs/openapi.yaml -o docs/api-source.md
shins --inline docs/api-source.md -o docs/api-slate.html
```

## 📚 Struttura OpenAPI Spec

### Metadata
```yaml
info:
  title: Sistema Gestione Prezzi e Disponibilità API
  version: 1.0.0
  description: API REST completa
```

### Servers
```yaml
servers:
  - url: http://localhost:3000/api/v1  # Development
  - url: https://api.example.com/api/v1  # Production
```

### Tags (Gruppi Endpoint)
- **Products**: CRUD prodotti
- **Daily Prices**: Gestione prezzi giornalieri
- **Categories**: Gestione categorie

### Paths (Endpoints)

#### Products
- `GET /products` - Lista prodotti
- `POST /products` - Crea prodotto
- `GET /products/{id}` - Dettagli prodotto
- `PUT /products/{id}` - Aggiorna prodotto
- `DELETE /products/{id}` - Elimina prodotto

#### Daily Prices
- `GET /daily-prices` - Lista prezzi
- `GET /daily-prices/product/{id}` - Prezzi per prodotto
- `POST /daily-prices/override` - Imposta override
- `POST /daily-prices/bulk-override` - Override multipli
- `DELETE /daily-prices/override/{id}/{date}` - Rimuovi override

#### Categories
- `GET /categories` - Lista categorie

### Schemas (Modelli Dati)

#### ServiceProduct
```yaml
ServiceProduct:
  type: object
  required: [id, name, price, currency, category, isActive]
  properties:
    id: integer
    name: string
    price: number
    currency: string
    category: string
    # ... altri campi
```

#### DailyPrice
```yaml
DailyPrice:
  type: object
  required: [id, productId, date, priceType, finalPrice, currency]
  properties:
    id: integer
    productId: integer
    date: string (date)
    priceType: enum [base, fixed, percentage]
    finalPrice: number
    # ... altri campi
```

#### PriceOverride
```yaml
PriceOverride:
  type: object
  required: [productId, date, priceType]
  properties:
    productId: integer
    date: string (date)
    priceType: enum
    value: number (optional)
    stock: integer (optional)
    isActive: boolean (optional)
```

### Esempi di Request/Response

Ogni endpoint include esempi multipli:

```yaml
examples:
  fixedPrice:
    summary: Imposta prezzo fisso
    value:
      productId: 1
      date: '2025-12-25'
      priceType: fixed
      value: 45.00
      stock: 15
      isActive: true
```

### Responses
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## 🧪 Testing con OpenAPI

### Esempio con curl

```bash
# Lista prodotti
curl -X GET "http://localhost:3000/api/v1/products" \
  -H "Accept: application/json"

# Crea prodotto
curl -X POST "http://localhost:3000/api/v1/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tour Colosseo",
    "description": "Visita guidata",
    "price": 25.00,
    "currency": "EUR",
    "category": "tours"
  }'

# Imposta override
curl -X POST "http://localhost:3000/api/v1/daily-prices/override" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "date": "2025-12-25",
    "priceType": "fixed",
    "value": 45.00,
    "stock": 15
  }'
```

### Esempio con TypeScript SDK Auto-generato

```typescript
import { ProductsApi, DailyPricesApi } from './generated/api';

const productsApi = new ProductsApi();
const pricesApi = new DailyPricesApi();

// Lista prodotti
const products = await productsApi.getProducts();

// Crea override
const override = await pricesApi.setPriceOverride({
  productId: 1,
  date: '2025-12-25',
  priceType: 'fixed',
  value: 45.00,
  stock: 15,
  isActive: true
});
```

## 🔧 Personalizzazione

### Aggiungere Autenticazione

Decommentare in `openapi.yaml`:

```yaml
# In fondo al file
security:
  - bearerAuth: []

# Per endpoint specifici
paths:
  /products:
    post:
      security:
        - bearerAuth: []
```

### Aggiungere Nuovi Endpoints

```yaml
paths:
  /products/{productId}/bookings:
    get:
      tags:
        - Bookings
      summary: Lista prenotazioni
      operationId: getProductBookings
      parameters:
        - $ref: '#/components/parameters/ProductId'
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Booking'
```

### Aggiungere Nuovi Schemas

```yaml
components:
  schemas:
    Booking:
      type: object
      required:
        - id
        - productId
        - date
        - quantity
      properties:
        id:
          type: integer
        productId:
          type: integer
        date:
          type: string
          format: date
        quantity:
          type: integer
          minimum: 1
        customerName:
          type: string
```

## 📊 Integrazione CI/CD

### Validazione Automatica

```yaml
# .github/workflows/validate-openapi.yml
name: Validate OpenAPI

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Validate OpenAPI Spec
        uses: char0n/swagger-editor-validate@v1
        with:
          definition-file: docs/openapi.yaml
```

### Generazione Automatica Docs

```yaml
# .github/workflows/generate-docs.yml
name: Generate API Docs

on:
  push:
    branches: [main]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Generate ReDoc
        run: |
          npm install -g redoc-cli
          redoc-cli bundle docs/openapi.yaml -o public/api-docs.html
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

## 🌐 Hosting Online

### Swagger UI con GitHub Pages

1. Crea file `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "./openapi.yaml",
        dom_id: '#swagger-ui',
      })
    }
  </script>
</body>
</html>
```

2. Push su GitHub Pages
3. Accedi a: `https://username.github.io/repo/docs/`

### Stoplight

1. Vai su [stoplight.io](https://stoplight.io)
2. Import → From File → Upload `openapi.yaml`
3. Pubblica documentazione interattiva

### SwaggerHub

1. Vai su [swaggerhub.com](https://swaggerhub.com)
2. Create New API → Import from File
3. Upload `openapi.yaml`

## 🔍 Strumenti Utili

### Online
- [Swagger Editor](https://editor.swagger.io/) - Editor interattivo
- [Swagger Inspector](https://inspector.swagger.io/) - Test API
- [Stoplight Studio](https://stoplight.io/studio) - Design API

### CLI
- `swagger-cli` - Validazione e bundle
- `openapi-generator` - Generazione codice
- `redoc-cli` - Documentazione statica

### IDE Extensions
- **VS Code**: OpenAPI (Swagger) Editor
- **IntelliJ IDEA**: OpenAPI Specifications
- **Postman**: Import OpenAPI

## 📖 Risorse

- [OpenAPI Specification](https://swagger.io/specification/)
- [OpenAPI Generator](https://openapi-generator.tech/)
- [Swagger Tools](https://swagger.io/tools/)
- [ReDoc](https://github.com/Redocly/redoc)

## 🐛 Troubleshooting

### Errore: "Schema validation failed"
```bash
# Valida spec
swagger-cli validate docs/openapi.yaml

# Controlla sintassi YAML
yamllint docs/openapi.yaml
```

### Errore: "Cannot resolve reference"
Verifica che tutti i `$ref` puntino a componenti esistenti.

### Generazione Client Fallisce
```bash
# Debug mode
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g typescript-axios \
  -o output \
  --verbose
```

---

**Ultima modifica**: 30 Ottobre 2025
**Versione OpenAPI**: 3.0.3
**Versione Spec**: 1.0.0
