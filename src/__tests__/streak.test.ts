import { bumpStreakState } from '../utils';
import { JOKER_INITIAL, type GamificationState } from '../types';

const base: GamificationState = {
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDay: null,
  totalTasksDone: 0,
  totalFocusMinutes: 0,
  jokers: JOKER_INITIAL,
  jokerUsedToday: false,
};

describe('bumpStreakState', () => {
  it('starts streak at 1 on first call', () => {
    const next = bumpStreakState(base, '2026-01-01');
    expect(next.streak).toBe(1);
    expect(next.lastActiveDay).toBe('2026-01-01');
    expect(next.jokers).toBe(JOKER_INITIAL);
    expect(next.jokerUsedToday).toBe(false);
  });

  it('is idempotent on the same day', () => {
    const after = bumpStreakState(base, '2026-01-01');
    const again = bumpStreakState(after, '2026-01-01');
    expect(again).toBe(after);
  });

  it('+1 on consecutive day, no joker change', () => {
    const d1 = bumpStreakState(base, '2026-01-01');
    const d2 = bumpStreakState(d1, '2026-01-02');
    expect(d2.streak).toBe(2);
    expect(d2.jokers).toBe(JOKER_INITIAL);
    expect(d2.jokerUsedToday).toBe(false);
  });

  it('earns a joker at streak 7, capped at 3', () => {
    let s = bumpStreakState(base, '2026-01-01');
    const days = [
      '2026-01-02',
      '2026-01-03',
      '2026-01-04',
      '2026-01-05',
      '2026-01-06',
      '2026-01-07',
    ];
    for (const d of days) s = bumpStreakState(s, d);
    expect(s.streak).toBe(7);
    expect(s.jokers).toBe(Math.min(3, JOKER_INITIAL + 1));
  });

  it('consumes one joker on 1-day gap and keeps streak alive', () => {
    let s = bumpStreakState(base, '2026-01-01');
    s = bumpStreakState(s, '2026-01-02');
    expect(s.streak).toBe(2);
    // Skip 2026-01-03.
    const after = bumpStreakState(s, '2026-01-04');
    expect(after.streak).toBe(3);
    expect(after.jokers).toBe(JOKER_INITIAL - 1);
    expect(after.jokerUsedToday).toBe(true);
  });

  it('resets to 1 when gap exceeds available jokers', () => {
    let s = bumpStreakState(base, '2026-01-01');
    s = bumpStreakState(s, '2026-01-02');
    // 5-day gap, only 2 jokers available → reset.
    const after = bumpStreakState(s, '2026-01-08');
    expect(after.streak).toBe(1);
    expect(after.jokers).toBe(JOKER_INITIAL); // unchanged on reset
    expect(after.jokerUsedToday).toBe(false);
  });

  it('clears jokerUsedToday on a normal consecutive day after a save', () => {
    let s = bumpStreakState(base, '2026-01-01');
    s = bumpStreakState(s, '2026-01-03'); // joker used
    expect(s.jokerUsedToday).toBe(true);
    s = bumpStreakState(s, '2026-01-04');
    expect(s.jokerUsedToday).toBe(false);
  });

  it('caps jokers at 3 even on repeated milestones', () => {
    let s: GamificationState = { ...base, jokers: 3 };
    s = bumpStreakState(s, '2026-01-01');
    const days = [
      '2026-01-02',
      '2026-01-03',
      '2026-01-04',
      '2026-01-05',
      '2026-01-06',
      '2026-01-07',
    ];
    for (const d of days) s = bumpStreakState(s, d);
    expect(s.streak).toBe(7);
    expect(s.jokers).toBe(3);
  });
});
