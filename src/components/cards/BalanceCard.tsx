import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { theme } from "@/constants/theme";
import { formatCurrency } from "@/utils/currency";

type Props = {
  availableBalance: number;
  income: number;
  expenses: number;
  investments: number;
  remainingBudget: number;
  netCashflow: number;
};

export function BalanceCard(props: Props) {
  const stats = [
    { label: "Income", value: formatCurrency(props.income) },
    { label: "Expenditure", value: formatCurrency(props.expenses) },
    { label: "Investments", value: formatCurrency(props.investments) },
    { label: "Budget Left", value: formatCurrency(props.remainingBudget) },
  ];

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <LinearGradient colors={["#1A2340", "#10192D", "#0D1322"]} style={styles.card}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.eyebrow}>Current balance</Text>
            <Text style={styles.balance}>{formatCurrency(props.availableBalance)}</Text>
          </View>
          <View style={styles.netPill}>
            <Text style={styles.netLabel}>Net this month</Text>
            <Text style={styles.netValue}>
              {props.netCashflow >= 0 ? "+" : "-"}
              {formatCurrency(Math.abs(props.netCashflow))}
            </Text>
          </View>
        </View>
        <View style={styles.grid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.stat}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    ...theme.shadow.card,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  eyebrow: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
  },
  balance: {
    color: theme.colors.text,
    fontSize: theme.typography.hero,
    fontWeight: "800",
    letterSpacing: -1,
  },
  netPill: {
    minWidth: 118,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  netLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.tiny,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  netValue: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "800",
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  stat: {
    width: "47%",
    gap: 8,
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  statLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.caption,
    fontWeight: "600",
  },
  statValue: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 16,
  },
});
