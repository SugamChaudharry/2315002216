import express, { Request, Response } from "express";
import notificationsRouter from "./routes/notifications.js";
import scheduleRouter from "./routes/schedule.js";
import { getTopInbox } from "./notification_app_be/index.js";
import { resolveToken } from "./auth.js";

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", env: process.env.NODE_ENV ?? "development" });
  });

  app.get("/top-inbox", async (req: Request, res: Response) => {
    const token = resolveToken(req);
    if (!token) {
      return res.status(500).json({
        error: "ACCESS_TOKEN is not configured in .env or Authorization header",
      });
    }

    try {
      const notifications = await getTopInbox(token, 10);
      return res.json({ notifications });
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.use("/notifications", notificationsRouter);
  app.use("/schedule", scheduleRouter);

  return app;
}
