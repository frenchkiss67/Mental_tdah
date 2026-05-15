import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, spacing, type } from '../theme';

type Props = { visible: boolean; onClose: () => void };

const CRISIS_BG = '#11131F';
const CRISIS_ACCENT = '#7DD3C0';
const CRISIS_TEXT = '#ECE7FA';

const GROUNDING = [
  'Pose le téléphone 60 secondes.',
  'Bois un verre d’eau lentement.',
  'Marche jusqu’à la fenêtre. Regarde dehors.',
  'Étire-toi pendant 30 secondes.',
  'Trouve 3 choses bleues autour de toi.',
  'Mets une main sur ton cœur.',
  'Repose la tête sur ton bureau 30 secondes.',
  'Respire profondément 5 fois, sans rien faire d’autre.',
];

type Phase = 'in' | 'hold' | 'out';

const phaseLabel = (p: Phase): string =>
  p === 'in' ? 'Inspire' : p === 'hold' ? 'Retiens' : 'Expire';

export const CrisisModal: React.FC<Props> = ({ visible, onClose }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const [phase, setPhase] = useState<Phase>('in');
  const [tip, setTip] = useState(() => GROUNDING[Math.floor(Math.random() * GROUNDING.length)]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setTip(GROUNDING[Math.floor(Math.random() * GROUNDING.length)]);

    const cycle = () => {
      if (cancelled) return;
      setPhase('in');
      Animated.timing(scale, {
        toValue: 1.45,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        if (cancelled) return;
        setPhase('hold');
        setTimeout(() => {
          if (cancelled) return;
          setPhase('out');
          Animated.timing(scale, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          }).start(() => {
            if (cancelled) return;
            cycle();
          });
        }, 7000);
      });
    };

    cycle();
    return () => {
      cancelled = true;
      scale.stopAnimation();
      scale.setValue(1);
    };
  }, [visible, scale]);

  const reroll = () => {
    let next = tip;
    while (next === tip && GROUNDING.length > 1) {
      next = GROUNDING[Math.floor(Math.random() * GROUNDING.length)];
    }
    setTip(next);
  };

  return (
    <Modal animationType="fade" visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" hidden />

        <View style={styles.center}>
          <Text style={styles.title}>C’est ok.</Text>
          <Text style={styles.subtitle}>Tu n’as rien à faire maintenant.</Text>

          <View style={styles.breathWrap}>
            <Animated.View style={[styles.breathCircle, { transform: [{ scale }] }]} />
            <View style={styles.breathCenter} pointerEvents="none">
              <Text style={styles.breathLabel}>{phaseLabel(phase)}</Text>
            </View>
          </View>

          <Text style={styles.tipLabel}>Quand tu es prêt·e</Text>
          <Text style={styles.tip}>{tip}</Text>
          <Pressable onPress={reroll} hitSlop={8}>
            <Text style={styles.reroll}>Une autre idée</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Je peux y aller</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const BREATH_SIZE = 160;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CRISIS_BG },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  title: { fontSize: 32, fontWeight: '800', color: CRISIS_TEXT, textAlign: 'center' },
  subtitle: { ...type.body, color: 'rgba(236,231,250,0.7)', textAlign: 'center' },
  breathWrap: {
    width: BREATH_SIZE * 1.6,
    height: BREATH_SIZE * 1.6,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  breathCircle: {
    width: BREATH_SIZE,
    height: BREATH_SIZE,
    borderRadius: BREATH_SIZE / 2,
    backgroundColor: 'rgba(125,211,192,0.18)',
    borderWidth: 2,
    borderColor: CRISIS_ACCENT,
  },
  breathCenter: { position: 'absolute', alignItems: 'center' },
  breathLabel: {
    ...type.h2,
    color: CRISIS_TEXT,
    letterSpacing: 1,
  },
  tipLabel: {
    ...type.tiny,
    color: CRISIS_ACCENT,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  tip: {
    ...type.body,
    color: CRISIS_TEXT,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  reroll: { ...type.small, color: 'rgba(236,231,250,0.55)' },
  footer: { padding: spacing.lg, alignItems: 'center' },
  closeBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  closeText: { color: CRISIS_TEXT, ...type.body, fontWeight: '700' },
});
