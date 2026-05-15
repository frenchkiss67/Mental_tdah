import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddTaskSheet } from '../components/AddTaskSheet';
import { CrisisModal } from '../components/CrisisModal';
import { EnergyCheck } from '../components/EnergyCheck';
import { NotesInbox } from '../components/NotesInbox';
import { StuckCard } from '../components/StuckCard';
import { TaskItem } from '../components/TaskItem';
import { useStore } from '../store';
import { type ColorScheme, radius, spacing, type, useColors } from '../theme';
import type { Task } from '../types';

type Filter = 'today' | 'all' | 'done';

type Props = {
  onStartFocus?: (taskId: string) => void;
  onGoFocus?: () => void;
};

const dayLabel = (timestamp: number): string => {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  if (diff < 7) {
    return d.toLocaleDateString('fr-FR', { weekday: 'long' });
  }
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
};

const dayKey = (timestamp: number): string => {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

export const TasksScreen: React.FC<Props> = ({ onStartFocus, onGoFocus }) => {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const tasks = useStore((s) => s.tasks);
  const gamification = useStore((s) => s.gamification);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>('today');

  const sortedNotDone = useMemo(() => {
    const pw = { high: 0, normal: 1, low: 2 } as const;
    return [...tasks]
      .filter((t) => !t.done)
      .sort((a, b) => {
        if (pw[a.priority] !== pw[b.priority]) return pw[a.priority] - pw[b.priority];
        return b.createdAt - a.createdAt;
      });
  }, [tasks]);

  const doneSections = useMemo(() => {
    const completed = tasks.filter((t) => t.done && t.completedAt);
    const groups = new Map<string, { date: number; items: Task[] }>();
    for (const t of completed) {
      const k = dayKey(t.completedAt!);
      const g = groups.get(k);
      if (g) {
        g.items.push(t);
      } else {
        groups.set(k, { date: t.completedAt!, items: [t] });
      }
    }
    return [...groups.values()]
      .sort((a, b) => b.date - a.date)
      .map((g) => ({ title: dayLabel(g.date), data: g.items }));
  }, [tasks]);

  const weeklyDoneCount = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    return tasks.filter((t) => t.done && t.completedAt && t.completedAt >= weekAgo).length;
  }, [tasks]);

  const filters: { key: Filter; label: string }[] = [
    { key: 'today', label: 'À faire' },
    { key: 'done', label: 'Faites' },
    { key: 'all', label: 'Toutes' },
  ];

  const Header = (
    <>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heading}>Tâches</Text>
            <Text style={styles.sub}>Une étape à la fois. Tu peux le faire.</Text>
          </View>
          <Pressable
            onPress={() => setCrisisOpen(true)}
            style={styles.crisisBtn}
            hitSlop={8}
          >
            <Text style={styles.crisisBtnText}>Trop ?</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.filterRow}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </>
  );

  if (filter === 'done') {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        {Header}
        <SectionList
          sections={doneSections}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.doneSummary}>
              <Text style={styles.doneSummaryNum}>{weeklyDoneCount}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.doneSummaryTitle}>
                  Cette semaine
                </Text>
                <Text style={styles.doneSummaryHint}>
                  {weeklyDoneCount === 0
                    ? 'Rien terminé pour l’instant. Pas grave.'
                    : weeklyDoneCount === 1
                      ? 'tâche terminée. Compte.'
                      : 'tâches terminées. Compte.'}
                </Text>
                {gamification.totalFocusMinutes > 0 && (
                  <Text style={styles.doneSummaryHint}>
                    {gamification.totalFocusMinutes} min de focus cumulées.
                  </Text>
                )}
              </View>
            </View>
          }
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }) => <TaskItem task={item} onStartFocus={onStartFocus} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Pas encore de tâches faites</Text>
              <Text style={styles.emptySub}>
                C’est normal. Coches-en une, ça apparaîtra ici.
              </Text>
            </View>
          }
          stickySectionHeadersEnabled={false}
        />
        <AddTaskSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
        <CrisisModal visible={crisisOpen} onClose={() => setCrisisOpen(false)} />
        <Pressable style={styles.fab} onPress={() => setSheetOpen(true)}>
          <Text style={styles.fabText}>＋</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const data = filter === 'all' ? [...sortedNotDone, ...tasks.filter((t) => t.done)] : sortedNotDone;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {Header}
      <FlatList<Task>
        data={data}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <EnergyCheck />
            <NotesInbox />
            {onGoFocus && <StuckCard onGoFocus={onGoFocus} />}
          </>
        }
        renderItem={({ item }) => <TaskItem task={item} onStartFocus={onStartFocus} />}
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
      <CrisisModal visible={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </SafeAreaView>
  );
};

const makeStyles = (c: ColorScheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    heading: { ...type.h1, color: c.text },
    sub: { ...type.small, color: c.textMuted, marginTop: spacing.xs },
    crisisBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    crisisBtnText: { ...type.small, color: c.text, fontWeight: '700' },
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
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    filterPillActive: { backgroundColor: c.primary, borderColor: c.primary },
    filterText: { ...type.small, color: c.textMuted },
    filterTextActive: { color: '#fff' },
    list: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
    empty: { padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
    emptyTitle: { ...type.h2, color: c.text, textAlign: 'center' },
    emptySub: { ...type.small, color: c.textMuted, textAlign: 'center' },
    doneSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: c.surfaceAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    doneSummaryNum: { fontSize: 44, fontWeight: '800', color: c.primary, minWidth: 60 },
    doneSummaryTitle: { ...type.h2, color: c.text },
    doneSummaryHint: { ...type.small, color: c.textMuted },
    sectionHeader: {
      ...type.tiny,
      color: c.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    fab: {
      position: 'absolute',
      bottom: spacing.xl,
      right: spacing.lg,
      backgroundColor: c.primary,
      width: 60,
      height: 60,
      borderRadius: 30,
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
