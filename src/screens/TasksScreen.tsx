import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddTaskSheet } from '../components/AddTaskSheet';
import { TaskItem } from '../components/TaskItem';
import { useStore } from '../store';
import { colors, radius, spacing, type } from '../theme';
import type { Task } from '../types';

type Filter = 'today' | 'all' | 'done';

type Props = { onStartFocus?: (taskId: string) => void };

export const TasksScreen: React.FC<Props> = ({ onStartFocus }) => {
  const tasks = useStore((s) => s.tasks);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>('today');

  const filtered = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const pw = { high: 0, normal: 1, low: 2 } as const;
      if (pw[a.priority] !== pw[b.priority]) return pw[a.priority] - pw[b.priority];
      return b.createdAt - a.createdAt;
    });
    if (filter === 'done') return sorted.filter((t) => t.done);
    if (filter === 'all') return sorted;
    return sorted.filter((t) => !t.done);
  }, [tasks, filter]);

  const filters: { key: Filter; label: string }[] = [
    { key: 'today', label: 'À faire' },
    { key: 'done', label: 'Faites' },
    { key: 'all', label: 'Toutes' },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.heading}>Tâches</Text>
        <Text style={styles.sub}>Une étape à la fois. Tu peux le faire.</Text>
      </View>

      <View style={styles.filterRow}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
          >
            <Text
              style={[styles.filterText, filter === f.key && styles.filterTextActive]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList<Task>
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TaskItem task={item} onStartFocus={onStartFocus} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Aucune tâche ici</Text>
            <Text style={styles.emptySub}>
              Commence petit. Ajoute UNE tâche que tu repousses depuis longtemps.
            </Text>
          </View>
        }
      />

      <Pressable style={styles.fab} onPress={() => setSheetOpen(true)}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>

      <AddTaskSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  heading: { ...type.h1, color: colors.text },
  sub: { ...type.small, color: colors.textMuted, marginTop: spacing.xs },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { ...type.small, color: colors.textMuted },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
  empty: { padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  emptyTitle: { ...type.h2, color: colors.text, textAlign: 'center' },
  emptySub: { ...type.small, color: colors.textMuted, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 32, fontWeight: '700', marginTop: -2 },
});
