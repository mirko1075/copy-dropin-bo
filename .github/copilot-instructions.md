This repository is an Angular 20+ backoffice application for managing products/services (catalog, categories, pricing, availability). The goal of these instructions is to help AI coding agents be productive quickly by highlighting the project's architecture, conventions, build/test workflows, and common integration points.

Key facts
- Angular 20+ (standalone components) with TypeScript 5.x and Angular Material.
- Local dev: use the Angular CLI scripts defined in `package.json` (see "scripts").
- State uses Angular Signals in core services (e.g. `src/app/core/services/in-memory-data.service.ts`).

Quick commands
- Install dependencies: `npm install`
- Start dev server: `npm start` (invokes `ng serve`)
- Build: `npm run build` (invokes `ng build`)
- Watch build: `npm run watch` (invokes `ng build --watch --configuration development`)
- Run tests: `npm test` (Karma + Jasmine)

Big-picture architecture (what matters for code changes)
- src/app/core: singletons used across the app: services, HTTP interceptors, route guards, and models.
  - `core/services` contains business/service layers. Example: `in-memory-data.service.ts` provides a mock backend, product/category CRUD, and calendar/daily-price logic.
  - `core/interceptors` holds auth and tenant-context interceptors that attach headers and manage multi-tenancy.
  - `core/guards` includes `auth.guard.ts` and `tenant-selection.guard.ts` used in routing.
- src/app/features: feature modules (lazy-loaded) for domain areas (products, categories, pricing, payment-config, settings). Match routes in `app.routes.ts`.
- src/app/layout: top-level layout components (header, sidebar, main-layout) used by most screens.

Project-specific patterns and conventions
- Standalone components: many components are implemented as Angular standalone components — prefer adding `standalone: true` and local imports instead of module-level changes.
- Signals for local state: services use `signal<T>` heavily (see `in-memory-data.service.ts`). When mutating state, use `.update()` and expose read-only with `.asReadonly()`.
- Mock backend & calendar generation: `InMemoryDataService.createProductCalendar(...)` auto-generates `DailyPrice` entries from `availabilityStartDate`/`availabilityEndDate`. When modifying pricing or availability, ensure associated daily prices are created/updated/removed.
- API boundaries: real backend calls (when integrated) should live in `core/services/multi-tenancy-api.service.ts` or feature-level `*-api.service.ts` files. Interceptors (auth + tenant) handle headers and token attachment globally.
- Translations: models include `translations` objects with keys for `it,en,de,fr,es`. Keep naming and locale keys consistent.

Common integration points and gotchas
- Multi-tenancy: tenant context is injected via `tenant-context.interceptor.ts` and `tenant-context.service.ts`. Changing how tenant is passed must update both service and interceptor.
- Auth: `auth.interceptor.ts` attaches auth tokens. Tests or mocks should stub this pattern.
- Calendar & pricing: daily price overrides (PriceType.Fixed, PriceType.Percentage, PriceType.Base) are stored in `core/services/in-memory-data.service.ts` in `dailyPricesSignal`. Editing price logic should keep `calculatePrice`, `setPriceOverride`, and removal logic consistent.
- Images: many components use remote Unsplash image URLs in mock data; assume images are external and not stored in repo.

Testing and linting
- Unit tests use Karma + Jasmine. Tests live next to components (e.g. `app.spec.ts` exist). Run `npm test`.
- There is no project-level linter configured (ESLint), but Prettier settings exist in `package.json`.

When making changes (short checklist)
1. Update or add unit tests for new behavior (Karma + Jasmine). If adding services, include a small test that exercises signals and observable outputs.
2. For UI changes, prefer standalone components and local providers. Use Angular Material components already present.
3. If changing API surface (service method signature), update all callers across `features` and `core`. Use repo search for function/class names.
4. Maintain translation keys and models. Example models are in `src/app/core/models`.

Files to look at first for common tasks
- app.routes.ts — routing and lazy-loaded feature modules
- src/app/core/services/in-memory-data.service.ts — mock backend, calendar & pricing, signals
- src/app/core/interceptors/* — auth & tenant interceptors
- src/app/core/services/*-api.service.ts — where real API calls should live
- src/app/layout/* — layout components used by pages

If uncertain, ask the human: clarify expected backend contract (endpoints/payloads), tenancy model, or required locales. When changing calendar/pricing logic, request sample data ranges to validate generated daily-price entries.

If you update this file, keep it short and concrete. After changes, prompt the human for test data and acceptance criteria for pricing/availability changes.
