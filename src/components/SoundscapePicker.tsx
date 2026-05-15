import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SOUNDSCAPES } from '../services/soundscapes';
import { useStore } from '../store';
import { type ColorScheme, radius, spacing, type, useColors } from '../theme';

const VOLUME_STEPS = [0.3, 0.6, 1.0];
const labelForVolume = (v: number): string => {
  if (v <= 0.35) return 'doux';
  if (v <= 0.65) return 'moyen';
  return 'fort';
};

export const SoundscapePicker: React.FC = () => {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const soundscape = useStore((s) => s.soundscape);
  const selectSoundscape = useStore((s) => s.selectSoundscape);
  const toggleSoundscape = useStore((s) => s.toggleSoundscape);
  const setSoundscapeVolume = useStore((s) => s.setSoundscapeVolume);

  const onPick = (id: typeof SOUNDSCAPES[number]['id']) => {
    if (soundscape.id === id) {
      toggleSoundscape();
    } else {
      selectSoundscape(id);
    }
  };

  const cycleVolume = () => {
    const idx = VOLUME_STEPS.findIndex((v) => Math.abs(v - soundscape.volume) < 0.05);
    const next = VOLUME_STEPS[(idx + 1) % VOLUME_STEPS.length];
    setSoundscapeVolume(next);
  };

  const onOff = () => selectSoundscape(null);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Ambiance</Text>
        {soundscape.id && (
          <Pressable onPress={cycleVolume} hitSlop={6} style={styles.volumePill}>
            <Text style={styles.volumeText}>volume : {labelForVolume(soundscape.volume)}</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.row}>
        <Pressable
          onPress={onOff}
          style={[styles.btn, !soundscape.id && styles.btnActiveOff]}
        >
          <Text style={styles.emoji}>∅</Text>
          <Text
            style={[
              styles.btnLabel,
              !soundscape.id && styles.btnLabelActiveDark,
            ]}
          >
            Aucune
          </Text>
        </Pressable>
        {SOUNDSCAPES.map((s) => {
          const isActive = soundscape.id === s.id;
          const isPlaying = isActive && soundscape.playing;
          return (
            <Pressable
              key={s.id}
              onPress={() => onPick(s.id)}
              style={[styles.btn, isActive && styles.btnActive]}
            >
              <Text style={styles.emoji}>{s.emoji}</Text>
              <Text style={[styles.btnLabel, isActive && styles.btnLabelActive]}>
                {s.title}
              </Text>
              {isActive && (
                <Text style={[styles.btnState, isActive && styles.btnLabelActive]}>
                  {isPlaying ? '▶' : '⏸'}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const makeStyles = (c: ColorScheme) =>
  StyleSheet.create({
    wrap: { gap: spacing.sm },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: { ...type.small, color: c.textMuted },
    volumePill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.pill,
      backgroundColor: c.surfaceAlt,
    },
    volumeText: { ...type.tiny, color: c.text, fontWeight: '700' },
    row: { flexDirection: 'row', gap: spacing.xs },
    btn: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      borderRadius: radius.md,
      backgroundColor: c.surfaceAlt,
      alignItems: 'center',
      gap: 2,
    },
    btnActive: { backgroundColor: c.primary },
    btnActiveOff: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
    emoji: { fontSize: 22 },
    btnLabel: { ...type.tiny, color: c.textMuted, fontWeight: '700' },
    btnLabelActive: { color: '#fff' },
    btnLabelActiveDark: { color: c.text },
    btnState: { ...type.tiny, marginTop: 2 },
  });
