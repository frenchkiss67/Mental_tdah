import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FocusScreen } from './src/screens/FocusScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { RoutinesScreen } from './src/screens/RoutinesScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { setupAndroidChannel } from './src/services/notifications';
import { useStore } from './src/store';
import { type ColorScheme, lightColors, type, useColors } from './src/theme';
import { usePomodoroEngine } from './src/usePomodoroEngine';
import { useSoundscapeEngine } from './src/useSoundscapeEngine';

const Tab = createBottomTabNavigator();

const TabIcon: React.FC<{ label: string; focused: boolean; c: ColorScheme }> = ({
  label,
  focused,
  c,
}) => (
  <View style={styles.tabIcon}>
    <Text
      style={[
        styles.tabLabel,
        { color: c.textMuted },
        focused && { color: c.primary, fontWeight: '700' },
      ]}
    >
      {label}
    </Text>
  </View>
);

const TasksTab: React.FC<{ navigation: any }> = ({ navigation }) => {
  const setCurrentTask = useStore((s) => s.setCurrentTask);
  return (
    <TasksScreen
      onStartFocus={(taskId) => {
        setCurrentTask(taskId);
        navigation.navigate('Focus');
      }}
      onGoFocus={() => navigation.navigate('Focus')}
    />
  );
};

const SplashGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hydrated = useStore((s) => s.hydrated);
  const [waited, setWaited] = React.useState(false);
  React.useEffect(() => {
    const id = setTimeout(() => setWaited(true), 200);
    return () => clearTimeout(id);
  }, []);
  if (!hydrated && !waited) {
    return (
      <View style={[styles.splash, { backgroundColor: lightColors.bg }]}>
        <Text style={[styles.splashTitle, { color: lightColors.primary }]}>FocusADHD</Text>
      </View>
    );
  }
  return <>{children}</>;
};

const AppCore: React.FC = () => {
  usePomodoroEngine();
  useSoundscapeEngine();
  const c = useColors();
  const themePref = useStore((s) => s.settings.theme);
  const onboardingCompleted = useStore((s) => s.settings.onboardingCompleted);
  const system = useColorScheme();
  const isDark = themePref === 'dark' || (themePref === 'system' && system === 'dark');

  React.useEffect(() => {
    setupAndroidChannel();
  }, []);

  if (!onboardingCompleted) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <OnboardingScreen />
      </>
    );
  }

  const navTheme = useMemo(
    () => ({
      dark: isDark,
      colors: {
        primary: c.primary,
        background: c.bg,
        card: c.surface,
        text: c.text,
        border: c.border,
        notification: c.primary,
      },
    }),
    [c, isDark],
  );

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: {
              backgroundColor: c.surface,
              borderTopColor: c.border,
              height: 64,
              paddingTop: 8,
              paddingBottom: 8,
            },
            tabBarIcon: ({ focused }) => {
              const label =
                route.name === 'Tasks'
                  ? 'Tâches'
                  : route.name === 'Routines'
                    ? 'Routines'
                    : route.name === 'Focus'
                      ? 'Focus'
                      : 'Profil';
              return <TabIcon label={label} focused={focused} c={c} />;
            },
          })}
        >
          <Tab.Screen name="Tasks" component={TasksTab} />
          <Tab.Screen name="Routines" component={RoutinesScreen} />
          <Tab.Screen name="Focus" component={FocusScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SplashGate>
          <AppCore />
        </SplashGate>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabIcon: { alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  tabLabel: { ...type.small },
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  splashTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
