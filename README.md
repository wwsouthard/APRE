# APRE — Agent Performance Reporting Engine

APRE is a full-stack reporting application for visualizing sales, agent performance, and customer feedback data. It consists of an Angular client and an Express API backed by MongoDB Atlas.

## Project structure

```
apre/
├── apre-client/    # Angular 18 frontend
└── apre-server/    # Express REST API
```

| Package | Stack | Default URL |
|---------|-------|-------------|
| `apre-client` | Angular 18, Chart.js, RxJS | http://localhost:4200 |
| `apre-server` | Express 4, MongoDB driver, bcryptjs | http://localhost:3000 |

## Features

- **Authentication** — Sign in with username and password; session stored in cookies; route guard protects authenticated pages
- **Dashboard** — Bar, line, pie, and doughnut charts plus an agent feedback table, all driven by API data
- **Reports**
  - **Sales** — Sales by region (chart and tabular views), monthly sales totals by calendar month
  - **Agent performance** — Call duration by date range
  - **Customer feedback** — Channel rating by month
- **User management** (admin role) — List, create, view, update, and delete users
- **Support & FAQ** — Static help content describing the data model and collections

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [npm](https://www.npmjs.com/)
- A MongoDB Atlas cluster with the `apre` database populated with sample data (collections: `users`, `agents`, `sales`, `agentPerformance`, `customerFeedback`)

Database connection settings live in `apre-server/src/utils/config.js`. Update the connection string there if you use your own cluster.

## Getting started

Install dependencies and start each app in a separate terminal.

### 1. API server

```bash
cd apre-server
npm install
npm start
```

For development with auto-restart:

```bash
npm run dev
```

The API listens on port **3000** by default (`PORT` environment variable overrides this).

Verify the server is running:

```bash
curl http://localhost:3000/api
```

### 2. Angular client

```bash
cd apre-client
npm install
npm start
```

Open http://localhost:4200 in your browser. The client is configured to call the API at `http://localhost:3000/api` (see `apre-client/src/environments/environment.development.ts`).

### 3. Sign in

Navigate to `/signin` and log in with a user from the `users` collection in MongoDB. Admin users can access User Management from the side menu.

## API overview

All routes are prefixed with `/api`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health / welcome message |
| `POST` | `/security/signin` | Authenticate user |
| `GET` | `/users` | List all users |
| `GET` | `/users/:id` | Get user by ID |
| `POST` | `/users` | Create user |
| `PUT` | `/users/:id` | Update user |
| `DELETE` | `/users/:id` | Delete user |
| `GET` | `/dashboard/sales-data` | Sales totals by region |
| `GET` | `/dashboard/agent-performance` | Average agent performance |
| `GET` | `/dashboard/customer-feedback` | Feedback averages by type |
| `GET` | `/dashboard/report-types` | Report type counts |
| `GET` | `/dashboard/agent-feedback` | Agent call duration and feedback |
| `GET` | `/reports/sales/regions` | Distinct sales regions |
| `GET` | `/reports/sales/regions/:region` | Sales for a region |
| `GET` | `/reports/sales/monthly-sales` | Monthly sales totals grouped by calendar month |
| `GET` | `/reports/agent-performance/call-duration-by-date-range` | Call duration report |
| `GET` | `/reports/customer-feedback/channel-rating-by-month` | Channel ratings by month |

## Client routes

| Path | Access | Description |
|------|--------|-------------|
| `/` | Authenticated | Dashboard |
| `/signin` | Public | Sign-in page |
| `/support` | Authenticated | Support page |
| `/faq` | Authenticated | FAQ |
| `/user-management/users` | Admin | User list |
| `/user-management/users/new` | Admin | Create user |
| `/user-management/users/:id` | Admin | User details |
| `/reports/sales/sales-by-region` | Authenticated | Sales by region chart |
| `/reports/sales/sales-by-region-tabular` | Authenticated | Sales by region table |
| `/reports/sales/monthly-sales` | Authenticated | Monthly sales table |
| `/reports/agent-performance/call-duration-by-date-range` | Authenticated | Call duration report |
| `/reports/customer-feedback/channel-rating-by-month` | Authenticated | Channel rating report |

## Week 2 Development Task (M-064)

| | |
|---|---|
| **Task ID** | `M-064` |
| **Task Name** | Monthly Sales Report |

### Feature description

The Monthly Sales Report aggregates sale amounts from the `sales` collection by calendar month and displays the results in a sortable table. The Express API returns an array of records, each containing a `month` number (1–12) and a `totalSales` sum. The Angular client loads this data on page init via `MonthlySalesService` and renders it using the shared `TableComponent`.

**Server files:** `apre-server/src/routes/reports/sales/index.js`, `apre-server/test/routes/reports/sales/index.spec.js`

**Client files:** `apre-client/src/app/reports/sales/monthly-sales/`

### API endpoint

```
GET /api/reports/sales/monthly-sales
```

**Example response:**

```json
[
  { "month": 1, "totalSales": 10000 },
  { "month": 2, "totalSales": 15000 }
]
```

Verify the endpoint manually:

```bash
curl http://localhost:3000/api/reports/sales/monthly-sales
```

### Run instructions

Start the API server and Angular client in separate terminals (see [Getting started](#getting-started) above), then sign in and navigate to **Sales Reports → Monthly Sales** in the side menu, or open http://localhost:4200/reports/sales/monthly-sales directly.

### Server test instructions

Run all server tests:

```bash
cd apre-server
npm test
```

Run only the sales report tests (includes M-064 monthly sales tests):

```bash
cd apre-server
npm test -- test/routes/reports/sales/index.spec.js
```

### Client test instructions

Run all client tests:

```bash
cd apre-client
npm test
```

Run only the monthly sales component tests:

```bash
cd apre-client
npx ng test --no-watch --browsers=Firefox --include='**/monthly-sales.component.spec.ts'
```

## Week 3 Major Development Task (M-085)

| | |
|---|---|
| **Task ID** | `M-085` |
| **Task Name** | Agent Performance Report API and Angular TableComponent display |
| **Assignment** | WEB-450 Assignment 3.3 |

### Feature description

The Agent Performance by Month report lets users select a calendar month and view average performance scores per agent in a sortable table. The Express API aggregates records from the `agentPerformance` collection for the selected month and returns a row array suitable for `TableComponent`. The Angular client submits the month filter, maps the response to table rows, and handles empty or failed responses with user-facing messages.

**Server files:** `apre-server/src/routes/reports/agent-performance/index.js`, `apre-server/test/routes/reports/agent-performance/index.spec.js`

**Client files:** `apre-client/src/app/reports/agent-performance/performance-by-month/`

### API endpoint

```
GET /api/reports/agent-performance/performance-by-month?month={1-12}
```

**Example response:**

```json
[
  { "agent": "John Doe", "averagePerformance": 80 },
  { "agent": "Mia Rodriguez", "averagePerformance": 70 }
]
```

### Run instructions

**Server:**

```bash
cd apre-server
npm start
```

**Client:**

```bash
cd apre-client
npm start
```

Sign in, then open **Agent Performance Reports → Agent Performance by Month** in the side menu, or go directly to http://localhost:4200/reports/agent-performance/performance-by-month.

### Server test instructions

```bash
cd apre-server
npm test -- test/routes/reports/agent-performance/index.spec.js
```

### Client test instructions

```bash
cd apre-client
npx ng test --no-watch --browsers=Firefox --include='**/performance-by-month.component.spec.ts'
```

## Testing

**Server** (Jest):

```bash
cd apre-server
npm test
```

**Client** (Karma / Jasmine):

```bash
cd apre-client
npm test
```

## Building for production

```bash
cd apre-client
npm run build
```

Production build artifacts are written to `apre-client/dist/`. Update `apre-client/src/environments/environment.ts` with your production API URL before deploying.

## Shared components

The Angular client includes reusable components under `apre-client/src/app/shared/`:

- `ChartComponent` — Chart.js wrapper used on the dashboard and reports
- `TableComponent` — Data table
- `CalendarComponent` — Date range selection
- `ConfirmDialogComponent` — Confirmation prompts

## Further reading

- `apre-client/README.md` — Angular CLI commands and client-specific notes
- `apre-client/docs/TODO.md` — Project task list and completion status
