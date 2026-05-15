import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GamificationState, Settings, Task } from './types';
import { daysBetween, decomposeTask, todayKey, uid } from './utils';

type Store = {
  tasks: Task[];
  gamification: GamificationState;
  settings: Settings;
  currentTaskId: string | null;
  hydrated: boolean;

  addTask: (title: string, note?: string, priority?: Task['priority']) => string;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  toggleSubtask: (taskId: string, subId: string) => void;
  setCurrentTask: (id: string | null) => void;

  awardFocusSession: (durationSec: number) => void;
  updateSettings: (patch: Partial<Settings>) => void;
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
};

const initialSettings: Settings = {
  focusMinutes: 15,
  breakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  hapticsEnabled: true,
};

const bumpStreak = (state: GamificationState): GamificationState => {
  const today = todayKey();
  if (state.lastActiveDay === today) return state;
  if (state.lastActiveDay == null) {
    return { ...state, streak: 1, lastActiveDay: today };
  }
  const diff = daysBetween(state.lastActiveDay, today);
  const nextStreak = diff === 1 ? state.streak + 1 : 1;
  return { ...state, streak: nextStreak, lastActiveDay: today };
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      tasks: [],
      gamification: initialGamification,
      settings: initialSettings,
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

      setCurrentTask: (id) => set({ currentTaskId: id }),

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

      resetAll: () =>
        set({
          tasks: [],
          gamification: initialGamification,
          settings: initialSettings,
          currentTaskId: null,
        }),

      _markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'focusadhd-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        tasks: s.tasks,
        gamification: s.gamification,
        settings: s.settings,
        currentTaskId: s.currentTaskId,
      }),
      onRehydrateStorage: () => (state) => {
        state?._markHydrated();
      },
    },
  ),
);
