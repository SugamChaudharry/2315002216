# 2315002216


### Structure

- `logging_middleware/` — reusable logging helper for evaluation logging API.
- `notification_app_be/` — priority notification inbox logic and fetcher.
- `vehicle_maintenance_scheduler/` — knapsack-based vehicle maintenance scheduler.
- `notification_system_design.md` — REST API, DB schema, caching, and bulk notification design.

### Run

- `npm install`
- `npm run build`
- `npm run start`
- `npm run top-inbox -- <access_token>`
- `npm run schedule`

> `npm run start` now compiles the project and runs the generated `dist/server.js`.

### Local testing

1. Create or confirm `.env` contains:
```env
ACCESS_TOKEN=your_access_token_here
```
2. Start server:
```bash
npm run start
```
3. Open in Postman or browser:
- `GET http://localhost:3000/health`
- `GET http://localhost:3000/top-inbox`
- `GET http://localhost:3000/schedule`

