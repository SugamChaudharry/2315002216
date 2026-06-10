export interface Task {
  id: string;
  description: string;
  durationHours: number;
  impactScore: number;
}

export interface Depot {
  id: string;
  name: string;
  capacityHours: number;
}

export interface SelectedSchedule {
  depot: Depot;
  selectedTasks: Task[];
  totalImpact: number;
  totalDuration: number;
}

export function knapsack(tasks: Task[], capacityHours: number): { selectedTasks: Task[]; totalImpact: number } {
  const capacity = Math.floor(capacityHours);
  const n = tasks.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const task = tasks[i - 1];
    const weight = Math.min(capacity, Math.floor(task.durationHours));
    for (let w = 0; w <= capacity; w++) {
      if (weight <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weight] + task.impactScore);
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
      const weight = Math.min(capacity, Math.floor(task.durationHours));
      selectedTasks.push(task);
      w -= weight;
    }
  }

  return {
    selectedTasks: selectedTasks.reverse(),
    totalImpact: dp[n][capacity],
  };
}

export async function buildDepotSchedule(depot: Depot, tasks: Task[]): Promise<SelectedSchedule> {
  const selection = knapsack(tasks, depot.capacityHours);
  const totalDuration = selection.selectedTasks.reduce((sum, task) => sum + task.durationHours, 0);

  return {
    depot,
    selectedTasks: selection.selectedTasks,
    totalImpact: selection.totalImpact,
    totalDuration,
  };
}

export async function fetchDepots(): Promise<Depot[]> {
  const response = await fetch("http://4.224.186.213/evaluation-service/depots");
  if (!response.ok) {
    throw new Error(`Depot fetch failed with status ${response.status}`);
  }
  return response.json();
}

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch("http://4.224.186.213/evaluation-service/vehicles");
  if (!response.ok) {
    throw new Error(`Task fetch failed with status ${response.status}`);
  }
  return response.json();
}
