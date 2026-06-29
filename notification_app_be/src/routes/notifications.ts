import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { fetchNotifications, getTopNotifications } from '../services/notificationService.js'
import { Log } from 'logging_middleware'

const router = Router()

// GET /notifications — all notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    Log('backend', 'info', 'route', 'GET /notifications called')
    const notifications = await fetchNotifications()
    res.json({ notifications })
  } catch (err) {
    Log('backend', 'error', 'route', `GET /notifications failed: ${err}`)
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

// GET /notifications/priority?n=10 — Stage 6: top N by priority
router.get('/priority', authMiddleware, async (req, res) => {
  try {
    const n = parseInt(req.query.n as string) || 10
    Log('backend', 'info', 'route', `GET /notifications/priority?n=${n} called`)
    const notifications = await fetchNotifications()
    const top = getTopNotifications(notifications, n)
    res.json({ notifications: top, count: top.length })
  } catch (err) {
    Log('backend', 'error', 'route', `GET /notifications/priority failed: ${err}`)
    res.status(500).json({ error: 'Failed to get priority notifications' })
  }
})

export default router