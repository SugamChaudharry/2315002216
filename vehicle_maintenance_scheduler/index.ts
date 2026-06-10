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
  if (!Number.isFinite(capacity) || capacity < 0) {
    throw new Error(`Invalid capacityHours value: ${capacityHours}`);
  }

  const n = tasks.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const task = tasks[i - 1];
    const duration = Math.floor(task.durationHours);
    if (!Number.isFinite(duration) || duration < 0) {
      throw new Error(`Invalid task durationHours value: ${task.durationHours} for task ${task.id}`);
    }
    const weight = Math.min(capacity, duration);
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

export async function buildDepotSchedule(depot: Depot, tasks: Task[]): Promise<SelectedSchedule> {
  if (!Number.isFinite(depot.capacityHours) || depot.capacityHours < 0) {
    throw new Error(`Invalid depot capacityHours value: ${String(depot.capacityHours)}`);
  }

  const selection = knapsack(tasks, depot.capacityHours);
  const totalDuration = selection.selectedTasks.reduce((sum, task) => sum + task.durationHours, 0);

  return {
    depot,
    selectedTasks: selection.selectedTasks,
    totalImpact: selection.totalImpact,
    totalDuration,
  };
}

function parseArrayResponse<T>(payload: unknown, names: string[], context: string): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object" && payload !== null) {
    for (const name of names) {
      const candidate = (payload as Record<string, unknown>)[name];
      if (Array.isArray(candidate)) {
        return candidate as T[];
      }
    }
  }

  throw new Error(
    `${context} fetch returned unexpected payload shape: ${JSON.stringify(payload)}`
  );
}

function assertDepotArray(payload: unknown): Depot[] {
  const items = parseArrayResponse<unknown>(payload, ["depots", "items"], "Depot");

  return items.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Depot item at index ${index} is invalid: ${JSON.stringify(item)}`);
    }
    const d = item as Record<string, unknown>;
    const rawId = d["ID"] ?? d["id"];
    const rawHours = d["MechanicHours"] ?? d["capacityHours"];

    if (rawId === undefined || rawId === null) {
      throw new Error(`Depot item at index ${index} missing id: ${JSON.stringify(item)}`);
    }

    const id = String(rawId);
    const name = typeof d["name"] === "string" ? (d["name"] as string) : `Depot ${id}`;
    const capacityHours = Number(rawHours ?? 0);

    if (!Number.isFinite(capacityHours)) {
      throw new Error(`Depot item at index ${index} has invalid capacityHours: ${JSON.stringify(item)}`);
    }

    return {
      id,
      name,
      capacityHours,
    } as Depot;
  });
}

function assertTaskArray(payload: unknown): Task[] {
  const items = parseArrayResponse<unknown>(payload, ["vehicles", "tasks", "items"], "Task");

  return items.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Task item at index ${index} is invalid: ${JSON.stringify(item)}`);
    }
    const t = item as Record<string, unknown>;
    const rawId = t["TaskID"] ?? t["id"];
    const rawDuration = t["Duration"] ?? t["durationHours"];
    const rawImpact = t["Impact"] ?? t["impactScore"];

    if (rawId === undefined || rawId === null) {
      throw new Error(`Task item at index ${index} missing id: ${JSON.stringify(item)}`);
    }

    const id = String(rawId);
    const description = typeof t["description"] === "string" ? (t["description"] as string) : `Task ${id}`;
    const durationHours = Number(rawDuration ?? 0);
    const impactScore = Number(rawImpact ?? 0);

    if (!Number.isFinite(durationHours) || !Number.isFinite(impactScore)) {
      throw new Error(`Task item at index ${index} has invalid numeric fields: ${JSON.stringify(item)}`);
    }

    return {
      id,
      description,
      durationHours,
      impactScore,
    } as Task;
  });
}

export async function fetchDepots(token: string): Promise<Depot[]> {
  const response = await fetch("http://4.224.186.213/evaluation-service/depots", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Depot fetch failed with status ${response.status}`);
  }

  const json = await response.json();
  return assertDepotArray(json);
}

export async function fetchTasks(token: string): Promise<Task[]> {
  const response = await fetch("http://4.224.186.213/evaluation-service/vehicles", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Task fetch failed with status ${response.status}`);
  }

  const json = await response.json();
  return assertTaskArray(json);
}
