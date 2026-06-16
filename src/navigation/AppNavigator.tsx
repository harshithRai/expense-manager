import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LayoutGrid, List, Plus, Settings, TrendingUp } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { HomeScreen } from "@/screens/HomeScreen";
import { TransactionsScreen } from "@/screens/TransactionsScreen";
import { InsightsScreen } from "@/screens/InsightsScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { useFinance } from "@/hooks/useFinance";
import { TransactionSheet } from "@/components/forms/TransactionSheet";

const Tab = createBottomTabNavigator();

function QuickAddScreen() {
  return null;
}

function AppTabs() {
  const insets = useSafeAreaInsets();
  const { openQuickAdd } = useFinance();
  const iconSize = 20;
  const bottomInset = Math.max(insets.bottom, theme.spacing.md);
  const tabBarHeight = 74 + bottomInset;

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          animation: "shift",
          headerShown: false,
          tabBarActiveTintColor: theme.colors.text,
          tabBarInactiveTintColor: theme.colors.textSoft,
          tabBarStyle: [
            styles.tabBar,
            {
              height: tabBarHeight,
              paddingBottom: bottomInset + 4,
            },
          ],
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarHideOnKeyboard: true,
          sceneStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => <LayoutGrid size={iconSize} color={color} />,
          }}
        />
        <Tab.Screen
          name="Transactions"
          component={TransactionsScreen}
          options={{
            tabBarLabel: "Activity",
            tabBarIcon: ({ color }) => <List size={iconSize} color={color} />,
          }}
        />
        <Tab.Screen
          name="QuickAdd"
          component={QuickAddScreen}
          listeners={{
            tabPress: (event) => {
              event.preventDefault();
              openQuickAdd();
            },
          }}
          options={{
            tabBarLabel: "",
            tabBarIcon: ({ focused }) => (
              <View style={styles.centerTabButton}>
                <Plus
                  size={20}
                  color={focused ? "#FFFFFF" : "rgba(255,255,255,0.96)"}
                  strokeWidth={2.4}
                />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Insights"
          component={InsightsScreen}
          options={{
            tabBarLabel: "Trends",
            tabBarIcon: ({ color }) => <TrendingUp size={iconSize} color={color} />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color }) => <Settings size={iconSize} color={color} />,
          }}
        />
      </Tab.Navigator>
      <TransactionSheet />
    </>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer
      theme={{
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: "transparent",
          primary: theme.colors.text,
        },
      }}
    >
      <AppTabs />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 10,
    paddingTop: 12,
    paddingHorizontal: 10,
    backgroundColor: "rgba(14,19,32,0.92)",
    borderTopWidth: 0,
    borderRadius: 28,
    elevation: 0,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  centerTabButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 54,
    height: 54,
    marginTop: -10,
    borderRadius: 27,
    backgroundColor: theme.colors.accent,
    shadowColor: theme.colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
});
