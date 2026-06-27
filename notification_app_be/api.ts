import { Log } from "../logging_middleware/index.js";
import { normalizeNotification } from "./parser.js";
import { Notification } from "./types.js";
import { getTopNotifications } from "./priority.js";

const NOTIFICATION_BASE_URL = "http://4.224.186.213/evaluation-service/notifications";

function logApiError(action: string, accessToken: string, message: string): Promise<void> {
  return Log("backend", "error", "notification_app_be", `${action}: ${message}`, accessToken);
}

function logApiInfo(action: string, accessToken: string, message: string): Promise<void> {
  return Log("backend", "info", "notification_app_be", `${action}: ${message}`, accessToken);
}

export async function fetchNotifications(accessToken: string): Promise<Notification[]> {
  const response = await fetch(NOTIFICATION_BASE_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    await logApiError("fetchNotifications", accessToken, `Failed to fetch notifications: ${response.status}`);
    throw new Error(`Notification fetch failed with ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const arr: unknown[] = Array.isArray(payload)
    ? (payload as unknown[])
    : Array.isArray((payload as Record<string, unknown>).notifications)
    ? ((payload as Record<string, unknown>).notifications as unknown[])
    : (payload as unknown[]);

  return arr.map((raw) => normalizeNotification(raw as Record<string, unknown>));
}

export async function getNotificationById(accessToken: string, id: string): Promise<Notification> {
  const response = await fetch(`${NOTIFICATION_BASE_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    await logApiError("getNotificationById", accessToken, `Failed to fetch notification ${id}: ${response.status}`);
    throw new Error(`Notification fetch failed with ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();
  return normalizeNotification(raw as Record<string, unknown>);
}

export async function createNotification(
  accessToken: string,
  payload: Partial<Notification>,
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
    await logApiError("createNotification", accessToken, `Failed to create notification: ${response.status}`);
    throw new Error(`Notification create failed with ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();
  return normalizeNotification(raw as Record<string, unknown>);
}

export async function markNotificationRead(accessToken: string, id: string): Promise<Notification> {
  const response = await fetch(`${NOTIFICATION_BASE_URL}/${id}/read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 404) {
    const fallback = await fetch(`${NOTIFICATION_BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_read: true }),
    });

    if (!fallback.ok) {
      await logApiError("markNotificationRead", accessToken, `Failed to mark read via fallback for ${id}: ${fallback.status}`);
      throw new Error(`Notification read update failed with ${fallback.status} ${fallback.statusText}`);
    }

    const raw = await fallback.json();
    return normalizeNotification(raw as Record<string, unknown>);
  }

  if (!response.ok) {
    await logApiError("markNotificationRead", accessToken, `Failed to mark read: ${response.status}`);
    throw new Error(`Notification read update failed with ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();
  return normalizeNotification(raw as Record<string, unknown>);
}

export async function deleteNotification(accessToken: string, id: string): Promise<{ message: string }> {
  const response = await fetch(`${NOTIFICATION_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    await logApiError("deleteNotification", accessToken, `Failed to delete notification: ${response.status}`);
    throw new Error(`Notification delete failed with ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  try {
    return JSON.parse(text) as { message: string };
  } catch (_err) {
    return { message: "Notification deleted successfully" };
  }
}

export async function getTopInbox(accessToken: string, topN = 10): Promise<Notification[]> {
  const notifications = await fetchNotifications(accessToken);
  const topNotifications = getTopNotifications(notifications, topN);

  await logApiInfo("getTopInbox", accessToken, `Computed top ${topNotifications.length} notifications from ${notifications.length} fetched items.`);

  return topNotifications;
}
