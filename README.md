# 2315002216

### Structure

- `logging_middleware/` — reusable logging helper for evaluation logging API.
- `notification_app_be/` — independent notification service with its own package and build config.
- `vehicle_scheduling_be/` — independent scheduling service with its own package and build config.
- `notification_system_design.md` — REST API, DB schema, caching, and bulk notification design.

### Run each service independently

Notification service:
```bash
cd notification_app_be
npm install
npm run dev
```

Scheduling service:
```bash
cd vehicle_scheduling_be
npm install
npm run dev
```

### Build

```bash
cd notification_app_be && npm run build
cd ../vehicle_scheduling_be && npm run build
```

### Local testing

1. Create or confirm `.env` contains:
```env
ACCESS_TOKEN=your_access_token_here
```
2. Start the notification service:
```bash
cd notification_app_be && npm run start
```
3. Open in Postman or browser:
- `GET http://localhost:3001/health`
4. Start the scheduling service:
```bash
cd vehicle_scheduling_be && npm run start
```

