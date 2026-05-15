import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useStore } from '../store';
import { type ColorScheme, radius, spacing, type, useColors } from '../theme';

export const NotesInbox: React.FC = () => {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const notes = useStore((s) => s.notes);
  const addNote = useStore((s) => s.addNote);
  const archiveNote = useStore((s) => s.archiveNote);
  const removeNote = useStore((s) => s.removeNote);
  const convertNoteToTask = useStore((s) => s.convertNoteToTask);

  const [draft, setDraft] = useState('');
  const [expanded, setExpanded] = useState(false);

  const active = notes.filter((n) => !n.archivedAt);

  const submit = () => {
    const t = draft.trim();
    if (!t) return;
    addNote(t);
    setDraft('');
  };

  const onConvert = (id: string) => {
    convertNoteToTask(id);
  };

  const onArchive = (id: string) => {
    Alert.alert('Cette pensée ?', undefined, [
      { text: 'Garder', style: 'cancel' },
      { text: 'Archiver', onPress: () => archiveNote(id) },
      { text: 'Supprimer', style: 'destructive', onPress: () => removeNote(id) },
    ]);
  };

  const visible = expanded ? active : active.slice(0, 2);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Vider la tête</Text>
        {active.length > 2 && (
          <Pressable onPress={() => setExpanded((v) => !v)} hitSlop={8}>
            <Text style={styles.toggle}>
              {expanded ? 'Réduire' : `Tout voir (${active.length})`}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Pensée, idée, truc à pas oublier…"
          placeholderTextColor={c.textFaint}
          style={styles.input}
          multiline
          onSubmitEditing={submit}
          blurOnSubmit
          returnKeyType="done"
        />
        <Pressable
          onPress={submit}
          disabled={!draft.trim()}
          style={[styles.btn, !draft.trim() && styles.btnDisabled]}
        >
          <Text style={styles.btnText}>Capturer</Text>
        </Pressable>
      </View>

      {visible.length > 0 && (
        <View style={styles.list}>
          {visible.map((n) => (
            <View key={n.id} style={styles.noteRow}>
              <Text style={styles.noteText}>{n.text}</Text>
              <View style={styles.noteActions}>
                <Pressable onPress={() => onConvert(n.id)} hitSlop={8}>
                  <Text style={styles.actionPrimary}>→ Tâche</Text>
                </Pressable>
                <Pressable onPress={() => onArchive(n.id)} hitSlop={8}>
                  <Text style={styles.actionMuted}>×</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const makeStyles = (c: ColorScheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.surfaceAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: { ...type.tiny, color: c.primary, textTransform: 'uppercase', letterSpacing: 1 },
    toggle: { ...type.tiny, color: c.textMuted, fontWeight: '700' },
    inputRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' },
    input: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      ...type.body,
      color: c.text,
      minHeight: 40,
      maxHeight: 100,
    },
    btn: {
      backgroundColor: c.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
    },
    btnDisabled: { backgroundColor: c.primarySoft, opacity: 0.5 },
    btnText: { color: '#fff', ...type.small, fontWeight: '700' },
    list: { gap: spacing.xs, marginTop: spacing.xs },
    noteRow: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      borderWidth: 1,
      borderColor: c.border,
    },
    noteText: { flex: 1, ...type.small, color: c.text },
    noteActions: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
    actionPrimary: { ...type.tiny, color: c.primary, fontWeight: '700' },
    actionMuted: { fontSize: 22, color: c.textFaint, lineHeight: 22 },
  });
