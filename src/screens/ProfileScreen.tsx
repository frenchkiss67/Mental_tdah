import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XPBar } from '../components/XPBar';
import { ensurePermissions } from '../services/notifications';
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

const REMINDER_PRESETS = [
  { h: 8, m: 0, label: '08:00' },
  { h: 9, m: 0, label: '09:00' },
  { h: 12, m: 0, label: '12:00' },
  { h: 19, m: 0, label: '19:00' },
];

export const ProfileScreen: React.FC = () => {
  const gamification = useStore((s) => s.gamification);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const applyDailyReminder = useStore((s) => s.applyDailyReminder);
  const resetAll = useStore((s) => s.resetAll);

  const [apiKeyInput, setApiKeyInput] = useState(settings.anthropicApiKey ?? '');
  const [showKey, setShowKey] = useState(false);

  const confirmReset = () => {
    Alert.alert(
      'Tout réinitialiser ?',
      'Cela supprimera tes tâches, routines, XP et série. Action irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Réinitialiser', style: 'destructive', onPress: resetAll },
      ],
    );
  };

  const onToggleNotifications = async (v: boolean) => {
    if (v) {
      const granted = await ensurePermissions();
      if (!granted) {
        Alert.alert(
          'Permission refusée',
          'Active les notifications dans les réglages système pour recevoir les alertes.',
        );
        return;
      }
    }
    updateSettings({ notificationsEnabled: v });
    if (!v && settings.dailyReminderEnabled) {
      await applyDailyReminder(false, settings.dailyReminderHour, settings.dailyReminderMinute);
    }
  };

  const onToggleDailyReminder = async (v: boolean) => {
    await applyDailyReminder(v, settings.dailyReminderHour, settings.dailyReminderMinute);
  };

  const onPickReminderTime = async (h: number, m: number) => {
    await applyDailyReminder(true, h, m);
  };

  const onToggleAi = (v: boolean) => {
    if (v && !settings.anthropicApiKey) {
      Alert.alert(
        'Clé API manquante',
        'Colle d’abord ta clé Anthropic plus bas puis ré-active.',
      );
      return;
    }
    updateSettings({ aiDecompositionEnabled: v });
  };

  const saveApiKey = () => {
    const k = apiKeyInput.trim();
    updateSettings({ anthropicApiKey: k || undefined });
    Alert.alert(
      'Enregistré',
      k ? 'Clé stockée localement.' : 'Clé supprimée.',
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
          <Text style={styles.sectionTitle}>Rappels</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Notifications</Text>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={onToggleNotifications}
              trackColor={{ true: colors.primary, false: colors.surfaceAlt }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Rappel quotidien</Text>
              <Text style={styles.rowSub}>
                {settings.dailyReminderEnabled
                  ? `Tous les jours à ${String(settings.dailyReminderHour).padStart(2, '0')}:${String(settings.dailyReminderMinute).padStart(2, '0')}`
                  : 'Désactivé'}
              </Text>
            </View>
            <Switch
              value={settings.dailyReminderEnabled}
              onValueChange={onToggleDailyReminder}
              disabled={!settings.notificationsEnabled}
              trackColor={{ true: colors.primary, false: colors.surfaceAlt }}
            />
          </View>

          {settings.notificationsEnabled && (
            <View style={styles.timeRow}>
              {REMINDER_PRESETS.map((p) => {
                const active =
                  settings.dailyReminderEnabled &&
                  settings.dailyReminderHour === p.h &&
                  settings.dailyReminderMinute === p.m;
                return (
                  <Pressable
                    key={p.label}
                    onPress={() => onPickReminderTime(p.h, p.m)}
                    style={[styles.timePill, active && styles.timePillActive]}
                  >
                    <Text style={[styles.timeText, active && styles.timeTextActive]}>
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Décomposition IA</Text>
          <Text style={styles.rowSub}>
            Active pour générer des micro-étapes via Claude. Ta clé Anthropic reste sur l’appareil.
          </Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Utiliser l’IA</Text>
            <Switch
              value={settings.aiDecompositionEnabled}
              onValueChange={onToggleAi}
              trackColor={{ true: colors.primary, false: colors.surfaceAlt }}
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.rowLabel}>Clé API Anthropic</Text>
          <View style={styles.keyRow}>
            <TextInput
              style={styles.keyInput}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              placeholder="sk-ant-..."
              placeholderTextColor={colors.textFaint}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showKey}
            />
            <Pressable onPress={() => setShowKey((v) => !v)} style={styles.keyToggle}>
              <Text style={styles.keyToggleText}>{showKey ? 'Cacher' : 'Voir'}</Text>
            </Pressable>
          </View>
          <Pressable onPress={saveApiKey} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Enregistrer la clé</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Réglages Pomodoro</Text>

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

        <Text style={styles.footer}>FocusADHD · pensé pour les cerveaux TDAH</Text>
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
  timeRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  timePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  timePillActive: { backgroundColor: colors.primary },
  timeText: { ...type.small, color: colors.textMuted },
  timeTextActive: { color: '#fff', fontWeight: '700' },
  keyRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  keyInput: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...type.small,
    color: colors.text,
  },
  keyToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  keyToggleText: { ...type.small, color: colors.text, fontWeight: '700' },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', ...type.small, fontWeight: '700' },
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
