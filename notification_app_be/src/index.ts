import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Log } from 'logging_middleware'
import notificationRoutes from './routes/notifications.js'

dotenv.config({ path: '../.env' })

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/notifications', notificationRoutes)

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  Log('backend', 'fatal', 'handler', `Unhandled error: ${err.message}`)
  res.status(500).json({ error: err.message })
})

app.listen(PORT, () => {
  Log('backend', 'info', 'service', `Server started on port ${PORT}`)
  console.log(`Server running on http://localhost:${PORT}`)
})