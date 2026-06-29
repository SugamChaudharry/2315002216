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
