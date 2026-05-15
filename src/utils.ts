import type { Subtask } from './types';

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const todayKey = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const daysBetween = (a: string, b: string): number => {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / 86400000);
};

export const formatTime = (totalSec: number): string => {
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const ACTION_VERBS = [
  'Ouvrir',
  'Lister',
  'Rassembler',
  'Préparer',
  'Écrire',
  'Vérifier',
  'Envoyer',
  'Ranger',
];

// Heuristic decomposition: split a task title/note into 3-5 actionable steps.
// No AI — uses simple cues (newlines, commas, "et", "puis") and a fallback template.
export const decomposeTask = (title: string, note?: string): Subtask[] => {
  const blob = [title, note].filter(Boolean).join('\n').trim();
  if (!blob) return [];

  const explicitParts = blob
    .split(/\n+|(?:,|;| puis | ensuite | et )/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  let parts: string[];
  if (explicitParts.length >= 2) {
    parts = explicitParts.slice(0, 5);
  } else {
    parts = [
      `${ACTION_VERBS[0]} ce qu'il faut pour : ${title}`,
      `${ACTION_VERBS[1]} les 3 premières micro-étapes`,
      `Faire la 1ère étape pendant 5 min seulement`,
      `Marquer une pause si bloqué`,
      `Cocher dès qu'une mini-étape est faite`,
    ];
  }

  return parts.map((p) => ({
    id: uid(),
    title: p.charAt(0).toUpperCase() + p.slice(1),
    done: false,
  }));
};

export const xpForLevel = (level: number): number => 100 + (level - 1) * 150;

export const levelFromXp = (xp: number): { level: number; into: number; need: number } => {
  let lvl = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(lvl)) {
    remaining -= xpForLevel(lvl);
    lvl += 1;
  }
  return { level: lvl, into: remaining, need: xpForLevel(lvl) };
};

import type { Priority, Task } from './types';

const priorityWeight = (p: Priority): number =>
  p === 'high' ? 3 : p === 'low' ? 1 : 2;

// Picks a pending task with a priority-weighted random draw.
// Returns null when there is nothing to do.
export const pickWeightedRandomTask = (tasks: Task[]): Task | null => {
  const pending = tasks.filter((t) => !t.done);
  if (pending.length === 0) return null;
  const weights = pending.map((t) => priorityWeight(t.priority));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pending.length; i++) {
    r -= weights[i];
    if (r <= 0) return pending[i];
  }
  return pending[pending.length - 1];
};
