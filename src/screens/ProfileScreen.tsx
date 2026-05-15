import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XPBar } from '../components/XPBar';
import { useStore } from '../store';
import { colors, radius, spacing, type } from '../theme';

const StatCard: React.FC<{ label: string; value: string | number; hint?: string }> = ({
  label,
  value,
  hint,
}) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {hint && <Text style={styles.statHint}>{hint}</Text>}
  </View>
);

export const ProfileScreen: React.FC = () => {
  const gamification = useStore((s) => s.gamification);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const resetAll = useStore((s) => s.resetAll);

  const confirmReset = () => {
    Alert.alert(
      'Tout réinitialiser ?',
      'Cela supprimera tes tâches, ton XP et ta série. Action irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Réinitialiser', style: 'destructive', onPress: resetAll },
      ],
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Progression</Text>
        <Text style={styles.sub}>
          Chaque petite étape compte. Tu construis quelque chose, pas à pas.
        </Text>

        <View style={styles.card}>
          <XPBar xp={gamification.xp} />
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Série" value={`${gamification.streak}j`} hint="jours consécutifs" />
          <StatCard label="Tâches" value={gamification.totalTasksDone} hint="terminées" />
          <StatCard
            label="Focus"
            value={`${gamification.totalFocusMinutes}m`}
            hint="cumulés"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Réglages</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Vibrations (haptics)</Text>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={(v) => updateSettings({ hapticsEnabled: v })}
              trackColor={{ true: colors.primary, false: colors.surfaceAlt }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Petite pause</Text>
              <Text style={styles.rowSub}>{settings.breakMinutes} min</Text>
            </View>
            <View style={styles.stepper}>
              <Pressable
                onPress={() =>
                  updateSettings({
                    breakMinutes: Math.max(1, settings.breakMinutes - 1),
                  })
                }
                style={styles.stepBtn}
              >
                <Text style={styles.stepText}>−</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  updateSettings({
                    breakMinutes: Math.min(30, settings.breakMinutes + 1),
                  })
                }
                style={styles.stepBtn}
              >
                <Text style={styles.stepText}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Grande pause</Text>
              <Text style={styles.rowSub}>
                {settings.longBreakMinutes} min, tous les {settings.cyclesBeforeLongBreak} cycles
              </Text>
            </View>
            <View style={styles.stepper}>
              <Pressable
                onPress={() =>
                  updateSettings({
                    longBreakMinutes: Math.max(5, settings.longBreakMinutes - 5),
                  })
                }
                style={styles.stepBtn}
              >
                <Text style={styles.stepText}>−</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  updateSettings({
                    longBreakMinutes: Math.min(60, settings.longBreakMinutes + 5),
                  })
                }
                style={styles.stepBtn}
              >
                <Text style={styles.stepText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable style={styles.danger} onPress={confirmReset}>
          <Text style={styles.dangerText}>Tout réinitialiser</Text>
        </Pressable>

        <Text style={styles.footer}>
          FocusADHD · pensé pour les cerveaux TDAH
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 80 },
  heading: { ...type.h1, color: colors.text },
  sub: { ...type.small, color: colors.textMuted, marginTop: -spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
    gap: 2,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  statLabel: { ...type.small, color: colors.text },
  statHint: { ...type.tiny, color: colors.textMuted, textTransform: 'uppercase' },
  sectionTitle: { ...type.h2, color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { ...type.body, color: colors.text },
  rowSub: { ...type.small, color: colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border },
  stepper: { flexDirection: 'row', gap: spacing.sm },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { ...type.h2, color: colors.text },
  danger: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  dangerText: { color: colors.danger, ...type.body, fontWeight: '700' },
  footer: {
    textAlign: 'center',
    color: colors.textFaint,
    ...type.small,
    marginTop: spacing.lg,
  },
});
