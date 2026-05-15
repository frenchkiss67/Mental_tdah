import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../store';
import { type ColorScheme, radius, spacing, type, useColors } from '../theme';
import type { EnergyLevel } from '../types';
import { todayKey } from '../utils';

const LEVELS: { value: EnergyLevel; emoji: string; label: string }[] = [
  { value: 1, emoji: '🪫', label: 'Vidé' },
  { value: 2, emoji: '🥱', label: 'Bas' },
  { value: 3, emoji: '🙂', label: 'OK' },
  { value: 4, emoji: '⚡', label: 'Plein' },
];

const labelFor = (v: EnergyLevel): string =>
  LEVELS.find((l) => l.value === v)?.label ?? '';

export const EnergyCheck: React.FC = () => {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const mood = useStore((s) => s.mood);
  const setEnergy = useStore((s) => s.setEnergy);
  const clearEnergy = useStore((s) => s.clearEnergy);

  const today = todayKey();
  const isToday = mood.energyDay === today && mood.energyValue !== null;

  if (isToday && mood.energyValue !== null) {
    return (
      <View style={styles.compact}>
        <Text style={styles.compactText}>
          Aujourd’hui tu te sens : <Text style={styles.compactValue}>{labelFor(mood.energyValue)}</Text>
        </Text>
        <Pressable onPress={clearEnergy} hitSlop={8}>
          <Text style={styles.modify}>modifier</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Comment tu vas ?</Text>
      <View style={styles.row}>
        {LEVELS.map((l) => (
          <Pressable
            key={l.value}
            onPress={() => setEnergy(l.value)}
            style={styles.btn}
          >
            <Text style={styles.emoji}>{l.emoji}</Text>
            <Text style={styles.btnLabel}>{l.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const makeStyles = (c: ColorScheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: c.border,
      gap: spacing.sm,
    },
    label: {
      ...type.tiny,
      color: c.primary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    row: { flexDirection: 'row', gap: spacing.xs, justifyContent: 'space-between' },
    btn: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      alignItems: 'center',
      backgroundColor: c.surfaceAlt,
      gap: 2,
    },
    emoji: { fontSize: 26 },
    btnLabel: { ...type.tiny, color: c.textMuted, fontWeight: '700' },
    compact: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginBottom: spacing.md,
      backgroundColor: c.surfaceAlt,
      borderRadius: radius.md,
    },
    compactText: { ...type.small, color: c.textMuted },
    compactValue: { color: c.text, fontWeight: '700' },
    modify: { ...type.tiny, color: c.primary, fontWeight: '700' },
  });
