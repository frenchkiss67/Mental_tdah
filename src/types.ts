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

export type PomodoroPhase = 'idle' | 'focus' | 'break' | 'longBreak';

export type PomodoroState = {
  phase: PomodoroPhase;
  running: boolean;
  endsAt: number | null; // epoch ms when current phase ends (when running)
  pausedSecondsLeft: number | null; // remaining secs when paused
  totalSec: number;
  cycle: number;
  scheduledNotifId: string | null;
};

export type GamificationState = {
  xp: number;
  level: number;
  streak: number;
  lastActiveDay: string | null;
  totalTasksDone: number;
  totalFocusMinutes: number;
  jokers: number; // forgive missed days, max JOKER_CAP
  jokerUsedToday: boolean; // surfaces "joker consommé" in UI
};

export const JOKER_CAP = 3;
export const JOKER_INITIAL = 2;

export type Routine = {
  id: string;
  title: string;
  emoji?: string;
  scheduledTime?: string; // "HH:MM"
  days: number[]; // 0=Sun..6=Sat
  streak: number;
  lastCompletedDay: string | null;
  createdAt: number;
  notificationId?: string;
};

export type Settings = {
  focusMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLongBreak: number;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderHour: number;
  dailyReminderMinute: number;
  dailyReminderId?: string;
  aiDecompositionEnabled: boolean;
  anthropicApiKey?: string;
};
