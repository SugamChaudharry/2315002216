// dummy_data.ts
// Drop this file into your project root.
// Replace fetchDepots() and fetchTasks() calls with getDummyDepots() and getDummyVehicles()
// when the API is down.

// ─── Types (same as your actual types) ───────────────────────────────────────

export interface Depot {
  id: string;
  name: string;
  capacityHours: number;
}

export interface Task {
  id: string;
  description: string;
  durationHours: number;
  impactScore: number;
}

// ─── Dummy Depots ─────────────────────────────────────────────────────────────
// Mirrors what GET /evaluation-service/depots returns after assertDepotArray()
// Original API shape: { "depots": [{ "ID": 1, "MechanicHours": 60 }, ...] }
// After normalization: { id: "1", name: "Depot 1", capacityHours: 60 }

export function getDummyDepots(): Depot[] {
  return [
    { id: "1", name: "Depot 1", capacityHours: 6  },
    { id: "2", name: "Depot 2", capacityHours: 135 },
    { id: "3", name: "Depot 3", capacityHours: 188 },
    { id: "4", name: "Depot 4", capacityHours: 45  },
    { id: "5", name: "Depot 5", capacityHours: 90  },
  ];
}

// ─── Dummy Vehicles (Tasks) ───────────────────────────────────────────────────
// Mirrors what GET /evaluation-service/vehicles returns after assertTaskArray()
// Original API shape: { "vehicles": [{ "TaskID": "...", "Duration": 1, "Impact": 5 }, ...] }
// After normalization: { id: "...", durationHours: 1, impactScore: 5 }

export function getDummyVehicles(): Task[] {
  return [
    // Short duration, high impact — always gets picked early
    { id: "v01", description: "Engine oil change - Truck 101",       durationHours: 1,  impactScore: 5  },
    { id: "v02", description: "Brake pad replacement - Van 202",     durationHours: 2,  impactScore: 9  },
    { id: "v03", description: "Tyre rotation - Truck 303",           durationHours: 1,  impactScore: 3  },
    { id: "v04", description: "Transmission service - Bus 404",      durationHours: 6,  impactScore: 2  },
    { id: "v05", description: "AC compressor fix - Van 505",         durationHours: 4,  impactScore: 7  },
    // { id: "v06", description: "Coolant flush - Truck 606",           durationHours: 2,  impactScore: 6  },
    // { id: "v07", description: "Steering alignment - Bus 707",        durationHours: 3,  impactScore: 8  },
    // { id: "v08", description: "Battery replacement - Van 808",       durationHours: 1,  impactScore: 4  },
    // { id: "v09", description: "Exhaust system repair - Truck 909",   durationHours: 5,  impactScore: 10 },
    // { id: "v10", description: "Fuel injector clean - Van 110",       durationHours: 2,  impactScore: 5  },

    // // Medium duration tasks
    // { id: "v11", description: "Suspension overhaul - Truck 111",     durationHours: 8,  impactScore: 14 },
    // { id: "v12", description: "Clutch replacement - Bus 212",        durationHours: 7,  impactScore: 12 },
    // { id: "v13", description: "Power steering fluid - Van 313",      durationHours: 1,  impactScore: 2  },
    // { id: "v14", description: "Windshield wiper fix - Truck 414",    durationHours: 1,  impactScore: 1  },
    // { id: "v15", description: "Differential service - Bus 515",      durationHours: 6,  impactScore: 11 },
    // { id: "v16", description: "Air filter replacement - Van 616",    durationHours: 1,  impactScore: 3  },
    // { id: "v17", description: "Spark plug change - Truck 717",       durationHours: 2,  impactScore: 4  },
    // { id: "v18", description: "Timing belt replacement - Bus 818",   durationHours: 9,  impactScore: 18 },
    // { id: "v19", description: "Radiator flush - Van 919",            durationHours: 3,  impactScore: 6  },
    // { id: "v20", description: "Alternator replacement - Truck 120",  durationHours: 4,  impactScore: 9  },

    // // Long duration, very high impact — only large depots pick these
    // { id: "v21", description: "Engine rebuild - Bus 221",            durationHours: 20, impactScore: 40 },
    // { id: "v22", description: "Gearbox overhaul - Truck 322",        durationHours: 15, impactScore: 30 },
    // { id: "v23", description: "Full chassis inspection - Bus 423",   durationHours: 12, impactScore: 22 },
    // { id: "v24", description: "Hydraulic system repair - Van 524",   durationHours: 10, impactScore: 19 },
    // { id: "v25", description: "Turbocharger service - Truck 625",    durationHours: 8,  impactScore: 16 },
  ];
}

// ─── Raw API shape (if you want to test assertDepotArray / assertTaskArray) ───
// This is what the actual test server returned BEFORE normalization.
// Use this to test your parsing functions.

export const RAW_DEPOTS_RESPONSE = {
  depots: [
    { ID: 1, MechanicHours: 60  },
    { ID: 2, MechanicHours: 135 },
    { ID: 3, MechanicHours: 188 },
    { ID: 4, MechanicHours: 45  },
    { ID: 5, MechanicHours: 90  },
  ],
};

export const RAW_VEHICLES_RESPONSE = {
  vehicles: [
    { TaskID: "v01", Duration: 1,  Impact: 5  },
    { TaskID: "v02", Duration: 2,  Impact: 9  },
    { TaskID: "v03", Duration: 1,  Impact: 3  },
    { TaskID: "v04", Duration: 6,  Impact: 2  },
    { TaskID: "v05", Duration: 4,  Impact: 7  },
    { TaskID: "v06", Duration: 2,  Impact: 6  },
    { TaskID: "v07", Duration: 3,  Impact: 8  },
    { TaskID: "v08", Duration: 1,  Impact: 4  },
    { TaskID: "v09", Duration: 5,  Impact: 10 },
    { TaskID: "v10", Duration: 2,  Impact: 5  },
    { TaskID: "v11", Duration: 8,  Impact: 14 },
    { TaskID: "v12", Duration: 7,  Impact: 12 },
    { TaskID: "v13", Duration: 1,  Impact: 2  },
    { TaskID: "v14", Duration: 1,  Impact: 1  },
    { TaskID: "v15", Duration: 6,  Impact: 11 },
    { TaskID: "v16", Duration: 1,  Impact: 3  },
    { TaskID: "v17", Duration: 2,  Impact: 4  },
    { TaskID: "v18", Duration: 9,  Impact: 18 },
    { TaskID: "v19", Duration: 3,  Impact: 6  },
    { TaskID: "v20", Duration: 4,  Impact: 9  },
    { TaskID: "v21", Duration: 20, Impact: 40 },
    { TaskID: "v22", Duration: 15, Impact: 30 },
    { TaskID: "v23", Duration: 12, Impact: 22 },
    { TaskID: "v24", Duration: 10, Impact: 19 },
    { TaskID: "v25", Duration: 8,  Impact: 16 },
  ],
};