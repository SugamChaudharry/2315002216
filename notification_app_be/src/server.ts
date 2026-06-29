import express, { Request, Response } from "express"
import dotenv from "dotenv"
import { existsSync } from "fs"
import { resolve } from "path"
import { requireToken } from "./auth.js"
import { requestLogger } from "./logger.js"
import {
  createNotification,
  deleteNotification,
  fetchNotifications,
  getNotificationById,
  getTopNotifications,
  markNotificationRead,
} from "./index.js"

const envCandidates = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "notification_app_be/.env"),
  resolve(process.cwd(), "dist/notification_app_be/.env"),
]

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath })
    break
  }
}

const port = Number(process.env.PORT ?? 3001)
const app = express()

app.use(express.json())

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", env: process.env.NODE_ENV ?? "development" })
})

app.use(requireToken)
app.use(requestLogger())

app.get("/notification/priority", async (req: Request, res: Response) => {
  const token = (req as any).token
  const n = Number(req.query.n) || 10
  try {
    const notifications = await fetchNotifications(token)
    const top = getTopNotifications(notifications, n)
    return res.json({ notifications: top, count: top.length })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
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
      error: error instanceof Error ? error.message : String(error),
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
      error: error instanceof Error ? error.message : String(error),
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
      error: error instanceof Error ? error.message : String(error),
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
      error: error instanceof Error ? error.message : String(error),
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
      error: error instanceof Error ? error.message : String(error),
    })
  }
})

app.listen(port, () => {
  console.log(`Notification service running at http://localhost:${port}`)
})
