import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FocusScreen } from './src/screens/FocusScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { RoutinesScreen } from './src/screens/RoutinesScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { setupAndroidChannel } from './src/services/notifications';
import { useStore } from './src/store';
import { colors, type } from './src/theme';
import { usePomodoroEngine } from './src/usePomodoroEngine';

const Tab = createBottomTabNavigator();

const TabIcon: React.FC<{ label: string; focused: boolean }> = ({ label, focused }) => (
  <View style={styles.tabIcon}>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
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
      <View style={styles.splash}>
        <Text style={styles.splashTitle}>FocusADHD</Text>
      </View>
    );
  }
  return <>{children}</>;
};

const AppCore: React.FC = () => {
  usePomodoroEngine();
  React.useEffect(() => {
    setupAndroidChannel();
  }, []);

  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: colors.primary,
          background: colors.bg,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.primary,
        },
      }}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
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
            return <TabIcon label={label} focused={focused} />;
          },
        })}
      >
        <Tab.Screen name="Tasks" component={TasksTab} />
        <Tab.Screen name="Routines" component={RoutinesScreen} />
        <Tab.Screen name="Focus" component={FocusScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <SplashGate>
          <AppCore />
        </SplashGate>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabIcon: { alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  tabLabel: { ...type.small, color: colors.textMuted },
  tabLabelActive: { color: colors.primary, fontWeight: '700' },
  splash: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
});
