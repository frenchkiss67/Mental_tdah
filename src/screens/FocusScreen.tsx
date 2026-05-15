import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { ZenMode } from '../components/ZenMode';
import { useStore } from '../store';
import { type ColorScheme, radius, spacing, type, useColors } from '../theme';

const FOCUS_PRESETS = [10, 15, 25, 45];

export const FocusScreen: React.FC = () => {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const currentTaskId = useStore((s) => s.currentTaskId);
  const tasks = useStore((s) => s.tasks);
  const setCurrentTask = useStore((s) => s.setCurrentTask);
  const [zenOpen, setZenOpen] = useState(false);

  const currentTask = tasks.find((t) => t.id === currentTaskId) ?? null;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Focus</Text>
        <Text style={styles.sub}>
          Cycles courts adaptés au TDAH. Démarre, fais ce que tu peux.
        </Text>

        {currentTask && (
          <View style={styles.taskCard}>
            <Text style={styles.taskLabel}>Tâche en cours</Text>
            <Text style={styles.taskTitle}>{currentTask.title}</Text>
            <Pressable onPress={() => setCurrentTask(null)}>
              <Text style={styles.taskClear}>Détacher</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.timerCard}>
          <PomodoroTimer onZenPress={() => setZenOpen(true)} />
        </View>

        <View style={styles.presets}>
          <Text style={styles.presetLabel}>Durée focus (min)</Text>
          <View style={styles.presetRow}>
            {FOCUS_PRESETS.map((m) => (
              <Pressable
                key={m}
                onPress={() => updateSettings({ focusMinutes: m })}
                style={[styles.preset, settings.focusMinutes === m && styles.presetActive]}
              >
                <Text
                  style={[
                    styles.presetText,
                    settings.focusMinutes === m && styles.presetTextActive,
                  ]}
                >
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <ZenMode visible={zenOpen} onClose={() => setZenOpen(false)} />
    </SafeAreaView>
  );
};

const makeStyles = (c: ColorScheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 100 },
    heading: { ...type.h1, color: c.text },
    sub: { ...type.small, color: c.textMuted, marginTop: -spacing.sm },
    taskCard: {
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: c.border,
      gap: spacing.xs,
    },
    taskLabel: { ...type.tiny, color: c.primary, textTransform: 'uppercase' },
    taskTitle: { ...type.body, color: c.text },
    taskClear: { ...type.small, color: c.textMuted, marginTop: spacing.xs },
    timerCard: {
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
    },
    presets: { gap: spacing.sm },
    presetLabel: { ...type.small, color: c.textMuted },
    presetRow: { flexDirection: 'row', gap: spacing.sm },
    preset: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      alignItems: 'center',
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    presetActive: { backgroundColor: c.primary, borderColor: c.primary },
    presetText: { ...type.body, color: c.textMuted, fontWeight: '700' },
    presetTextActive: { color: '#fff' },
  });
