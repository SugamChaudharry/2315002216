import type { Notification } from "../types/types.js";
import { MinHeap } from "./MinHeap.js";

const TYPE_WEIGHT: Record<Notification["Type"], number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function recencyScore(notification: Notification): number {
  const ageMs = Date.now() - new Date(notification.created_at).getTime();
  const ageHours = ageMs / 3_600_000;
  return 1 / (1 + Math.max(0, ageHours)); // +1 because if 0 in denominator it become 1
}

export function priorityScore(notification: Notification): number {
  return TYPE_WEIGHT[notification.Type] * 0.7 + recencyScore(notification) * 0.3;
}

export function getTopNotifications(
  notifications: Notification[],
  topN: number,
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