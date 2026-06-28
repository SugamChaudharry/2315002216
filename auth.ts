import { Request, Response, NextFunction } from "express"

const envAccessToken = process.env.ACCESS_TOKEN

export function resolveToken(req: Request): string | null {
  const header = req.headers.authorization
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice(7).trim()
  }
  return envAccessToken ?? null
}

export function requireToken(req: Request, res: Response, next: NextFunction) {
  const token = resolveToken(req)
  
  if (!token) {
    res.status(401).json({ error: "Unauthorized — no token provided" })
    return
  }

  // attach token to request so route handlers can access it
  (req as any).token = token
  next()
}