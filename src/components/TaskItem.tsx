import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
  const [newSubtask, setNewSubtask] = useState('');
  const toggleTask = useStore((s) => s.toggleTask);
  const toggleSubtask = useStore((s) => s.toggleSubtask);
  const addSubtask = useStore((s) => s.addSubtask);
  const removeSubtask = useStore((s) => s.removeSubtask);
  const removeTask = useStore((s) => s.removeTask);

  const doneCount = task.subtasks.filter((s) => s.done).length;
  const progress = task.subtasks.length
    ? `${doneCount}/${task.subtasks.length}`
    : null;

  const ageDays = Math.floor((Date.now() - task.createdAt) / 86400000);
  const stale = !task.done && ageDays >= 7;

  const submitSubtask = () => {
    const v = newSubtask.trim();
    if (!v) return;
    addSubtask(task.id, v);
    setNewSubtask('');
  };

  return (
    <View style={[styles.card, stale && styles.cardStale]}>
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
            {stale && <Text style={styles.staleTag}> · {ageDays}j</Text>}
          </View>
        </Pressable>
      </View>

      {open && (
        <View style={styles.body}>
          {task.note ? <Text style={styles.note}>{task.note}</Text> : null}
          {task.subtasks.map((s) => (
            <View key={s.id} style={styles.subRow}>
              <Pressable
                onPress={() => toggleSubtask(task.id, s.id)}
                hitSlop={6}
                style={styles.subTapZone}
              >
                <View style={[styles.subCheck, s.done && styles.subCheckDone]}>
                  {s.done && <Text style={styles.subCheckMark}>✓</Text>}
                </View>
                <Text style={[styles.subTitle, s.done && styles.titleDone]}>{s.title}</Text>
              </Pressable>
              <Pressable
                onPress={() => removeSubtask(task.id, s.id)}
                hitSlop={8}
                style={styles.subRemove}
              >
                <Text style={styles.subRemoveText}>×</Text>
              </Pressable>
            </View>
          ))}

          <View style={styles.addRow}>
            <TextInput
              value={newSubtask}
              onChangeText={setNewSubtask}
              placeholder="Ajouter une étape…"
              placeholderTextColor={c.textFaint}
              style={styles.addInput}
              onSubmitEditing={submitSubtask}
              returnKeyType="done"
              blurOnSubmit
            />
            {newSubtask.trim().length > 0 && (
              <Pressable onPress={submitSubtask} hitSlop={6} style={styles.addBtn}>
                <Text style={styles.addBtnText}>+</Text>
              </Pressable>
            )}
          </View>

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
    cardStale: { borderColor: c.warning, borderStyle: 'dashed' },
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
    staleTag: { ...type.small, color: c.warning, fontWeight: '700' },
    body: { marginTop: spacing.md, gap: spacing.sm },
    note: { ...type.small, color: c.textMuted, fontStyle: 'italic' },
    subRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.xs,
      gap: spacing.sm,
    },
    subTapZone: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
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
    subRemove: { paddingHorizontal: spacing.xs },
    subRemoveText: { fontSize: 18, color: c.textFaint, lineHeight: 18 },
    addRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    addInput: {
      flex: 1,
      ...type.small,
      color: c.text,
      backgroundColor: c.surfaceAlt,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    addBtn: {
      width: 32,
      height: 32,
      borderRadius: radius.md,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addBtnText: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: -2 },
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
