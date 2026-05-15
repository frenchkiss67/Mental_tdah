import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useStore } from '../store';
import { colors, radius, spacing, type } from '../theme';
import { formatTime } from '../utils';

type Props = {
  size?: number;
  compact?: boolean;
  onZenPress?: () => void;
};

export const PomodoroTimer: React.FC<Props> = ({ size = 240, compact = false, onZenPress }) => {
  useKeepAwake();
  const pomodoro = useStore((s) => s.pomodoro);
  const hapticsEnabled = useStore((s) => s.settings.hapticsEnabled);
  const togglePomodoro = useStore((s) => s.togglePomodoro);
  const resetPomodoro = useStore((s) => s.resetPomodoro);

  const STROKE = compact ? 10 : 14;
  const R = (size - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;

  const [, setTick] = useState(0);
  useEffect(() => {
    if (!pomodoro.running || pomodoro.endsAt === null) return;
    const id = setInterval(() => setTick((n) => n + 1), 500);
    return () => clearInterval(id);
  }, [pomodoro.running, pomodoro.endsAt]);

  const remainingSec = (() => {
    if (pomodoro.running && pomodoro.endsAt !== null) {
      return Math.max(0, Math.round((pomodoro.endsAt - Date.now()) / 1000));
    }
    if (pomodoro.pausedSecondsLeft !== null) return pomodoro.pausedSecondsLeft;
    return pomodoro.totalSec;
  })();

  const pct = pomodoro.totalSec === 0 ? 0 : remainingSec / pomodoro.totalSec;
  const dashOffset = CIRC * (1 - pct);

  const triggerHaptic = () => {
    if (!hapticsEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const onPrimary = async () => {
    triggerHaptic();
    await togglePomodoro();
  };

  const onReset = async () => {
    triggerHaptic();
    await resetPomodoro();
  };

  const phaseLabel =
    pomodoro.phase === 'idle'
      ? 'Prêt à démarrer'
      : pomodoro.phase === 'focus'
        ? 'Focus'
        : pomodoro.phase === 'break'
          ? 'Petite pause'
          : 'Grande pause';

  const primaryColor =
    pomodoro.phase === 'focus' || pomodoro.phase === 'idle' ? colors.primary : colors.accent;

  const primaryLabel =
    pomodoro.phase === 'idle' ? 'Démarrer' : pomodoro.running ? 'Pause' : 'Reprendre';

  const cycleDisplay = pomodoro.cycle + (pomodoro.phase === 'focus' ? 1 : 0);

  return (
    <View style={styles.wrap}>
      <View style={styles.phaseRow}>
        <Text style={[styles.phaseLabel, compact && styles.phaseLabelLight]}>
          {phaseLabel}
        </Text>
        {onZenPress && (
          <Pressable onPress={onZenPress} hitSlop={8} style={styles.zenBtn}>
            <Text style={styles.zenBtnText}>Mode zen</Text>
          </Pressable>
        )}
      </View>
      <View style={[styles.ringWrap, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={R}
            stroke={compact ? 'rgba(255,255,255,0.12)' : colors.surfaceAlt}
            strokeWidth={STROKE}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={R}
            stroke={compact ? '#fff' : primaryColor}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${CIRC},${CIRC}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.ringCenter} pointerEvents="none">
          <Text style={[styles.time, compact && styles.timeBig]}>
            {formatTime(remainingSec)}
          </Text>
          <Text style={[styles.cycle, compact && styles.cycleLight]}>Cycle {cycleDisplay}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable
          onPress={onReset}
          style={[styles.btn, compact ? styles.btnSecondaryDark : styles.btnSecondary]}
        >
          <Text
            style={[
              styles.btnTextSecondary,
              compact && { color: 'rgba(255,255,255,0.85)' },
            ]}
          >
            Reset
          </Text>
        </Pressable>
        <Pressable
          onPress={onPrimary}
          style={[styles.btn, { backgroundColor: compact ? '#fff' : primaryColor }]}
        >
          <Text style={[styles.btnText, compact && { color: '#1B1830' }]}>{primaryLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.lg },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  phaseLabel: { ...type.h2, color: colors.textMuted },
  phaseLabelLight: { color: 'rgba(255,255,255,0.7)' },
  zenBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  zenBtnText: { ...type.tiny, color: colors.primary, fontWeight: '700' },
  ringWrap: { alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  time: { fontSize: 48, fontWeight: '800', color: colors.text },
  timeBig: { fontSize: 64, color: '#fff' },
  cycle: { ...type.small, color: colors.textMuted, marginTop: spacing.xs },
  cycleLight: { color: 'rgba(255,255,255,0.6)' },
  controls: { flexDirection: 'row', gap: spacing.md },
  btn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    minWidth: 140,
    alignItems: 'center',
  },
  btnSecondary: { backgroundColor: colors.surfaceAlt },
  btnSecondaryDark: { backgroundColor: 'rgba(255,255,255,0.12)' },
  btnText: { color: '#fff', ...type.body, fontWeight: '700' },
  btnTextSecondary: { color: colors.textMuted, ...type.body, fontWeight: '700' },
});
