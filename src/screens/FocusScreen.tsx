import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { ZenMode } from '../components/ZenMode';
import { useStore } from '../store';
import { colors, radius, spacing, type } from '../theme';

const FOCUS_PRESETS = [10, 15, 25, 45];

export const FocusScreen: React.FC = () => {
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
                style={[
                  styles.preset,
                  settings.focusMinutes === m && styles.presetActive,
                ]}
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 100 },
  heading: { ...type.h1, color: colors.text },
  sub: { ...type.small, color: colors.textMuted, marginTop: -spacing.sm },
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  taskLabel: { ...type.tiny, color: colors.primary, textTransform: 'uppercase' },
  taskTitle: { ...type.body, color: colors.text },
  taskClear: { ...type.small, color: colors.textMuted, marginTop: spacing.xs },
  timerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presets: { gap: spacing.sm },
  presetLabel: { ...type.small, color: colors.textMuted },
  presetRow: { flexDirection: 'row', gap: spacing.sm },
  preset: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  presetText: { ...type.body, color: colors.textMuted, fontWeight: '700' },
  presetTextActive: { color: '#fff' },
});
