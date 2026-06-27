import dotenv from "dotenv";
import { fetchDepots, fetchTasks, buildDepotSchedule } from "./index.js";
import process from "process";

dotenv.config();

async function main() {
  try {
    const token = process.env.ACCESS_TOKEN;
    if (!token) {
      throw new Error("ACCESS_TOKEN is not configured in .env");
    }

    const depots = await fetchDepots(token);
    const tasks = await fetchTasks(token);

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
