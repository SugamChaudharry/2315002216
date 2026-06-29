import dotenv from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";
import process from "process";
import { buildDepotSchedule } from "./index.js";
import { getDummyDepots, getDummyVehicles } from "./dummy_data.js";

const envCandidates = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "vehicle_scheduling_be/.env"),
  resolve(process.cwd(), "dist/vehicle_scheduling_be/.env"),
];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

async function main() {
  try {
    const token = process.env.ACCESS_TOKEN;
    if (!token) {
      throw new Error("ACCESS_TOKEN is not configured in .env");
    }
    const depots = getDummyDepots();
    const tasks = getDummyVehicles();

    for (const depot of depots) {
      const schedule = await buildDepotSchedule(depot, tasks);
      console.log(`Depot: ${depot.name} (${depot.capacityHours}h capacity)`);
      console.log(`  Total impact: ${schedule.totalImpact}`);
      console.log(`  Total duration: ${schedule.totalDuration.toFixed(1)}h`);
      console.log("  Selected tasks:");
      for (const task of schedule.selectedTasks) {
        console.log(`    - ${task.description} (${task.durationHours}h, impact ${task.impactScore})`);
      }
      console.log("");
    }
  } catch (error) {
    console.error("Failed to build depot schedules:", error);
    process.exit(1);
  }
}

main();
