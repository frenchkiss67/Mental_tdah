import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, type } from '../theme';
import { useStore } from '../store';
import type { Task } from '../types';

type Props = {
  task: Task;
  onStartFocus?: (taskId: string) => void;
};

const priorityColor = (p: Task['priority']) =>
  p === 'high' ? colors.danger : p === 'low' ? colors.textFaint : colors.primarySoft;

export const TaskItem: React.FC<Props> = ({ task, onStartFocus }) => {
  const [open, setOpen] = useState(false);
  const toggleTask = useStore((s) => s.toggleTask);
  const toggleSubtask = useStore((s) => s.toggleSubtask);
  const removeTask = useStore((s) => s.removeTask);

  const doneCount = task.subtasks.filter((s) => s.done).length;
  const progress = task.subtasks.length
    ? `${doneCount}/${task.subtasks.length}`
    : null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => toggleTask(task.id)}
          hitSlop={10}
          style={[styles.check, task.done && styles.checkDone]}
        >
          {task.done && <Text style={styles.checkMark}>✓</Text>}
        </Pressable>

        <Pressable style={styles.titleArea} onPress={() => setOpen((v) => !v)}>
          <Text
            numberOfLines={open ? undefined : 2}
            style={[styles.title, task.done && styles.titleDone]}
          >
            {task.title}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.dot, { backgroundColor: priorityColor(task.priority) }]} />
            <Text style={styles.meta}>
              {task.priority === 'high'
                ? 'Priorité haute'
                : task.priority === 'low'
                  ? 'Priorité basse'
                  : 'Priorité normale'}
            </Text>
            {progress && <Text style={styles.meta}> · {progress} étapes</Text>}
          </View>
        </Pressable>
      </View>

      {open && (
        <View style={styles.body}>
          {task.note ? <Text style={styles.note}>{task.note}</Text> : null}
          {task.subtasks.map((s) => (
            <Pressable
              key={s.id}
              style={styles.subRow}
              onPress={() => toggleSubtask(task.id, s.id)}
            >
              <View style={[styles.subCheck, s.done && styles.subCheckDone]}>
                {s.done && <Text style={styles.subCheckMark}>✓</Text>}
              </View>
              <Text style={[styles.subTitle, s.done && styles.titleDone]}>{s.title}</Text>
            </Pressable>
          ))}

          <View style={styles.actions}>
            {onStartFocus && (
              <Pressable
                style={[styles.actionBtn, styles.focusBtn]}
                onPress={() => onStartFocus(task.id)}
              >
                <Text style={styles.focusBtnText}>Lancer un focus</Text>
              </Pressable>
            )}
            <Pressable style={styles.actionBtn} onPress={() => removeTask(task.id)}>
              <Text style={styles.deleteText}>Supprimer</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkMark: { color: '#fff', fontWeight: '800' },
  titleArea: { flex: 1 },
  title: { ...type.body, color: colors.text },
  titleDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.xs },
  meta: { ...type.small, color: colors.textMuted },
  body: { marginTop: spacing.md, gap: spacing.sm },
  note: { ...type.small, color: colors.textMuted, fontStyle: 'italic' },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  subCheck: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subCheckDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  subCheckMark: { color: '#fff', fontSize: 12, fontWeight: '800' },
  subTitle: { ...type.small, color: colors.text, flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  focusBtn: { backgroundColor: colors.primary },
  focusBtnText: { color: '#fff', ...type.small },
  deleteText: { color: colors.danger, ...type.small },
});
