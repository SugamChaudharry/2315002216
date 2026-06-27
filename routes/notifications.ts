import { Router, Request, Response } from "express";
import {
  fetchNotifications,
  createNotification,
  getNotificationById,
  markNotificationRead,
  deleteNotification,
  getTopNotifications,
} from "../notification_app_be/index.js";
import { resolveToken } from "../auth.js";
import { logRequest, logRouteError } from "../logger.js";

const router = Router();

function getBearerToken(req: Request, res: Response): string | null {
  const token = resolveToken(req);
  if (!token) {
    res.status(500).json({
      error: "ACCESS_TOKEN is not configured in .env or Authorization header",
    });
    return null;
  }
  return token;
}

router.get("/", async (req: Request, res: Response) => {
  const token = getBearerToken(req, res);
  await logRequest(req, token);
  if (!token) return;

  try {
    const notifications = await fetchNotifications(token);
    return res.json({ notifications });
  } catch (error) {
    await logRouteError("notification_app_be", error, token);
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const token = getBearerToken(req, res);
  await logRequest(req, token);
  if (!token) return;

  try {
    const created = await createNotification(token, req.body);
    return res.status(201).json(created);
  } catch (error) {
    await logRouteError("notification_app_be", error, token);
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.get("/priority", async (req: Request, res: Response) => {
  const token = getBearerToken(req, res);
  await logRequest(req, token);
  if (!token) return;

  const n = Number(req.query.n) || 10;

  try {
    const notifications = await fetchNotifications(token);
    const topNotifications = getTopNotifications(notifications, n);
    return res.json({ notifications: topNotifications, count: topNotifications.length });
  } catch (error) {
    await logRouteError("notification_app_be", error, token);
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const token = getBearerToken(req, res);
  await logRequest(req, token);
  if (!token) return;

  try {
    const notification = await getNotificationById(token, req.params.id);
    return res.json(notification);
  } catch (error) {
    await logRouteError("notification_app_be", error, token);
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.patch("/:id/read", async (req: Request, res: Response) => {
  const token = getBearerToken(req, res);
  await logRequest(req, token);
  if (!token) return;

  try {
    const updated = await markNotificationRead(token, req.params.id);
    return res.json(updated);
  } catch (error) {
    await logRouteError("notification_app_be", error, token);
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const token = getBearerToken(req, res);
  await logRequest(req, token);
  if (!token) return;

  try {
    const deleted = await deleteNotification(token, req.params.id);
    return res.json(deleted);
  } catch (error) {
    await logRouteError("notification_app_be", error, token);
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

export default router;
