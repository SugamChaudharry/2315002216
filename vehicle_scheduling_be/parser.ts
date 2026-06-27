import { Depot, Task } from "./types";

function parseArrayResponse<T>(
  payload: unknown,
  names: string[],
  context: string,
): T[] {
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
    `${context} fetch returned unexpected payload shape: ${JSON.stringify(payload)}`,
  );
}

export function assertDepotArray(payload: unknown): Depot[] {
  const items = parseArrayResponse<unknown>(
    payload,
    ["depots", "items"],
    "Depot",
  );

  return items.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(
        `Depot item at index ${index} is invalid: ${JSON.stringify(item)}`,
      );
    }
    const d = item as Record<string, unknown>;
    const rawId = d["ID"] ?? d["id"];
    const rawHours = d["MechanicHours"] ?? d["capacityHours"];

    if (rawId === undefined || rawId === null) {
      throw new Error(
        `Depot item at index ${index} missing id: ${JSON.stringify(item)}`,
      );
    }

    const id = String(rawId);
    const name =
      typeof d["name"] === "string" ? (d["name"] as string) : `Depot ${id}`;
    const capacityHours = Number(rawHours ?? 0);

    if (!Number.isFinite(capacityHours)) {
      throw new Error(
        `Depot item at index ${index} has invalid capacityHours: ${JSON.stringify(item)}`,
      );
    }

    return {
      id,
      name,
      capacityHours,
    } as Depot;
  });
}

export function assertTaskArray(payload: unknown): Task[] {
  const items = parseArrayResponse<unknown>(
    payload,
    ["vehicles", "tasks", "items"],
    "Task",
  );

  return items.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(
        `Task item at index ${index} is invalid: ${JSON.stringify(item)}`,
      );
    }
    const t = item as Record<string, unknown>;
    const rawId = t["TaskID"] ?? t["id"];
    const rawDuration = t["Duration"] ?? t["durationHours"];
    const rawImpact = t["Impact"] ?? t["impactScore"];

    if (rawId === undefined || rawId === null) {
      throw new Error(
        `Task item at index ${index} missing id: ${JSON.stringify(item)}`,
      );
    }

    const id = String(rawId);
    const description =
      typeof t["description"] === "string"
        ? (t["description"] as string)
        : `Task ${id}`;
    const durationHours = Number(rawDuration ?? 0);
    const impactScore = Number(rawImpact ?? 0);

    if (!Number.isFinite(durationHours) || !Number.isFinite(impactScore)) {
      throw new Error(
        `Task item at index ${index} has invalid numeric fields: ${JSON.stringify(item)}`,
      );
    }

    return {
      id,
      description,
      durationHours,
      impactScore,
    } as Task;
  });
}
