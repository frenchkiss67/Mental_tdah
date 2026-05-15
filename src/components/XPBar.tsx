import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, type } from '../theme';
import { levelFromXp } from '../utils';

type Props = { xp: number };

export const XPBar: React.FC<Props> = ({ xp }) => {
  const { level, into, need } = levelFromXp(xp);
  const pct = Math.max(0, Math.min(1, into / need));
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.lvl}>Niveau {level}</Text>
        <Text style={styles.xp}>
          {into} / {need} XP
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  lvl: { ...type.h2, color: colors.text },
  xp: { ...type.small, color: colors.textMuted },
  track: {
    height: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.pill },
});
