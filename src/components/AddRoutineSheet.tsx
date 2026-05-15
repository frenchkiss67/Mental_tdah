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
import { scheduleRoutineReminder } from '../services/notifications';
import { useStore } from '../store';
import { colors, radius, spacing, type } from '../theme';

type Props = { visible: boolean; onClose: () => void };

const DAYS = [
  { key: 1, label: 'L' },
  { key: 2, label: 'M' },
  { key: 3, label: 'M' },
  { key: 4, label: 'J' },
  { key: 5, label: 'V' },
  { key: 6, label: 'S' },
  { key: 0, label: 'D' },
];

const TIME_PRESETS = ['07:00', '08:00', '12:00', '18:00', '21:00'];

export const AddRoutineSheet: React.FC<Props> = ({ visible, onClose }) => {
  const addRoutine = useStore((s) => s.addRoutine);
  const settings = useStore((s) => s.settings);
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('');
  const [time, setTime] = useState<string | null>(null);
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const toggleDay = (d: number) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const submit = async () => {
    const t = title.trim();
    if (!t || days.length === 0) return;

    let notificationId: string | undefined;
    if (time && settings.notificationsEnabled) {
      const [hStr, mStr] = time.split(':');
      const id = await scheduleRoutineReminder(t, Number(hStr), Number(mStr), days);
      notificationId = id ?? undefined;
    }

    addRoutine({
      title: t,
      emoji: emoji.trim() || undefined,
      scheduledTime: time ?? undefined,
      days,
      notificationId,
    });

    setTitle('');
    setEmoji('');
    setTime(null);
    setDays([1, 2, 3, 4, 5]);
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
          <Text style={styles.heading}>Nouvelle routine</Text>
          <Text style={styles.hint}>Une habitude répétée. Coche-la chaque jour.</Text>

          <View style={styles.titleRow}>
            <TextInput
              placeholder="🌟"
              placeholderTextColor={colors.textFaint}
              style={styles.emoji}
              value={emoji}
              onChangeText={(v) => setEmoji(v.slice(0, 2))}
              maxLength={4}
            />
            <TextInput
              placeholder="Ex: Médication, sport, méditation"
              placeholderTextColor={colors.textFaint}
              style={[styles.input, { flex: 1 }]}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          <Text style={styles.label}>Jours</Text>
          <View style={styles.row}>
            {DAYS.map((d) => (
              <Pressable
                key={d.key}
                onPress={() => toggleDay(d.key)}
                style={[styles.dayPill, days.includes(d.key) && styles.dayPillActive]}
              >
                <Text
                  style={[
                    styles.dayPillText,
                    days.includes(d.key) && styles.dayPillTextActive,
                  ]}
                >
                  {d.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Rappel (optionnel)</Text>
          <View style={styles.row}>
            <Pressable
              onPress={() => setTime(null)}
              style={[styles.timePill, time === null && styles.timePillActive]}
            >
              <Text style={[styles.timeText, time === null && styles.timeTextActive]}>
                Aucun
              </Text>
            </Pressable>
            {TIME_PRESETS.map((t) => (
              <Pressable
                key={t}
                onPress={() => setTime(t)}
                style={[styles.timePill, time === t && styles.timePillActive]}
              >
                <Text style={[styles.timeText, time === t && styles.timeTextActive]}>
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={submit}
            style={[
              styles.submit,
              (!title.trim() || days.length === 0) && styles.submitDisabled,
            ]}
            disabled={!title.trim() || days.length === 0}
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
  titleRow: { flexDirection: 'row', gap: spacing.sm },
  emoji: {
    width: 60,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
    fontSize: 22,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...type.body,
    color: colors.text,
  },
  label: { ...type.small, color: colors.textMuted },
  row: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  dayPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayPillText: { ...type.small, color: colors.textMuted, fontWeight: '700' },
  dayPillTextActive: { color: '#fff' },
  timePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timePillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timeText: { ...type.small, color: colors.textMuted },
  timeTextActive: { color: '#fff' },
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
