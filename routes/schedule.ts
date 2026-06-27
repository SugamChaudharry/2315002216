import { Router, Request, Response } from "express";
import { fetchDepots, fetchTasks, buildDepotSchedule } from "../vehicle_scheduling_be/index.js";
import { resolveToken } from "../auth.js";

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
  if (!token) return;

  try {
    const depots = await fetchDepots(token);
    const tasks = await fetchTasks(token);
    const schedules = await Promise.all(depots.map((depot) => buildDepotSchedule(depot, tasks)));
    return res.json({ schedules });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

export default router;
