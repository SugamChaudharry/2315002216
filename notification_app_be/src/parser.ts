import { Notification, NotificationType } from "./types.js";

export function normalizeNotification(raw: Record<string, unknown>): Notification {
  return {
    id: String(raw["ID"] ?? raw["id"] ?? ""),
    student_id: String(raw["StudentID"] ?? raw["student_id"] ?? ""),
    type: (raw["Type"] ?? raw["type"] ?? "Event") as NotificationType,
    message: String(raw["Message"] ?? raw["message"] ?? ""),
    is_read: Boolean(raw["IsRead"] ?? raw["is_read"] ?? false),
    created_at: String(raw["Timestamp"] ?? raw["created_at"] ?? new Date().toISOString()),
  };
}
