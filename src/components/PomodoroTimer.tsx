import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, radius, spacing, type } from '../theme';
import { useStore } from '../store';
import { formatTime } from '../utils';

type Phase = 'idle' | 'focus' | 'break' | 'longBreak';

const SIZE = 240;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export const PomodoroTimer: React.FC = () => {
  useKeepAwake();
  const settings = useStore((s) => s.settings);
  const hapticsEnabled = settings.hapticsEnabled;
  const awardFocusSession = useStore((s) => s.awardFocusSession);

  const [phase, setPhase] = useState<Phase>('idle');
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(settings.focusMinutes * 60);
  const [totalSec, setTotalSec] = useState(settings.focusMinutes * 60);
  const [cycle, setCycle] = useState(0);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  const phaseMinutes = (p: Phase): number => {
    if (p === 'focus') return settings.focusMinutes;
    if (p === 'break') return settings.breakMinutes;
    if (p === 'longBreak') return settings.longBreakMinutes;
    return settings.focusMinutes;
  };

  // Keep timer aligned with current settings when idle.
  useEffect(() => {
    if (phase === 'idle' && !running) {
      const sec = settings.focusMinutes * 60;
      setSecondsLeft(sec);
      setTotalSec(sec);
    }
  }, [settings.focusMinutes, phase, running]);

  const triggerHaptic = (kind: 'success' | 'warn') => {
    if (!hapticsEnabled) return;
    if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const startPhase = (p: Phase) => {
    const sec = phaseMinutes(p) * 60;
    setPhase(p);
    setSecondsLeft(sec);
    setTotalSec(sec);
    setRunning(true);
  };

  const finishPhase = () => {
    if (interval.current) clearInterval(interval.current);
    interval.current = null;
    setRunning(false);
    triggerHaptic('success');

    if (phase === 'focus') {
      awardFocusSession(totalSec);
      const nextCycle = cycle + 1;
      setCycle(nextCycle);
      const isLong =
        settings.cyclesBeforeLongBreak > 0 &&
        nextCycle % settings.cyclesBeforeLongBreak === 0;
      startPhase(isLong ? 'longBreak' : 'break');
    } else {
      startPhase('focus');
    }
  };

  useEffect(() => {
    if (!running) {
      if (interval.current) {
        clearInterval(interval.current);
        interval.current = null;
      }
      return;
    }
    interval.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // schedule transition via microtask to avoid setState during setState
          setTimeout(finishPhase, 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase]);

  const onPrimary = () => {
    triggerHaptic('warn');
    if (phase === 'idle') {
      startPhase('focus');
      return;
    }
    setRunning((r) => !r);
  };

  const onReset = () => {
    triggerHaptic('warn');
    if (interval.current) clearInterval(interval.current);
    interval.current = null;
    setRunning(false);
    setPhase('idle');
    setCycle(0);
    const sec = settings.focusMinutes * 60;
    setSecondsLeft(sec);
    setTotalSec(sec);
  };

  const pct = totalSec === 0 ? 0 : secondsLeft / totalSec;
  const dashOffset = CIRC * (1 - pct);

  const phaseLabel =
    phase === 'idle'
      ? 'Prêt à démarrer'
      : phase === 'focus'
        ? 'Focus'
        : phase === 'break'
          ? 'Petite pause'
          : 'Grande pause';

  const primaryColor = phase === 'focus' || phase === 'idle' ? colors.primary : colors.accent;

  return (
    <View style={styles.wrap}>
      <Text style={styles.phaseLabel}>{phaseLabel}</Text>
      <View style={styles.ringWrap}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={colors.surfaceAlt}
            strokeWidth={STROKE}
            fill="none"
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={primaryColor}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${CIRC},${CIRC}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
        <View style={styles.ringCenter} pointerEvents="none">
          <Text style={styles.time}>{formatTime(secondsLeft)}</Text>
          <Text style={styles.cycle}>Cycle {cycle + (phase === 'focus' ? 1 : 0)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={onReset} style={[styles.btn, styles.btnSecondary]}>
          <Text style={styles.btnTextSecondary}>Reset</Text>
        </Pressable>
        <Pressable onPress={onPrimary} style={[styles.btn, { backgroundColor: primaryColor }]}>
          <Text style={styles.btnText}>
            {phase === 'idle' ? 'Démarrer' : running ? 'Pause' : 'Reprendre'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.lg },
  phaseLabel: { ...type.h2, color: colors.textMuted },
  ringWrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: { fontSize: 48, fontWeight: '800', color: colors.text },
  cycle: { ...type.small, color: colors.textMuted, marginTop: spacing.xs },
  controls: { flexDirection: 'row', gap: spacing.md },
  btn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    minWidth: 140,
    alignItems: 'center',
  },
  btnSecondary: { backgroundColor: colors.surfaceAlt },
  btnText: { color: '#fff', ...type.body, fontWeight: '700' },
  btnTextSecondary: { color: colors.textMuted, ...type.body, fontWeight: '700' },
});
