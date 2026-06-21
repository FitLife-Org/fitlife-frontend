export interface AiWorkoutRequest {
  goal: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  daysPerWeek: number;
}

export interface AiWorkoutPlan {
  title: string;
  summary: string;
  days: Array<{
    name: string;
    exercises: string[];
  }>;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}
