import { Log } from "../logging_middleware/index.js";

export type NotificationType = "Placement" | "Event" | "Result";

export interface Notification {
  id: string;
  student_id: string;
  type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: string;
}

const TYPE_WEIGHT: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function recencyScore(notification: Notification): number {
  const ageMs = Date.now() - new Date(notification.created_at).getTime();
  const ageHours = ageMs / 3_600_000;
  return 1 / (1 + Math.max(0, ageHours));
}

export function priorityScore(notification: Notification): number {
  return TYPE_WEIGHT[notification.type] * 0.7 + recencyScore(notification) * 0.3;
}

class MinHeap<T> {
  private data: T[] = [];
  constructor(private comparator: (a: T, b: T) => number) {}

  size(): number {
    return this.data.length;
  }

  peek(): T | undefined {
    return this.data[0];
  }

  push(item: T): void {
    this.data.push(item);
    this.bubbleUp();
  }

  pop(): T | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.bubbleDown();
    }
    return top;
  }

  private bubbleUp(): void {
    let index = this.data.length - 1;
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.comparator(this.data[index], this.data[parentIndex]) >= 0) break;
      [this.data[parentIndex], this.data[index]] = [this.data[index], this.data[parentIndex]];
      index = parentIndex;
    }
  }

  private bubbleDown(): void {
    let index = 0;
    const length = this.data.length;
    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let smallest = index;

      if (left < length && this.comparator(this.data[left], this.data[smallest]) < 0) {
        smallest = left;
      }
      if (right < length && this.comparator(this.data[right], this.data[smallest]) < 0) {
        smallest = right;
      }
      if (smallest === index) break;
      [this.data[index], this.data[smallest]] = [this.data[smallest], this.data[index]];
      index = smallest;
    }
  }
}

export function getTopNotifications(
  notifications: Notification[],
  topN: number
): Notification[] {
  const heap = new MinHeap<{ score: number; notification: Notification }>((a, b) => a.score - b.score);

  for (const notification of notifications) {
    const score = priorityScore(notification);
    const entry = { score, notification };

    if (heap.size() < topN) {
      heap.push(entry);
      continue;
    }

    const lowest = heap.peek();
    if (lowest && entry.score > lowest.score) {
      heap.pop();
      heap.push(entry);
    }
  }

  const result: Notification[] = [];
  while (heap.size() > 0) {
    const item = heap.pop();
    if (item) result.push(item.notification);
  }

  return result.reverse();
}

export async function fetchNotifications(accessToken: string): Promise<Notification[]> {
  const response = await fetch("http://4.224.186.213/evaluation-service/notifications", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    await Log(
      "fetchNotifications",
      "error",
      "notification_app_be",
      `Failed to fetch notifications: ${response.status}`,
      accessToken
    );
    throw new Error(`Notification fetch failed with ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  return payload.notifications as Notification[];
}

export async function getNotificationById(accessToken: string, id: string): Promise<Notification> {
  const response = await fetch(`http://4.224.186.213/evaluation-service/notifications/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    await Log(
      "getNotificationById",
      "error",
      "notification_app_be",
      `Failed to fetch notification ${id}: ${response.status}`,
      accessToken
    );
    throw new Error(`Notification fetch failed with ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<Notification>;
}

export async function createNotification(accessToken: string, payload: Partial<Notification>): Promise<Notification> {
  const response = await fetch("http://4.224.186.213/evaluation-service/notifications", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await Log(
      "createNotification",
      "error",
      "notification_app_be",
      `Failed to create notification: ${response.status}`,
      accessToken
    );
    throw new Error(`Notification create failed with ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<Notification>;
}

export async function markNotificationRead(accessToken: string, id: string): Promise<Notification> {
  const response = await fetch(`http://4.224.186.213/evaluation-service/notifications/${id}/read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    await Log(
      "markNotificationRead",
      "error",
      "notification_app_be",
      `Failed to mark read: ${response.status}`,
      accessToken
    );
    throw new Error(`Notification read update failed with ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<Notification>;
}

export async function deleteNotification(accessToken: string, id: string): Promise<{ message: string }> {
  const response = await fetch(`http://4.224.186.213/evaluation-service/notifications/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    await Log(
      "deleteNotification",
      "error",
      "notification_app_be",
      `Failed to delete notification: ${response.status}`,
      accessToken
    );
    throw new Error(`Notification delete failed with ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getTopInbox(accessToken: string, topN = 10): Promise<Notification[]> {
  const notifications = await fetchNotifications(accessToken);
  const topNotifications = getTopNotifications(notifications, topN);

  await Log(
    "getTopInbox",
    "info",
    "notification_app_be",
    `Computed top ${topNotifications.length} notifications from ${notifications.length} fetched items.`,
    accessToken
  );

  return topNotifications;
}
