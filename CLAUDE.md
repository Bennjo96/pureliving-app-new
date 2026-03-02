# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PureLiving is a full-stack on-demand home/office cleaning marketplace. It connects customers with professional cleaners using an automated scoring algorithm, and is managed by admins. The repo has two independent apps:

- `backend/` — Node.js/Express REST API
- `frontend/` — React SPA

---

## Commands

### Backend (`cd backend/`)
```bash
npm run dev      # Development with nodemon (port 5002 by default)
npm start        # Production
```
Environment variables are loaded from `backend/.env`. No tests are configured yet.

### Frontend (`cd frontend/`)
```bash
npm start        # Dev server on port 3000
npm run build    # Production build
npm test         # React Testing Library (react-scripts test)
```
The frontend expects `REACT_APP_API_URL` pointing to the backend (defaults to `http://localhost:5001/api` — note: backend runs on 5002, so `.env` should be set accordingly).

---

## Architecture

### Backend structure
```
backend/src/
  server.js          — entry point, starts Express + MongoDB
  app.js             — mounts all routes, CORS, error handler
  config/db.js       — Mongoose connection
  models/            — 11 Mongoose models (see below)
  controllers/       — thin request handlers, delegate to services/models
  routes/            — Express routers, map to /api/* prefixes
  services/
    assignmentService.js  — cleaner scoring algorithm (critical)
    paymentService.js
    emailService.js
  middlewares/
    authMiddleware.js      — JWT protect() middleware
    adminMiddleware.js
    cleanerAuthMiddleware.js
    errorHandler.js        — global error handler
  utils/
    geoUtils.js            — Haversine distance calculation
    validators.js
    sendEmail.js
```

### Frontend structure
```
frontend/src/
  App.js                    — router + all context providers wrapped here
  api/api.js                — single Axios instance, all service calls, JWT interceptor
  contexts/                 — AuthContext, BookingContext, NotificationContext, SettingsContext, GoogleMapsContext
  components/
    admin/                  — admin dashboard pages
    cleaner/                — cleaner portal pages
    customer/               — customer portal pages
    booking/                — sub-components for the booking flow
    common/                 — shared UI components
    messages/               — messaging UI
  routes/
    ProtectedRoute.js       — role-based route guard (inline in App.js too)
    AdminRoutes.js
  hooks/                    — custom React hooks
  data/services.js          — static service definitions used in booking flow
  i18n.js                   — i18next setup (EN/FR/ES/DE/AR)
```

### Data models
| Model | Key fields / notes |
|---|---|
| **User** | `roles: ['customer','cleaner','admin']` — single model for all roles. Cleaners and customers are differentiated by the `roles` array, not separate collections. |
| **Booking** | `status` lifecycle: `pending → paid → assigned/needs_assignment → confirmed → in-progress → completed`. `cleaner` field is null until assigned. |
| **Payment** | Separate from booking's embedded `payment` sub-doc; tracks transactions. |
| **ServiceArea** | Postal-code-based zones with `coordinates`, `serviceRadius`, and pricing tiers. Required for cleaner assignment. |
| **SystemSetting** | Admin-configurable weights for the assignment algorithm, auto-assignment toggle, and pricing. |
| **Invitation** | Expiring tokens for admin/cleaner onboarding. |

---

## Key Patterns

### Authentication
- **Two separate token keys**: `authToken` (users/cleaners) and `adminAuthToken` (admins), stored in `localStorage` (remember-me) or `sessionStorage`.
- `api/api.js` Axios interceptor automatically attaches the token from storage on every request, prefers `adminAuthToken` over `authToken`.
- On 401, the interceptor queues concurrent requests and calls `/api/auth/refresh-token` (or `/api/auth/admin/refresh-token` for admins) once, then replays them.
- `AuthContext` exposes `{ user, activeRole, loading, isAuthenticated, login, logout }`. The `activeRole` (not `user.roles`) is what drives frontend routing guards.

### Booking context / multi-step flow
`BookingContext` (`contexts/BookingContext.js`) accumulates state across the multi-step booking flow:
1. `service` — selected service type
2. `customizations` — extra rooms, add-ons, priorities, pet/child flags
3. `location` — validated postal code + coordinates
4. `dateTime` — date, time slot
5. `customerDetails` — name, phone, address
6. Payment is processed on the backend at `POST /payments/process/:bookingId`, which triggers `assignmentService.findBestCleanerForBooking()` immediately after payment succeeds.

### Cleaner assignment algorithm (`services/assignmentService.js`)
The algorithm runs server-side after successful payment:
1. `getQualifiedCleaners()` — filters by service type, weekly availability schedule, no overlapping bookings, and postal code / geo-distance.
2. `scoreCleaners()` — weighted score (weights from `SystemSetting`): proximity (30%), rating (25%), availability optimality (20%), workload balance (15%), customer preference (10%).
3. `applyBusinessRules()` — boosts new cleaners (<5 jobs), boosts high-rated cleaners for premium services, matches special skill notes (pets, allergies).
4. Highest `totalScore` wins; if no cleaner found, booking status becomes `needs_assignment` for manual admin override.

### Route prefixes
```
/api/auth        /api/users       /api/admin
/api/cleaner     /api/bookings    /api/payments
/api/services    /api/reviews     /api/notifications
/api/messages    /api/geo
```

### All API calls go through `frontend/src/api/api.js`
Named exports for each domain: `authService`, `userService`, `adminService`, `bookingService`, `cleanerService`, `notificationService`, `paymentService`, `messageService`, `settingsService`. Components should import from this file, not call axios directly.

### Role-based routing
`App.js` defines a `ProtectedRoute` component that reads `activeRole` from `AuthContext`. Role constants: `admin`, `cleaner`, `customer`/`client`. Layouts (`AdminLayout`, `CleanerLayout`, `CustomerLayout`) are nested route wrappers with their own nav/sidebar.

### Error handling
Backend uses a centralized `errorHandler` middleware. Controllers should call `next(err)` with an error that has `statusCode` and `status` ('fail' | 'error'). Frontend uses `handleApiError` utility from `api/api.js`.
