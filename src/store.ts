import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  cancelNotification,
  scheduleDailyReminder,
  scheduleFocusEnd,
} from './services/notifications';
import {
  JOKER_CAP,
  JOKER_INITIAL,
  type GamificationState,
  type Note,
  type PomodoroPhase,
  type PomodoroState,
  type Routine,
  type Settings,
  type Subtask,
  type Task,
} from './types';
import { daysBetween, decomposeTask, todayKey, uid } from './utils';

type Store = {
  tasks: Task[];
  routines: Routine[];
  notes: Note[];
  gamification: GamificationState;
  settings: Settings;
  pomodoro: PomodoroState;
  currentTaskId: string | null;
  hydrated: boolean;

  addTask: (title: string, note?: string, priority?: Task['priority']) => string;
  addTaskWithSubtasks: (
    title: string,
    note: string | undefined,
    priority: Task['priority'],
    subtasks: Subtask[],
  ) => string;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  toggleSubtask: (taskId: string, subId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  removeSubtask: (taskId: string, subId: string) => void;
  setCurrentTask: (id: string | null) => void;

  addNote: (text: string) => string;
  archiveNote: (id: string) => void;
  unarchiveNote: (id: string) => void;
  removeNote: (id: string) => void;
  convertNoteToTask: (id: string) => string | null;

  addRoutine: (input: Omit<Routine, 'id' | 'streak' | 'lastCompletedDay' | 'createdAt'>) => string;
  toggleRoutineToday: (id: string) => void;
  removeRoutine: (id: string) => Promise<void>;

  awardFocusSession: (durationSec: number) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  applyDailyReminder: (enabled: boolean, hour: number, minute: number) => Promise<void>;

  startPomodoroPhase: (phase: PomodoroPhase, overrideSeconds?: number) => Promise<void>;
  startQuickFocus: (taskId?: string) => Promise<void>;
  togglePomodoro: () => Promise<void>;
  resetPomodoro: () => Promise<void>;
  advancePomodoroPhase: () => Promise<void>;

  resetAll: () => void;
  _markHydrated: () => void;
};

const initialGamification: GamificationState = {
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDay: null,
  totalTasksDone: 0,
  totalFocusMinutes: 0,
  jokers: JOKER_INITIAL,
  jokerUsedToday: false,
};

const initialSettings: Settings = {
  focusMinutes: 15,
  breakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  hapticsEnabled: true,
  notificationsEnabled: true,
  dailyReminderEnabled: false,
  dailyReminderHour: 9,
  dailyReminderMinute: 0,
  aiDecompositionEnabled: false,
  theme: 'system',
};

const initialPomodoro: PomodoroState = {
  phase: 'idle',
  running: false,
  endsAt: null,
  pausedSecondsLeft: null,
  totalSec: 15 * 60,
  cycle: 0,
  scheduledNotifId: null,
};

const phaseMinutes = (p: PomodoroPhase, s: Settings): number => {
  if (p === 'focus') return s.focusMinutes;
  if (p === 'break') return s.breakMinutes;
  if (p === 'longBreak') return s.longBreakMinutes;
  return s.focusMinutes;
};

const bumpStreak = (state: GamificationState): GamificationState => {
  const today = todayKey();
  if (state.lastActiveDay === today) return state;
  if (state.lastActiveDay == null) {
    return { ...state, streak: 1, lastActiveDay: today, jokerUsedToday: false };
  }
  const diff = daysBetween(state.lastActiveDay, today);

  if (diff === 1) {
    const nextStreak = state.streak + 1;
    // Joker earned every 7 days, capped.
    const earned = nextStreak % 7 === 0 && state.jokers < JOKER_CAP;
    return {
      ...state,
      streak: nextStreak,
      lastActiveDay: today,
      jokers: earned ? state.jokers + 1 : state.jokers,
      jokerUsedToday: false,
    };
  }

  const missed = diff - 1;
  if (missed <= state.jokers) {
    return {
      ...state,
      streak: state.streak + 1,
      lastActiveDay: today,
      jokers: state.jokers - missed,
      jokerUsedToday: true,
    };
  }

  return {
    ...state,
    streak: 1,
    lastActiveDay: today,
    jokerUsedToday: false,
  };
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      tasks: [],
      routines: [],
      notes: [],
      gamification: initialGamification,
      settings: initialSettings,
      pomodoro: initialPomodoro,
      currentTaskId: null,
      hydrated: false,

      addTask: (title, note, priority = 'normal') => {
        const id = uid();
        const task: Task = {
          id,
          title: title.trim(),
          note: note?.trim() || undefined,
          priority,
          subtasks: decomposeTask(title, note),
          done: false,
          createdAt: Date.now(),
        };
        set((s) => ({ tasks: [task, ...s.tasks] }));
        return id;
      },

      addTaskWithSubtasks: (title, note, priority, subtasks) => {
        const id = uid();
        const task: Task = {
          id,
          title: title.trim(),
          note: note?.trim() || undefined,
          priority,
          subtasks,
          done: false,
          createdAt: Date.now(),
        };
        set((s) => ({ tasks: [task, ...s.tasks] }));
        return id;
      },

      toggleTask: (id) => {
        set((s) => {
          const tasks = s.tasks.map((t) =>
            t.id === id
              ? { ...t, done: !t.done, completedAt: !t.done ? Date.now() : undefined }
              : t,
          );
          const target = tasks.find((t) => t.id === id);
          if (target?.done) {
            const nextGam = bumpStreak({
              ...s.gamification,
              xp: s.gamification.xp + 10,
              totalTasksDone: s.gamification.totalTasksDone + 1,
            });
            return { tasks, gamification: nextGam };
          }
          return { tasks };
        });
      },

      removeTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
          currentTaskId: s.currentTaskId === id ? null : s.currentTaskId,
        })),

      toggleSubtask: (taskId, subId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id !== taskId
              ? t
              : {
                  ...t,
                  subtasks: t.subtasks.map((sub) =>
                    sub.id === subId ? { ...sub, done: !sub.done } : sub,
                  ),
                },
          ),
        })),

      addSubtask: (taskId, title) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id !== taskId
              ? t
              : {
                  ...t,
                  subtasks: [...t.subtasks, { id: uid(), title: trimmed, done: false }],
                },
          ),
        }));
      },

      removeSubtask: (taskId, subId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id !== taskId
              ? t
              : { ...t, subtasks: t.subtasks.filter((sub) => sub.id !== subId) },
          ),
        })),

      setCurrentTask: (id) => set({ currentTaskId: id }),

      addNote: (text) => {
        const trimmed = text.trim();
        if (!trimmed) return '';
        const id = uid();
        const note: Note = { id, text: trimmed, createdAt: Date.now() };
        set((s) => ({ notes: [note, ...s.notes] }));
        return id;
      },

      archiveNote: (id) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, archivedAt: Date.now() } : n,
          ),
        })),

      unarchiveNote: (id) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, archivedAt: undefined } : n,
          ),
        })),

      removeNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      convertNoteToTask: (id) => {
        const note = get().notes.find((n) => n.id === id);
        if (!note) return null;
        const taskId = get().addTask(note.text);
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, archivedAt: Date.now() } : n,
          ),
        }));
        return taskId;
      },

      addRoutine: (input) => {
        const id = uid();
        const routine: Routine = {
          id,
          title: input.title.trim(),
          emoji: input.emoji,
          scheduledTime: input.scheduledTime,
          days: input.days,
          streak: 0,
          lastCompletedDay: null,
          createdAt: Date.now(),
          notificationId: input.notificationId,
        };
        set((s) => ({ routines: [...s.routines, routine] }));
        return id;
      },

      toggleRoutineToday: (id) => {
        set((s) => {
          const today = todayKey();
          const routines = s.routines.map((r) => {
            if (r.id !== id) return r;
            if (r.lastCompletedDay === today) {
              return { ...r, lastCompletedDay: null, streak: Math.max(0, r.streak - 1) };
            }
            const continuous =
              r.lastCompletedDay && daysBetween(r.lastCompletedDay, today) === 1;
            return {
              ...r,
              lastCompletedDay: today,
              streak: continuous ? r.streak + 1 : 1,
            };
          });
          const target = routines.find((r) => r.id === id);
          if (target?.lastCompletedDay === today) {
            const nextGam = bumpStreak({
              ...s.gamification,
              xp: s.gamification.xp + 5,
            });
            return { routines, gamification: nextGam };
          }
          return { routines };
        });
      },

      removeRoutine: async (id) => {
        const target = get().routines.find((r) => r.id === id);
        if (target?.notificationId) {
          await cancelNotification(target.notificationId);
        }
        set((s) => ({ routines: s.routines.filter((r) => r.id !== id) }));
      },

      awardFocusSession: (durationSec) =>
        set((s) => {
          const minutes = Math.round(durationSec / 60);
          const next = bumpStreak({
            ...s.gamification,
            xp: s.gamification.xp + 25 + minutes,
            totalFocusMinutes: s.gamification.totalFocusMinutes + minutes,
          });
          return { gamification: next };
        }),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      applyDailyReminder: async (enabled, hour, minute) => {
        const prevId = get().settings.dailyReminderId;
        if (prevId) {
          await cancelNotification(prevId);
        }
        let id: string | undefined;
        if (enabled) {
          const scheduled = await scheduleDailyReminder(hour, minute);
          id = scheduled ?? undefined;
        }
        set((s) => ({
          settings: {
            ...s.settings,
            dailyReminderEnabled: enabled && !!id,
            dailyReminderHour: hour,
            dailyReminderMinute: minute,
            dailyReminderId: id,
          },
        }));
      },

      startPomodoroPhase: async (phase, overrideSeconds) => {
        if (phase === 'idle') return;
        const s = get().settings;
        const sec = overrideSeconds ?? phaseMinutes(phase, s) * 60;
        const prevId = get().pomodoro.scheduledNotifId;
        if (prevId) await cancelNotification(prevId);
        let notifId: string | null = null;
        if (s.notificationsEnabled) {
          notifId = await scheduleFocusEnd(sec, phase);
        }
        set((cur) => ({
          pomodoro: {
            phase,
            running: true,
            endsAt: Date.now() + sec * 1000,
            pausedSecondsLeft: null,
            totalSec: sec,
            cycle: cur.pomodoro.cycle,
            scheduledNotifId: notifId,
          },
        }));
      },

      startQuickFocus: async (taskId) => {
        if (taskId) set({ currentTaskId: taskId });
        await get().startPomodoroPhase('focus', 120);
      },

      togglePomodoro: async () => {
        const { pomodoro, settings } = get();
        if (pomodoro.phase === 'idle') {
          await get().startPomodoroPhase('focus');
          return;
        }
        if (pomodoro.running) {
          if (pomodoro.scheduledNotifId) {
            await cancelNotification(pomodoro.scheduledNotifId);
          }
          const remaining = pomodoro.endsAt
            ? Math.max(0, Math.round((pomodoro.endsAt - Date.now()) / 1000))
            : pomodoro.totalSec;
          set({
            pomodoro: {
              ...pomodoro,
              running: false,
              endsAt: null,
              pausedSecondsLeft: remaining,
              scheduledNotifId: null,
            },
          });
          return;
        }
        const remaining = pomodoro.pausedSecondsLeft ?? pomodoro.totalSec;
        let notifId: string | null = null;
        if (settings.notificationsEnabled) {
          notifId = await scheduleFocusEnd(remaining, pomodoro.phase);
        }
        set({
          pomodoro: {
            ...pomodoro,
            running: true,
            endsAt: Date.now() + remaining * 1000,
            pausedSecondsLeft: null,
            scheduledNotifId: notifId,
          },
        });
      },

      resetPomodoro: async () => {
        const { pomodoro, settings } = get();
        if (pomodoro.scheduledNotifId) {
          await cancelNotification(pomodoro.scheduledNotifId);
        }
        set({
          pomodoro: {
            phase: 'idle',
            running: false,
            endsAt: null,
            pausedSecondsLeft: null,
            totalSec: settings.focusMinutes * 60,
            cycle: 0,
            scheduledNotifId: null,
          },
        });
      },

      advancePomodoroPhase: async () => {
        const { pomodoro, settings } = get();
        if (pomodoro.phase === 'focus') {
          get().awardFocusSession(pomodoro.totalSec);
          const nextCycle = pomodoro.cycle + 1;
          const isLong =
            settings.cyclesBeforeLongBreak > 0 &&
            nextCycle % settings.cyclesBeforeLongBreak === 0;
          set((cur) => ({ pomodoro: { ...cur.pomodoro, cycle: nextCycle } }));
          await get().startPomodoroPhase(isLong ? 'longBreak' : 'break');
        } else {
          await get().startPomodoroPhase('focus');
        }
      },

      resetAll: () =>
        set({
          tasks: [],
          routines: [],
          notes: [],
          gamification: initialGamification,
          settings: initialSettings,
          pomodoro: initialPomodoro,
          currentTaskId: null,
        }),

      _markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'focusadhd-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        tasks: s.tasks,
        routines: s.routines,
        notes: s.notes,
        gamification: s.gamification,
        settings: s.settings,
        // Don't persist pomodoro live state — start fresh each app launch.
        currentTaskId: s.currentTaskId,
      }),
      onRehydrateStorage: () => (state) => {
        state?._markHydrated();
      },
    },
  ),
);
