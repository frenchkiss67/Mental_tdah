import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, radius, spacing, type } from '../theme';
import { useStore } from '../store';
import type { Priority } from '../types';

type Props = { visible: boolean; onClose: () => void };

const priorities: { key: Priority; label: string }[] = [
  { key: 'low', label: 'Basse' },
  { key: 'normal', label: 'Normale' },
  { key: 'high', label: 'Haute' },
];

export const AddTaskSheet: React.FC<Props> = ({ visible, onClose }) => {
  const addTask = useStore((s) => s.addTask);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');

  const submit = () => {
    if (!title.trim()) return;
    addTask(title, note || undefined, priority);
    setTitle('');
    setNote('');
    setPriority('normal');
    onClose();
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={styles.backdropTouch} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.heading}>Nouvelle tâche</Text>
          <Text style={styles.hint}>
            Décris la tâche simplement. On la découpe en micro-étapes automatiquement.
          </Text>

          <TextInput
            placeholder="Ex: Préparer le dossier d'inscription"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          <TextInput
            placeholder="Notes (étapes séparées par virgules, ou laisser vide)"
            placeholderTextColor={colors.textFaint}
            style={[styles.input, styles.multiline]}
            value={note}
            onChangeText={setNote}
            multiline
          />

          <Text style={styles.label}>Priorité</Text>
          <View style={styles.priorityRow}>
            {priorities.map((p) => (
              <Pressable
                key={p.key}
                onPress={() => setPriority(p.key)}
                style={[styles.pill, priority === p.key && styles.pillActive]}
              >
                <Text
                  style={[styles.pillText, priority === p.key && styles.pillTextActive]}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={submit}
            style={[styles.submit, !title.trim() && styles.submitDisabled]}
            disabled={!title.trim()}
          >
            <Text style={styles.submitText}>Ajouter</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  backdropTouch: { flex: 1 },
  sheet: {
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    gap: spacing.md,
  },
  heading: { ...type.h1, color: colors.text },
  hint: { ...type.small, color: colors.textMuted },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...type.body,
    color: colors.text,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  label: { ...type.small, color: colors.textMuted },
  priorityRow: { flexDirection: 'row', gap: spacing.sm },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { color: colors.textMuted, ...type.small },
  pillTextActive: { color: '#fff' },
  submit: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitDisabled: { backgroundColor: colors.primarySoft, opacity: 0.6 },
  submitText: { color: '#fff', ...type.body, fontWeight: '700' },
});
