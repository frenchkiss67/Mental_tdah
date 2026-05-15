import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { colors, radius, spacing, type } from '../theme';
import { PomodoroTimer } from './PomodoroTimer';

type Props = { visible: boolean; onClose: () => void };

export const ZenMode: React.FC<Props> = ({ visible, onClose }) => {
  const currentTaskId = useStore((s) => s.currentTaskId);
  const tasks = useStore((s) => s.tasks);
  const currentTask = tasks.find((t) => t.id === currentTaskId) ?? null;

  return (
    <Modal animationType="fade" visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" hidden />
        <View style={styles.topBar}>
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <Text style={styles.closeText}>Quitter le zen</Text>
          </Pressable>
        </View>

        <View style={styles.center}>
          {currentTask && (
            <View style={styles.taskWrap}>
              <Text style={styles.taskLabel}>Une seule chose</Text>
              <Text style={styles.taskTitle}>{currentTask.title}</Text>
            </View>
          )}
          <PomodoroTimer size={300} compact />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Respire. Une étape à la fois.</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1B1830' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  closeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  closeText: { color: '#fff', ...type.small, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl, paddingHorizontal: spacing.lg },
  taskWrap: { alignItems: 'center', gap: spacing.xs, maxWidth: '90%' },
  taskLabel: { ...type.tiny, color: colors.primarySoft, textTransform: 'uppercase', letterSpacing: 2 },
  taskTitle: { ...type.h1, color: '#fff', textAlign: 'center' },
  footer: { padding: spacing.lg, alignItems: 'center' },
  footerText: { color: 'rgba(255,255,255,0.5)', ...type.small },
});
