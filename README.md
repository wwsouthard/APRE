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
  - **Sales** — Sales by region (chart and tabular views)
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
| `/reports/agent-performance/call-duration-by-date-range` | Authenticated | Call duration report |
| `/reports/customer-feedback/channel-rating-by-month` | Authenticated | Channel rating report |

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
