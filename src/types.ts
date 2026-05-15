export type Subtask = {
  id: string;
  title: string;
  done: boolean;
};

export type Priority = 'low' | 'normal' | 'high';

export type Task = {
  id: string;
  title: string;
  note?: string;
  priority: Priority;
  subtasks: Subtask[];
  done: boolean;
  createdAt: number;
  completedAt?: number;
};

export type PomodoroSession = {
  id: string;
  taskId?: string;
  startedAt: number;
  durationSec: number;
  completed: boolean;
};

export type GamificationState = {
  xp: number;
  level: number;
  streak: number;
  lastActiveDay: string | null;
  totalTasksDone: number;
  totalFocusMinutes: number;
};

export type Settings = {
  focusMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLongBreak: number;
  hapticsEnabled: boolean;
};
