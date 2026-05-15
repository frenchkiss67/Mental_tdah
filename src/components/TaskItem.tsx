import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../store';
import { type ColorScheme, radius, spacing, type, useColors } from '../theme';
import type { Task } from '../types';

type Props = {
  task: Task;
  onStartFocus?: (taskId: string) => void;
};

const priorityColor = (p: Task['priority'], c: ColorScheme) =>
  p === 'high' ? c.danger : p === 'low' ? c.textFaint : c.primarySoft;

export const TaskItem: React.FC<Props> = ({ task, onStartFocus }) => {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
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
            <View style={[styles.dot, { backgroundColor: priorityColor(task.priority, c) }]} />
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

const makeStyles = (c: ColorScheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: c.border,
    },
    headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
    check: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    checkDone: { backgroundColor: c.primary, borderColor: c.primary },
    checkMark: { color: '#fff', fontWeight: '800' },
    titleArea: { flex: 1 },
    title: { ...type.body, color: c.text },
    titleDone: { textDecorationLine: 'line-through', color: c.textMuted },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.xs },
    meta: { ...type.small, color: c.textMuted },
    body: { marginTop: spacing.md, gap: spacing.sm },
    note: { ...type.small, color: c.textMuted, fontStyle: 'italic' },
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
      borderColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subCheckDone: { backgroundColor: c.accent, borderColor: c.accent },
    subCheckMark: { color: '#fff', fontSize: 12, fontWeight: '800' },
    subTitle: { ...type.small, color: c.text, flex: 1 },
    actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    actionBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: c.surfaceAlt,
    },
    focusBtn: { backgroundColor: c.primary },
    focusBtnText: { color: '#fff', ...type.small },
    deleteText: { color: c.danger, ...type.small },
  });
