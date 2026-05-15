import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../store';
import { colors, radius, spacing, type } from '../theme';
import { pickWeightedRandomTask } from '../utils';

type Props = {
  onGoFocus: () => void;
};

export const StuckCard: React.FC<Props> = ({ onGoFocus }) => {
  const tasks = useStore((s) => s.tasks);
  const setCurrentTask = useStore((s) => s.setCurrentTask);
  const startQuickFocus = useStore((s) => s.startQuickFocus);

  const pending = tasks.filter((t) => !t.done);
  if (pending.length === 0) return null;

  const onPickForMe = () => {
    const t = pickWeightedRandomTask(tasks);
    if (!t) return;
    setCurrentTask(t.id);
    Alert.alert(
      'Choisi pour toi',
      t.title,
      [
        { text: 'Une autre', onPress: onPickForMe, style: 'cancel' },
        {
          text: 'Lancer 2 min',
          onPress: async () => {
            await startQuickFocus(t.id);
            onGoFocus();
          },
        },
        {
          text: 'Garder en cours',
          onPress: onGoFocus,
        },
      ],
      { cancelable: true },
    );
  };

  const onTwoMinutes = async () => {
    await startQuickFocus();
    onGoFocus();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Bloqué·e ?</Text>
      <View style={styles.btnRow}>
        <Pressable onPress={onTwoMinutes} style={[styles.btn, styles.btnPrimary]}>
          <Text style={styles.btnPrimaryText}>Juste 2 min</Text>
          <Text style={styles.btnSubLight}>aucun engagement</Text>
        </Pressable>
        <Pressable onPress={onPickForMe} style={[styles.btn, styles.btnSecondary]}>
          <Text style={styles.btnSecondaryText}>Choisis pour moi</Text>
          <Text style={styles.btnSubMuted}>pas de décision</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  label: { ...type.tiny, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  btnRow: { flexDirection: 'row', gap: spacing.sm },
  btn: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    gap: 2,
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnPrimaryText: { color: '#fff', ...type.body, fontWeight: '700' },
  btnSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnSecondaryText: { color: colors.text, ...type.body, fontWeight: '700' },
  btnSubLight: { ...type.tiny, color: 'rgba(255,255,255,0.75)' },
  btnSubMuted: { ...type.tiny, color: colors.textMuted },
});
