import express, { Request, Response } from "express";
import dotenv from "dotenv";
import {
  getTopInbox,
  fetchNotifications,
  getTopNotifications,
  getNotificationById,
  createNotification,
  markNotificationRead,
  deleteNotification,
} from "./notification_app_be/index.js";
import { buildDepotSchedule, fetchDepots, fetchTasks } from "./vehicle_maintenance_scheduler/index.js";

dotenv.config();

const app = express();
app.use(express.json());
const port = Number(process.env.PORT ?? 3000);
const envAccessToken = process.env.ACCESS_TOKEN;

function resolveToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return envAccessToken ?? null;
}

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", env: process.env.NODE_ENV ?? "development" });
});

app.get("/notifications", async (req: Request, res: Response) => {
  const token = resolveToken(req);
  if (!token) {
    return res.status(500).json({ error: "ACCESS_TOKEN is not configured in .env or Authorization header" });
  }

  try {
    const notifications = await fetchNotifications(token);
    return res.json({ notifications });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

app.post("/notifications", async (req: Request, res: Response) => {
  const token = resolveToken(req);
  if (!token) {
    return res.status(500).json({ error: "ACCESS_TOKEN is not configured in .env or Authorization header" });
  }

  try {
    const created = await createNotification(token, req.body);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/notifications/:id", async (req: Request, res: Response) => {
  const token = resolveToken(req);
  if (!token) {
    return res.status(500).json({ error: "ACCESS_TOKEN is not configured in .env or Authorization header" });
  }

  try {
    const notification = await getNotificationById(token, req.params.id);
    return res.json(notification);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

app.patch("/notifications/:id/read", async (req: Request, res: Response) => {
  const token = resolveToken(req);
  if (!token) {
    return res.status(500).json({ error: "ACCESS_TOKEN is not configured in .env or Authorization header" });
  }

  try {
    const updated = await markNotificationRead(token, req.params.id);
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

app.delete("/notifications/:id", async (req: Request, res: Response) => {
  const token = resolveToken(req);
  if (!token) {
    return res.status(500).json({ error: "ACCESS_TOKEN is not configured in .env or Authorization header" });
  }

  try {
    const deleted = await deleteNotification(token, req.params.id);
    return res.json(deleted);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/notifications/priority", async (req: Request, res: Response) => {
  const token = resolveToken(req);
  if (!token) {
    return res.status(500).json({ error: "ACCESS_TOKEN is not configured in .env or Authorization header" });
  }

  const n = Number(req.query.n) || 10;

  try {
    const notifications = await fetchNotifications(token);
    const topNotifications = getTopNotifications(notifications, n);
    return res.json({ notifications: topNotifications, count: topNotifications.length });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/top-inbox", async (req: Request, res: Response) => {
  const token = resolveToken(req);
  if (!token) {
    return res.status(500).json({ error: "ACCESS_TOKEN is not configured in .env or Authorization header" });
  }

  try {
    const notifications = await getTopInbox(token, 10);
    return res.json({ notifications });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/schedule", async (req: Request, res: Response) => {
  const token = resolveToken(req);
  if (!token) {
    return res.status(500).json({ error: "ACCESS_TOKEN is not configured in .env or Authorization header" });
  }

  try {
    const depots = await fetchDepots();
    const tasks = await fetchTasks();
    const schedules = await Promise.all(depots.map((depot) => buildDepotSchedule(depot, tasks)));
    return res.json({ schedules });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
