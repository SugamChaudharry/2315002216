export interface LogEntry {
  stack: string;
  level: string;
  package: string;
  message: string;
  timestamp: string;
}

export async function Log(
  stack: string,
  level: string,
  pkg: string,
  message: string,
  accessToken: string
): Promise<void> {
  const payload: LogEntry = {
    stack,
    level,
    package: pkg,
    message,
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch("http://4.224.186.213/evaluation-service/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (_err) {
    // Swallow logging errors to avoid impacting application flow
  }
}
