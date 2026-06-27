import { knapsack } from "./knapsack";
import { Depot, SelectedSchedule, Task } from "./types";

export async function buildDepotSchedule(
  depot: Depot,
  tasks: Task[],
): Promise<SelectedSchedule> {
  if (!Number.isFinite(depot.capacityHours) || depot.capacityHours < 0) {
    throw new Error(
      `Invalid depot capacityHours value: ${String(depot.capacityHours)}`,
    );
  }

  const selection = knapsack(tasks, depot.capacityHours);
  const totalDuration = selection.selectedTasks.reduce(
    (sum, task) => sum + task.durationHours,
    0,
  );

  return {
    depot,
    selectedTasks: selection.selectedTasks,
    totalImpact: selection.totalImpact,
    totalDuration,
  };
}
