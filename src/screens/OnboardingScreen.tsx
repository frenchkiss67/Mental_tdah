import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { type ColorScheme, radius, spacing, type, useColors } from '../theme';
import type { EnergyLevel } from '../types';

const FOCUS_PRESETS = [10, 15, 25, 45];

const ENERGY_LEVELS: { value: EnergyLevel; emoji: string; label: string }[] = [
  { value: 1, emoji: '🪫', label: 'Vidé' },
  { value: 2, emoji: '🥱', label: 'Bas' },
  { value: 3, emoji: '🙂', label: 'OK' },
  { value: 4, emoji: '⚡', label: 'Plein' },
];

export const OnboardingScreen: React.FC = () => {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const updateSettings = useStore((s) => s.updateSettings);
  const setEnergy = useStore((s) => s.setEnergy);
  const settings = useStore((s) => s.settings);

  const [focusChoice, setFocusChoice] = useState<number>(settings.focusMinutes);
  const [energyChoice, setEnergyChoice] = useState<EnergyLevel | null>(null);

  const submit = () => {
    updateSettings({ focusMinutes: focusChoice, onboardingCompleted: true });
    if (energyChoice !== null) setEnergy(energyChoice);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Bienvenue.</Text>
        <Text style={styles.subtitle}>
          Cette app est pensée pour les cerveaux TDAH. Pas de configuration longue.
          Juste deux questions pour adapter le défaut.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Tu te concentres en moyenne combien de temps ?</Text>
          <Text style={styles.hint}>
            On ajustera dans les Réglages si ça change. 15 min est un bon défaut.
          </Text>
          <View style={styles.row}>
            {FOCUS_PRESETS.map((m) => (
              <Pressable
                key={m}
                onPress={() => setFocusChoice(m)}
                style={[styles.pill, focusChoice === m && styles.pillActive]}
              >
                <Text style={[styles.pillText, focusChoice === m && styles.pillTextActive]}>
                  {m} min
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Ton énergie là, tout de suite ?</Text>
          <Text style={styles.hint}>
            Optionnel. L'app adapte ses suggestions quand l'énergie est basse.
          </Text>
          <View style={styles.row}>
            {ENERGY_LEVELS.map((l) => (
              <Pressable
                key={l.value}
                onPress={() => setEnergyChoice(l.value)}
                style={[
                  styles.energyBtn,
                  energyChoice === l.value && styles.energyBtnActive,
                ]}
              >
                <Text style={styles.energyEmoji}>{l.emoji}</Text>
                <Text
                  style={[
                    styles.energyLabel,
                    energyChoice === l.value && styles.energyLabelActive,
                  ]}
                >
                  {l.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>
          Tu peux explorer le reste tranquillement après — notifications, IA pour
          décomposer les tâches, soundscapes, mode zen. Rien n'est imposé.
        </Text>
      </ScrollView>

      <View style={styles.actions}>
        <Pressable onPress={submit} style={styles.cta}>
          <Text style={styles.ctaText}>C'est parti</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (c: ColorScheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 100 },
    title: { fontSize: 32, fontWeight: '800', color: c.text },
    subtitle: { ...type.body, color: c.textMuted, marginBottom: spacing.md },
    card: {
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
      gap: spacing.sm,
    },
    label: { ...type.h2, color: c.text },
    hint: { ...type.small, color: c.textMuted },
    row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', marginTop: spacing.xs },
    pill: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: c.surfaceAlt,
    },
    pillActive: { backgroundColor: c.primary },
    pillText: { ...type.body, color: c.textMuted, fontWeight: '700' },
    pillTextActive: { color: '#fff' },
    energyBtn: {
      flex: 1,
      minWidth: 70,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: c.surfaceAlt,
      alignItems: 'center',
      gap: 2,
    },
    energyBtnActive: { backgroundColor: c.primary },
    energyEmoji: { fontSize: 28 },
    energyLabel: { ...type.tiny, color: c.textMuted, fontWeight: '700' },
    energyLabelActive: { color: '#fff' },
    footer: { ...type.small, color: c.textFaint, marginTop: spacing.md },
    actions: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      paddingTop: spacing.sm,
      backgroundColor: c.bg,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    cta: {
      backgroundColor: c.primary,
      paddingVertical: spacing.md,
      borderRadius: radius.pill,
      alignItems: 'center',
    },
    ctaText: { color: '#fff', ...type.body, fontWeight: '700' },
  });
