import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../store';
import { colors, radius, spacing, type } from '../theme';
import type { Routine } from '../types';
import { todayKey } from '../utils';

const DAYS_ABBR = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

type Props = { routine: Routine };

export const RoutineItem: React.FC<Props> = ({ routine }) => {
  const toggle = useStore((s) => s.toggleRoutineToday);
  const remove = useStore((s) => s.removeRoutine);
  const isToday = routine.lastCompletedDay === todayKey();

  const dayLabel =
    routine.days.length === 7
      ? 'Tous les jours'
      : routine.days
          .slice()
          .sort()
          .map((d) => DAYS_ABBR[d])
          .join(' ');

  return (
    <View style={[styles.card, isToday && styles.cardDone]}>
      <Pressable onPress={() => toggle(routine.id)} style={styles.row} hitSlop={8}>
        <View style={[styles.check, isToday && styles.checkDone]}>
          {isToday && <Text style={styles.checkMark}>✓</Text>}
        </View>

        <View style={styles.body}>
          <Text style={[styles.title, isToday && styles.titleDone]}>
            {routine.emoji ? `${routine.emoji}  ` : ''}
            {routine.title}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{dayLabel}</Text>
            {routine.scheduledTime && (
              <Text style={styles.meta}> · {routine.scheduledTime}</Text>
            )}
            {routine.streak > 1 && (
              <Text style={styles.streak}> · {routine.streak}j</Text>
            )}
          </View>
        </View>
      </Pressable>
      <Pressable onPress={() => remove(routine.id)} hitSlop={10}>
        <Text style={styles.delete}>×</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardDone: { backgroundColor: colors.surfaceAlt, borderColor: colors.primarySoft },
  row: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.md, paddingVertical: spacing.sm },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkMark: { color: '#fff', fontWeight: '800', fontSize: 14 },
  body: { flex: 1 },
  title: { ...type.body, color: colors.text },
  titleDone: { color: colors.textMuted },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  meta: { ...type.small, color: colors.textMuted },
  streak: { ...type.small, color: colors.accent, fontWeight: '700' },
  delete: { fontSize: 22, color: colors.textFaint, paddingHorizontal: spacing.sm },
});
