import React, { useMemo } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, StyleSheet } from 'react-native';
import AnatomyScreen from '../screens/AnatomyScreen';
import ExerciseListScreen from '../screens/ExerciseListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProgramPlaceholderScreen from '../screens/ProgramPlaceholderScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useTranslation } from '../i18n/I18nProvider';
import { useTheme } from '../theme/ThemeProvider';
import type { ColorTokens } from '../theme/tokens';

export type RootTabParamList = {
  Anatomy: undefined;
  Exercises: { muscleKeyword?: string; muscleLabel?: string } | undefined;
  Profile: undefined;
  Program: undefined;
  Settings: undefined;
};

const Tab = createMaterialTopTabNavigator<RootTabParamList>();

type Styles = ReturnType<typeof createStyles>;

type TabIconProps = {
  label: string;
  icon: string;
  focused: boolean;
  styles: Styles;
};

function TabIcon({ label, icon, focused, styles }: TabIconProps) {
  return (
    <View style={styles.tabIconContainer}>
      <View style={{ flexShrink: 0 }}>
        <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
          {icon}
        </Text>
      </View>
      <Text
        style={[styles.tabLabel, focused && styles.tabLabelActive]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {label}
      </Text>
    </View>
  );
}

export default function MainTabs() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Tab.Navigator
      initialRouteName="Anatomy"
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        tabBarStyle: styles.tabBar,
        tabBarIndicatorStyle: styles.tabBarIndicator,
        tabBarShowLabel: false,
        tabBarPressColor: colors.accentSoft,
        tabBarItemStyle: { padding: 0 },
      }}
    >
      <Tab.Screen
        name="Anatomy"
        component={AnatomyScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label={t('tabs.anatomy')}
              icon="◉"
              focused={focused}
              styles={styles}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Exercises"
        component={ExerciseListScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label={t('tabs.exercises')}
              icon="⬡"
              focused={focused}
              styles={styles}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label={t('tabs.profile')}
              icon="○"
              focused={focused}
              styles={styles}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Program"
        component={ProgramPlaceholderScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label={t('tabs.program')}
              icon="▣"
              focused={focused}
              styles={styles}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label={t('tabs.settings')}
              icon="⚙"
              focused={focused}
              styles={styles}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    tabBar: {
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      elevation: 0,
      paddingBottom: 12,
      paddingTop: 2,
    },
    tabBarIndicator: {
      backgroundColor: colors.accent,
      height: 2,
      borderRadius: 1,
      top: 0,
    },
    tabIconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    tabIcon: {
      fontSize: 30,
      color: colors.iconMuted,
    },
    tabIconActive: {
      color: colors.accent,
    },
    tabLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSubtle,
      letterSpacing: 0.4,
      textAlign: 'center',
      width: '200%',
    },
    tabLabelActive: {
      color: colors.accent,
    },
  });
