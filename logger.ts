import { Request, Response, NextFunction } from "express"
import { Log } from "./logging_middleware/index.js"

export function requestLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = (req as any).token ?? ""
    const start = Date.now()

    Log("backend", "info", "server",
      `→ ${req.method} ${req.originalUrl}`,
      token
    )

    res.on("finish", () => {
      const duration = Date.now() - start
      const level = res.statusCode >= 500 ? "error"
                  : res.statusCode >= 400 ? "warn"
                  : "info"

      Log("backend", level, "server",
        `← ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
        token
      )
    })

    next()
  }
}