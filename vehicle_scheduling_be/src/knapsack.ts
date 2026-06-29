import { Task } from "./types.js";

export function knapsack(
  tasks: Task[],
  capacityHours: number,
): { selectedTasks: Task[]; totalImpact: number } {

  const capacity = Math.floor(capacityHours);
  if (!Number.isFinite(capacity) || capacity < 0) {
    throw new Error(`Invalid capacityHours value: ${capacityHours}`);
  }

  const n = tasks.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    Array(capacity + 1).fill(0),
  );

  for (let i = 1; i <= n; i++) {
    const task = tasks[i - 1]; // wt
    const duration = Math.floor(task.durationHours); // val
    if (!Number.isFinite(duration) || duration < 0) {
      throw new Error(
        `Invalid task durationHours value: ${task.durationHours} for task ${task.id}`,
      );
    }
    const weight = Math.min(capacity, duration);
    for (let w = 0; w <= capacity; w++) {
      if (weight <= w) {
        dp[i][w] = Math.max(
          dp[i - 1][w],
          dp[i - 1][w - weight] + task.impactScore,
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  const selectedTasks: Task[] = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      const task = tasks[i - 1];
      const duration = Math.floor(task.durationHours);
      const weight = Math.min(capacity, duration);
      selectedTasks.push(task);
      w -= weight;
    }
  }

  return {
    selectedTasks: selectedTasks.reverse(),
    totalImpact: dp[n][capacity],
  };
}
