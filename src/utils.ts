import type { GamificationState, Subtask } from './types';
import { JOKER_CAP } from './types';

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

type StepTemplate = { title: string; estimatedMinutes?: number };

// Verb-based templates. Order matters: first regex match wins. Patterns
// are matched against a lowercased blob (title + optional note). Keep them
// specific enough to avoid false positives ("envoyer mail" should not
// also fire "écrire").
const VERB_TEMPLATES: { match: RegExp; steps: StepTemplate[] }[] = [
  {
    match: /\b(envoyer|repondre|répondre)\b.*\b(mail|email|courriel|message)\b/,
    steps: [
      { title: 'Ouvrir la messagerie', estimatedMinutes: 2 },
      { title: 'Trouver le bon destinataire', estimatedMinutes: 2 },
      { title: 'Écrire 2-3 phrases, même imparfaites', estimatedMinutes: 5 },
      { title: 'Relire une fois', estimatedMinutes: 2 },
      { title: 'Envoyer', estimatedMinutes: 1 },
    ],
  },
  {
    match: /\bappeler\b|\bcoup de fil\b|\btéléphoner\b/,
    steps: [
      { title: 'Trouver le numéro', estimatedMinutes: 2 },
      { title: 'Noter 2-3 points à dire', estimatedMinutes: 3 },
      { title: 'Appeler maintenant', estimatedMinutes: 5 },
      { title: 'Noter ce qui en ressort', estimatedMinutes: 2 },
    ],
  },
  {
    match: /\bprendre\s+(un\s+)?rendez-vous\b|\brdv\b|\bréserver\b/,
    steps: [
      { title: 'Trouver le bon contact', estimatedMinutes: 5 },
      { title: 'Ouvrir le calendrier', estimatedMinutes: 1 },
      { title: 'Appeler ou écrire', estimatedMinutes: 5 },
      { title: "Noter le rdv dans l'agenda", estimatedMinutes: 2 },
    ],
  },
  {
    match: /\b(papiers?|administrati(f|ve)|courrier|impôts|déclaration)\b/,
    steps: [
      { title: "Ouvrir l'enveloppe / le document", estimatedMinutes: 2 },
      { title: 'Identifier ce qui est demandé', estimatedMinutes: 5 },
      { title: 'Noter la date limite quelque part', estimatedMinutes: 1 },
      { title: 'Préparer la réponse ou rassembler les pièces', estimatedMinutes: 15 },
    ],
  },
  {
    match: /\b(faire\s+les\s+|aller\s+faire\s+les\s+|faire\s+des\s+)?courses\b/,
    steps: [
      { title: 'Vérifier le frigo et les placards', estimatedMinutes: 5 },
      { title: 'Lister 5-10 items', estimatedMinutes: 3 },
      { title: 'Y aller', estimatedMinutes: 30 },
      { title: 'Tout ranger en rentrant', estimatedMinutes: 5 },
    ],
  },
  {
    match: /\b(ranger|trier|nettoyer|faire\s+le\s+ménage)\b/,
    steps: [
      { title: 'Choisir UN endroit ou UNE pile', estimatedMinutes: 1 },
      { title: 'Faire 5 minutes seulement', estimatedMinutes: 5 },
      { title: 'Pause si besoin', estimatedMinutes: 2 },
      { title: 'Continuer 5 autres minutes', estimatedMinutes: 5 },
    ],
  },
  {
    match: /\b(écrire|rédiger)\b/,
    steps: [
      { title: 'Ouvrir le document', estimatedMinutes: 1 },
      { title: 'Écrire la 1ère phrase, même mauvaise', estimatedMinutes: 5 },
      { title: 'Continuer 10 min sans relire', estimatedMinutes: 10 },
      { title: 'Relire grossièrement', estimatedMinutes: 5 },
    ],
  },
  {
    match: /\b(lire|terminer\s+le\s+livre|finir\s+l'article)\b/,
    steps: [
      { title: "Ouvrir l'article ou le livre", estimatedMinutes: 1 },
      { title: 'Lire 10 lignes seulement', estimatedMinutes: 5 },
      { title: 'Noter UNE idée qui ressort', estimatedMinutes: 2 },
    ],
  },
];

// Heuristic decomposition: split a task title/note into 3-5 actionable steps.
// No AI — uses simple cues (newlines, commas, "et", "puis") first, then a
// verb dictionary for common ADHD-relevant chores (mail, calls, errands,
// admin paperwork), and finally a generic template.
export const decomposeTask = (title: string, note?: string): Subtask[] => {
  const blob = [title, note].filter(Boolean).join('\n').trim();
  if (!blob) return [];

  const explicitParts = blob
    .split(/\n+|(?:,|;| puis | ensuite | et )/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  if (explicitParts.length >= 2) {
    return explicitParts.slice(0, 5).map((p) => ({
      id: uid(),
      title: p.charAt(0).toUpperCase() + p.slice(1),
      done: false,
    }));
  }

  const haystack = blob.toLowerCase();
  for (const tpl of VERB_TEMPLATES) {
    if (tpl.match.test(haystack)) {
      return tpl.steps.map((step) => ({
        id: uid(),
        title: step.title,
        done: false,
        estimatedMinutes: step.estimatedMinutes,
      }));
    }
  }

  return [
    `${ACTION_VERBS[0]} ce qu'il faut pour : ${title}`,
    `${ACTION_VERBS[1]} les 3 premières micro-étapes`,
    'Faire la 1ère étape pendant 5 min seulement',
    'Marquer une pause si bloqué',
    'Cocher dès qu\'une mini-étape est faite',
  ].map((p) => ({
    id: uid(),
    title: p.charAt(0).toUpperCase() + p.slice(1),
    done: false,
  }));
};

// Streak + joker accounting. Idempotent on same day. Auto-consumes jokers
// when the user missed days but had jokers left; otherwise resets to 1.
// Earns +1 joker every 7 consecutive days (cap = JOKER_CAP). Pure so it
// can be unit-tested without the store.
export const bumpStreakState = (
  state: GamificationState,
  todayKeyStr: string = todayKey(),
): GamificationState => {
  if (state.lastActiveDay === todayKeyStr) return state;
  if (state.lastActiveDay == null) {
    return { ...state, streak: 1, lastActiveDay: todayKeyStr, jokerUsedToday: false };
  }
  const diff = daysBetween(state.lastActiveDay, todayKeyStr);

  if (diff === 1) {
    const nextStreak = state.streak + 1;
    const earned = nextStreak % 7 === 0 && state.jokers < JOKER_CAP;
    return {
      ...state,
      streak: nextStreak,
      lastActiveDay: todayKeyStr,
      jokers: earned ? state.jokers + 1 : state.jokers,
      jokerUsedToday: false,
    };
  }

  const missed = diff - 1;
  if (missed <= state.jokers) {
    return {
      ...state,
      streak: state.streak + 1,
      lastActiveDay: todayKeyStr,
      jokers: state.jokers - missed,
      jokerUsedToday: true,
    };
  }

  return {
    ...state,
    streak: 1,
    lastActiveDay: todayKeyStr,
    jokerUsedToday: false,
  };
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
