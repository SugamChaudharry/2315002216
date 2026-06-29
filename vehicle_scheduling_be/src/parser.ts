import { Depot, Task } from "./types.js";

interface DepotApiResponse {
  depots: Array<{ ID: number; MechanicHours: number }>;
}

interface TaskApiResponse {
  vehicles: Array<{ TaskID: string; Duration: number; Impact: number }>;
}

export function assertDepotArray(payload: unknown): Depot[] {
  const { depots } = payload as DepotApiResponse;
  return depots.map((d) => ({
    id:            String(d.ID),
    name:          `Depot ${d.ID}`,
    capacityHours: d.MechanicHours,
  }));
}

export function assertTaskArray(payload: unknown): Task[] {
  const { vehicles } = payload as TaskApiResponse;
  return vehicles.map((v) => ({
    id:            v.TaskID,
    description:   `Task ${v.TaskID}`,
    durationHours: v.Duration,
    impactScore:   v.Impact,
  }));
}