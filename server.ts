import express, { Request, Response } from "express"
import dotenv from "dotenv"
import { requireToken } from "./auth.js"
import { requestLogger } from "./logger.js"
import {
  createNotification, deleteNotification, fetchNotifications,
  getNotificationById, getTopNotifications, markNotificationRead
} from "./notification_app_be/index.js"
import { fetchDepots, fetchTasks } from "./vehicle_scheduling_be/api.js"
import { buildDepotSchedule } from "./vehicle_scheduling_be/scheduler.js"

dotenv.config()

const port = Number(process.env.PORT ?? 3000)
const app = express()

app.use(express.json())

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", env: process.env.NODE_ENV ?? "development" })
})

app.use(requireToken)

app.use(requestLogger())

// ─── Schedule ────────────────────────────────────────────

app.get("/schedule", async (req: Request, res: Response) => {
  const token = (req as any).token
  try {
    const depots = await fetchDepots(token)
    const tasks  = await fetchTasks(token)
    const schedules = await Promise.all(
      depots.map(depot => buildDepotSchedule(depot, tasks))
    )
    return res.json({ schedules })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

// ─── Notifications ───────────────────────────────────────

app.get("/notification/priority", async (req: Request, res: Response) => {
  const token = (req as any).token
  const n = Number(req.query.n) || 10
  try {
    const notifications = await fetchNotifications(token)
    const top = getTopNotifications(notifications, n)
    return res.json({ notifications: top, count: top.length })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

app.get("/notification", async (req: Request, res: Response) => {
  const token = (req as any).token
  try {
    const notifications = await fetchNotifications(token)
    return res.json({ notifications })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

app.post("/notification", async (req: Request, res: Response) => {
  const token = (req as any).token
  try {
    const created = await createNotification(token, req.body)
    return res.status(201).json(created)
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

app.get("/notification/:id", async (req: Request, res: Response) => {
  const token = (req as any).token
  try {
    const notification = await getNotificationById(token, req.params.id)
    return res.json(notification)
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

app.patch("/notification/:id/read", async (req: Request, res: Response) => {
  const token = (req as any).token
  try {
    const updated = await markNotificationRead(token, req.params.id)
    return res.json(updated)
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

app.delete("/notification/:id", async (req: Request, res: Response) => {
  const token = (req as any).token
  try {
    const deleted = await deleteNotification(token, req.params.id)
    return res.json(deleted)
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
