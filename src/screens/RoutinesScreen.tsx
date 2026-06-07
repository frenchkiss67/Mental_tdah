import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddRoutineSheet } from '../components/AddRoutineSheet';
import { RoutineItem } from '../components/RoutineItem';
import { useStore } from '../store';
import { type ColorScheme, radius, spacing, type, useColors } from '../theme';
import type { Routine } from '../types';
import { todayKey } from '../utils';

export const RoutinesScreen: React.FC = () => {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const routines = useStore((s) => s.routines);
  const [sheetOpen, setSheetOpen] = useState(false);

  const today = todayKey();
  const todayDayOfWeek = new Date().getDay();

  const sorted = [...routines].sort((a, b) => {
    const aDone = a.lastCompletedDay === today ? 1 : 0;
    const bDone = b.lastCompletedDay === today ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    // Medication ahead of habits for same done state — they're priority.
    const aMed = a.kind === 'medication' ? 0 : 1;
    const bMed = b.kind === 'medication' ? 0 : 1;
    if (aMed !== bMed) return aMed - bMed;
    return a.createdAt - b.createdAt;
  });

  const todayCount = routines.filter((r) => r.days.includes(todayDayOfWeek)).length;
  const todayDone = routines.filter(
    (r) => r.days.includes(todayDayOfWeek) && r.lastCompletedDay === today,
  ).length;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.heading}>Routines</Text>
        <Text style={styles.sub}>
          {todayCount === 0
            ? 'Aucune routine prévue aujourd’hui.'
            : `Aujourd’hui : ${todayDone}/${todayCount} faites.`}
        </Text>
      </View>

      <FlatList<Routine>
        data={sorted}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <RoutineItem routine={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Pas encore de routine</Text>
            <Text style={styles.emptySub}>
              Une routine = une habitude à répéter. Ajoute-en une simple pour commencer.
            </Text>
          </View>
        }
      />

      <Pressable style={styles.fab} onPress={() => setSheetOpen(true)}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>

      <AddRoutineSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </SafeAreaView>
  );
};

const makeStyles = (c: ColorScheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md },
    heading: { ...type.h1, color: c.text },
    sub: { ...type.small, color: c.textMuted, marginTop: spacing.xs },
    list: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
    empty: { padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
    emptyTitle: { ...type.h2, color: c.text, textAlign: 'center' },
    emptySub: { ...type.small, color: c.textMuted, textAlign: 'center' },
    fab: {
      position: 'absolute',
      bottom: spacing.xl,
      right: spacing.lg,
      backgroundColor: c.primary,
      width: 60,
      height: 60,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: c.primary,
      shadowOpacity: 0.35,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 12,
      elevation: 6,
    },
    fabText: { color: '#fff', fontSize: 32, fontWeight: '700', marginTop: -2 },
  });
