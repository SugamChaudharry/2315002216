export type NotificationType = "Placement" | "Event" | "Result";

export interface Notification {
  id: string;
  student_id: string;
  type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: string;
}
