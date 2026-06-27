import { Request } from "express";
import { Log } from "./logging_middleware/index.js";

export async function logRequest(req: Request, accessToken: string | null): Promise<void> {
  const message = `${req.method} ${req.originalUrl}`;

  if (accessToken) {
    await Log("backend", "info", "server", `Request: ${message}`, accessToken);
    return;
  }

  console.info(`[server] Request: ${message}`);
}

export async function logRouteError(
  pkg: string,
  error: unknown,
  accessToken: string | null,
): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);

  if (accessToken) {
    await Log("backend", "error", pkg, `Error: ${message}`, accessToken);
    return;
  }

  console.error(`[${pkg}] Error: ${message}`);
}
