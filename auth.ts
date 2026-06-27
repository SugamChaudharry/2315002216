import { Request } from "express";

const envAccessToken = process.env.ACCESS_TOKEN;

export function resolveToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return envAccessToken ?? null;
}
