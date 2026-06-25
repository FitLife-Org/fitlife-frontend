export interface AiWorkoutRequest {
  goal: string;
  fitnessLevel: string;
  daysPerWeek: number;
  injuries?: string;
  equipment?: string;
  dietPreference?: string;
}

export interface AiExercise {
  exerciseName: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
}

export interface AiSession {
  dayName: string;
  focusArea: string;
  exercises: AiExercise[];
}

export interface AiWorkoutResponse {
  planName: string;
  goal: string;
  estimatedDurationWeeks: number;
  fitnessLevel: string;
  sessions: AiSession[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}
