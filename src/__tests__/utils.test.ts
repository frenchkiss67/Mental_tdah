import {
  daysBetween,
  decomposeTask,
  formatTime,
  levelFromXp,
  pickWeightedRandomTask,
  todayKey,
  uid,
  xpForLevel,
} from '../utils';
import type { Task } from '../types';

describe('uid', () => {
  it('produces unique-ish ids over a batch', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 500; i++) ids.add(uid());
    expect(ids.size).toBe(500);
  });
});

describe('todayKey / daysBetween', () => {
  it('formats today as YYYY-MM-DD', () => {
    const k = todayKey();
    expect(k).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('counts days between consecutive dates', () => {
    expect(daysBetween('2026-01-01', '2026-01-02')).toBe(1);
    expect(daysBetween('2026-01-01', '2026-01-08')).toBe(7);
    expect(daysBetween('2026-01-31', '2026-02-01')).toBe(1);
    expect(daysBetween('2026-02-01', '2026-01-31')).toBe(-1);
  });
});

describe('formatTime', () => {
  it('renders mm:ss padded', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(5)).toBe('00:05');
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(3599)).toBe('59:59');
  });
});

describe('xpForLevel / levelFromXp', () => {
  it('xpForLevel grows linearly from 100', () => {
    expect(xpForLevel(1)).toBe(100);
    expect(xpForLevel(2)).toBe(250);
    expect(xpForLevel(3)).toBe(400);
  });

  it('levelFromXp accumulates across levels', () => {
    expect(levelFromXp(0)).toEqual({ level: 1, into: 0, need: 100 });
    expect(levelFromXp(50)).toEqual({ level: 1, into: 50, need: 100 });
    expect(levelFromXp(100)).toEqual({ level: 2, into: 0, need: 250 });
    expect(levelFromXp(349)).toEqual({ level: 2, into: 249, need: 250 });
    expect(levelFromXp(350)).toEqual({ level: 3, into: 0, need: 400 });
  });
});

describe('decomposeTask', () => {
  it('returns empty array when input is blank', () => {
    expect(decomposeTask('', undefined)).toEqual([]);
    expect(decomposeTask('   ', '   ')).toEqual([]);
  });

  it('respects explicit user separators over verb templates', () => {
    const out = decomposeTask('truc 1, truc 2, truc 3');
    expect(out.length).toBe(3);
    expect(out[0].title).toBe('Truc 1');
    expect(out.every((s) => !s.done)).toBe(true);
    expect(out.every((s) => s.estimatedMinutes === undefined)).toBe(true);
  });

  it('matches mail verb template with estimates', () => {
    const out = decomposeTask('Envoyer un mail à la sécu');
    expect(out.length).toBeGreaterThanOrEqual(3);
    expect(out[0].title).toMatch(/messagerie|destinataire|mail/i);
    expect(out.some((s) => s.estimatedMinutes !== undefined)).toBe(true);
  });

  it('matches "appeler" template', () => {
    const out = decomposeTask('Appeler le médecin');
    expect(out.length).toBeGreaterThanOrEqual(3);
    expect(out[0].title.toLowerCase()).toContain('numéro');
  });

  it('matches admin/paperwork template', () => {
    const out = decomposeTask('Faire les papiers de la voiture');
    expect(out.length).toBeGreaterThanOrEqual(3);
    expect(out[0].title.toLowerCase()).toMatch(/ouvrir|document|enveloppe/);
  });

  it('falls back to generic template when no verb matches', () => {
    const out = decomposeTask('Réfléchir au sens de la vie');
    expect(out.length).toBe(5);
    // Generic fallback should not include estimates.
    expect(out.every((s) => s.estimatedMinutes === undefined)).toBe(true);
  });

  it('every returned subtask has unique id, undone, capitalized title', () => {
    const out = decomposeTask('Envoyer un mail');
    const ids = new Set(out.map((s) => s.id));
    expect(ids.size).toBe(out.length);
    expect(out.every((s) => s.title[0] === s.title[0].toUpperCase())).toBe(true);
    expect(out.every((s) => s.done === false)).toBe(true);
  });
});

describe('pickWeightedRandomTask', () => {
  const makeTask = (id: string, priority: Task['priority'], done = false): Task => ({
    id,
    title: id,
    priority,
    subtasks: [],
    done,
    createdAt: 0,
  });

  it('returns null when no pending tasks', () => {
    expect(pickWeightedRandomTask([])).toBeNull();
    expect(pickWeightedRandomTask([makeTask('a', 'high', true)])).toBeNull();
  });

  it('always returns a pending task and never a done one', () => {
    const tasks = [
      makeTask('a', 'high'),
      makeTask('b', 'low', true),
      makeTask('c', 'normal'),
    ];
    for (let i = 0; i < 200; i++) {
      const picked = pickWeightedRandomTask(tasks);
      expect(picked).not.toBeNull();
      expect(picked!.done).toBe(false);
    }
  });

  it('biases toward high priority over many draws', () => {
    const tasks = [makeTask('h', 'high'), makeTask('l', 'low')];
    let hCount = 0;
    const N = 2000;
    for (let i = 0; i < N; i++) {
      if (pickWeightedRandomTask(tasks)!.id === 'h') hCount++;
    }
    // weight 3 vs 1 → expect ~75%. Allow generous margin for variance.
    expect(hCount / N).toBeGreaterThan(0.65);
    expect(hCount / N).toBeLessThan(0.85);
  });
});
