import { assertDepotArray, assertTaskArray } from "./parser";
import { Depot, Task } from "./types";

export async function fetchDepots(token: string): Promise<Depot[]> {
  const response = await fetch(
    "http://4.224.186.213/evaluation-service/depots",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Depot fetch failed with status ${response.status}`);
  }

  const json = await response.json();
  return assertDepotArray(json);
}

export async function fetchTasks(token: string): Promise<Task[]> {
  const response = await fetch(
    "http://4.224.186.213/evaluation-service/vehicles",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Task fetch failed with status ${response.status}`);
  }

  const json = await response.json();
  return assertTaskArray(json);
}
