export type NotificationType = "Placement" | "Event" | "Result";

export interface Notification {
  ID: string;
  Type: NotificationType;
  message: string;
  created_at: string;
}
