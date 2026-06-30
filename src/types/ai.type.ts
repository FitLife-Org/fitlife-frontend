export interface AiWorkoutRequest {
  goal: string;
  level: string;
  daysPerWeek: number;
  durationMinutes: number;
  equipment?: string[];
  healthNotes?: string;
}

export interface AiWorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds?: number;
  note?: string;
}

export interface AiWorkoutDay {
  day: number;
  title: string;
  focus: string;
  exercises: AiWorkoutExercise[];
}

export interface AiWorkoutPlan {
  title: string;
  goal: string;
  level: string;
  summary: string;
  days: AiWorkoutDay[];
  notes?: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}