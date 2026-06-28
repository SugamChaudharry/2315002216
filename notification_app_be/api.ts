import { Log } from "../logging_middleware/index.js";
import { normalizeNotification } from "./parser.js";
import { Notification } from "./types.js";
import { getTopNotifications } from "./priority.js";

const NOTIFICATION_BASE_URL =
  "http://4.224.186.213/evaluation-service/notifications";

function logApiError(
  action: string,
  accessToken: string,
  message: string
): Promise<void> {
  return Log(
    "backend",
    "error",
    "notification_app_be",
    `${action}: ${message}`,
    accessToken
  );
}

function logApiInfo(
  action: string,
  accessToken: string,
  message: string
): Promise<void> {
  return Log(
    "backend",
    "info",
    "notification_app_be",
    `${action}: ${message}`,
    accessToken
  );
}

export async function fetchNotifications(
  accessToken: string
): Promise<Notification[]> {
  const response = await fetch(NOTIFICATION_BASE_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    await logApiError(
      "fetchNotifications",
      accessToken,
      `Failed to fetch notifications: ${response.status}`
    );
    throw new Error(
      `Notification fetch failed with ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as {
    notifications: Record<string, unknown>[];
  };

  return data.notifications.map((raw) => normalizeNotification(raw));
}

export async function getNotificationById(
  accessToken: string,
  id: string
): Promise<Notification> {
  const response = await fetch(`${NOTIFICATION_BASE_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    await logApiError(
      "getNotificationById",
      accessToken,
      `Failed to fetch notification ${id}: ${response.status}`
    );
    throw new Error(
      `Notification fetch failed with ${response.status} ${response.statusText}`
    );
  }

  const raw = (await response.json()) as Record<string, unknown>;
  return normalizeNotification(raw);
}

export async function createNotification(
  accessToken: string,
  payload: Partial<Notification>
): Promise<Notification> {
  const response = await fetch(NOTIFICATION_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await logApiError(
      "createNotification",
      accessToken,
      `Failed to create notification: ${response.status}`
    );
    throw new Error(
      `Notification create failed with ${response.status} ${response.statusText}`
    );
  }

  const raw = (await response.json()) as Record<string, unknown>;
  return normalizeNotification(raw);
}

export async function markNotificationRead(
  accessToken: string,
  id: string
): Promise<Notification> {
  const response = await fetch(`${NOTIFICATION_BASE_URL}/${id}/read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    await logApiError(
      "markNotificationRead",
      accessToken,
      `Failed to mark read: ${response.status}`
    );
    throw new Error(
      `Notification read update failed with ${response.status} ${response.statusText}`
    );
  }

  const raw = (await response.json()) as Record<string, unknown>;
  return normalizeNotification(raw);
}

export async function deleteNotification(
  accessToken: string,
  id: string
): Promise<{ message: string }> {
  const response = await fetch(`${NOTIFICATION_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    await logApiError(
      "deleteNotification",
      accessToken,
      `Failed to delete notification: ${response.status}`
    );
    throw new Error(
      `Notification delete failed with ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as { message: string };
}

export async function getTopInbox(
  accessToken: string,
  topN = 10
): Promise<Notification[]> {
  const notifications = await fetchNotifications(accessToken);
  const topNotifications = getTopNotifications(notifications, topN);

  await logApiInfo(
    "getTopInbox",
    accessToken,
    `Computed top ${topNotifications.length} notifications from ${notifications.length} fetched items.`
  );

  return topNotifications;
}