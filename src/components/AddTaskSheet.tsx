import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { decomposeWithAI } from '../services/ai';
import { useStore } from '../store';
import { type ColorScheme, radius, spacing, type, useColors } from '../theme';
import type { Priority } from '../types';
import { decomposeTask } from '../utils';

type Props = { visible: boolean; onClose: () => void };

const priorities: { key: Priority; label: string }[] = [
  { key: 'low', label: 'Basse' },
  { key: 'normal', label: 'Normale' },
  { key: 'high', label: 'Haute' },
];

export const AddTaskSheet: React.FC<Props> = ({ visible, onClose }) => {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const addTaskWithSubtasks = useStore((s) => s.addTaskWithSubtasks);
  const settings = useStore((s) => s.settings);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [loading, setLoading] = useState(false);

  const canUseAi = settings.aiDecompositionEnabled && !!settings.anthropicApiKey;

  const submit = async () => {
    const t = title.trim();
    if (!t) return;
    let subtasks = decomposeTask(t, note || undefined);

    if (canUseAi) {
      setLoading(true);
      try {
        subtasks = await decomposeWithAI(t, note || undefined, settings.anthropicApiKey!);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur IA';
        Alert.alert('Décomposition IA indisponible', `${msg}\n\nFallback heuristique utilisé.`);
      } finally {
        setLoading(false);
      }
    }

    addTaskWithSubtasks(t, note || undefined, priority, subtasks);
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
            {canUseAi
              ? 'Décris la tâche, l’IA la découpe en micro-étapes.'
              : 'Décris simplement, on découpe automatiquement.'}
          </Text>
          <Text style={styles.tip}>
            🎤 Tu peux dicter avec le micro de ton clavier.
          </Text>

          <TextInput
            placeholder="Ex: Préparer le dossier d'inscription"
            placeholderTextColor={c.textFaint}
            style={[styles.input, styles.titleInput]}
            value={title}
            onChangeText={setTitle}
            autoFocus
            editable={!loading}
            multiline
          />

          <TextInput
            placeholder="Notes (optionnel)"
            placeholderTextColor={c.textFaint}
            style={[styles.input, styles.multiline]}
            value={note}
            onChangeText={setNote}
            multiline
            editable={!loading}
          />

          <Text style={styles.label}>Priorité</Text>
          <View style={styles.priorityRow}>
            {priorities.map((p) => (
              <Pressable
                key={p.key}
                onPress={() => setPriority(p.key)}
                style={[styles.pill, priority === p.key && styles.pillActive]}
                disabled={loading}
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
            style={[styles.submit, (!title.trim() || loading) && styles.submitDisabled]}
            disabled={!title.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>
                {canUseAi ? 'Ajouter (IA)' : 'Ajouter'}
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const makeStyles = (c: ColorScheme) =>
  StyleSheet.create({
    backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
    backdropTouch: { flex: 1 },
    sheet: {
      backgroundColor: c.bg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      gap: spacing.md,
    },
    heading: { ...type.h1, color: c.text },
    hint: { ...type.small, color: c.textMuted },
    tip: { ...type.tiny, color: c.textFaint },
    input: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: c.border,
      ...type.body,
      color: c.text,
    },
    multiline: { minHeight: 80, textAlignVertical: 'top' },
    titleInput: { minHeight: 60, textAlignVertical: 'top' },
    label: { ...type.small, color: c.textMuted },
    priorityRow: { flexDirection: 'row', gap: spacing.sm },
    pill: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    pillActive: { backgroundColor: c.primary, borderColor: c.primary },
    pillText: { color: c.textMuted, ...type.small },
    pillTextActive: { color: '#fff' },
    submit: {
      backgroundColor: c.primary,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    submitDisabled: { backgroundColor: c.primarySoft, opacity: 0.6 },
    submitText: { color: '#fff', ...type.body, fontWeight: '700' },
  });
