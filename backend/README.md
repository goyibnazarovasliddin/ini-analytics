# INI Analytics Backend

NestJS backend for the INI Analytics Dashboard (Uzbekistan CPI Data).

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- npm or pnpm

## Setup

1.  **Clone & Install**
    ```bash
    cd backend
    npm install
    ```

2.  **Database Configuration**
    - Ensure PostgreSQL is running and you have a database created (e.g., `ini_analytics`).
    - Copy `.env.example` to `.env`:
      ```bash
      cp .env.example .env
      ```
    - Update `DATABASE_URL` in `.env` with your credentials:
      ```
      DATABASE_URL="postgresql://user:password@localhost:5432/ini_analytics?schema=public"
      ```

3.  **Run Migrations**
    Apply the database schema:
    ```bash
    npm run prisma:migrate
    ```

4.  **Start Server**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:8000`.

## Ingesting Data

Before the dashboard works, you need to load the initial data from the StateStat Excel source. 

**Using cURL:**
```bash
curl -X POST http://localhost:8000/api/v1/admin/refresh \
  -H "X-ADMIN-KEY: super-secret-admin-key"
```
*(Check `.env` for the actual `ADMIN_KEY`)*

## API Endpoints

- **Meta Source**: `GET /api/v1/meta/source`
- **Classifiers**: `GET /api/v1/classifiers?q=...&lang=uz&limit=100`
- **KPIs**: `GET /api/v1/analytics/kpi?start=2024-01-01&end=2024-12-01`
- **Series**: `GET /api/v1/analytics/series?codes=1,1.01&start=...&end=...&metric=mom|yoy|cumulative`
- **Table**: `GET /api/v1/analytics/table?start=...&end=...&metric=mom`
- **Export**: `GET /api/v1/export?format=xlsx&...`

## Troubleshooting

- **Database Errors**: Ensure the Postgres service is running and the credentials in `.env` are correct.
- **Ingestion Errors**: Check the console logs. The `SOURCE_URL` in `.env` must be accessible.
