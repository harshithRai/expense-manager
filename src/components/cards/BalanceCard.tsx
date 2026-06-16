import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { theme } from "@/constants/theme";
import { formatCurrency } from "@/utils/currency";

type Props = {
  income: number;
  expenses: number;
  investments: number;
  remainingBudget: number;
  netCashflow: number;
};

export function BalanceCard(props: Props) {
  const stats = [
    {
      label: "Inflow",
      value: formatCurrency(props.income),
      toneStyle: styles.statToneIncome,
    },
    {
      label: "Spend",
      value: formatCurrency(props.expenses),
      toneStyle: styles.statToneExpense,
    },
    {
      label: "Invest",
      value: formatCurrency(props.investments),
      toneStyle: styles.statToneInvestment,
    },
    {
      label: "Budget left",
      value: formatCurrency(props.remainingBudget),
      toneStyle: styles.statToneNeutral,
    },
  ];

  return (
    <Animated.View entering={FadeInDown.duration(420)}>
      <LinearGradient colors={["#1B2642", "#101A30", "#0A0F1C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <View pointerEvents="none" style={styles.orbBlue} />
        <View pointerEvents="none" style={styles.orbMint} />
        <View pointerEvents="none" style={styles.orbCoral} />

        <View style={styles.topRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Monthly position</Text>
            <Text style={styles.sectionTitle}>Support the pulse with sharper context.</Text>
            <Text style={styles.copy}>Use this panel to read monthly momentum, budget headroom, and where capital is moving.</Text>
          </View>
          <View style={styles.netCard}>
            <Text style={styles.netLabel}>Net this month</Text>
            <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.netValue}>
              {props.netCashflow >= 0 ? "+" : "-"}
              {formatCurrency(Math.abs(props.netCashflow))}
            </Text>
          </View>
        </View>

        <View style={styles.waveCard}>
          <View style={styles.waveHeader}>
            <Text style={styles.waveTitle}>Cash atmosphere</Text>
            <Text style={styles.waveCaption}>Income, spending, and investments leave visible pressure on the month.</Text>
          </View>
          <View style={styles.waveCanvas}>
            <Svg width="100%" height="88" viewBox="0 0 320 88">
              <Path
                d="M0 56C28 46 47 18 74 24C101 30 120 67 148 65C184 62 190 18 222 22C256 27 268 62 320 38"
                fill="none"
                stroke="rgba(121,168,255,0.9)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <Path
                d="M0 72C30 68 62 35 95 37C130 39 153 73 182 70C216 67 234 39 266 42C292 44 303 61 320 58"
                fill="none"
                stroke="rgba(51,214,159,0.8)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <Path
                d="M0 80C18 74 28 60 55 61C85 62 101 77 133 76C161 75 180 55 212 56C248 58 270 81 320 78"
                fill="none"
                stroke="rgba(255,107,129,0.72)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotIncome]} />
              <Text style={styles.legendText}>Income pressure</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotExpense]} />
              <Text style={styles.legendText}>Expense drag</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotInvestment]} />
              <Text style={styles.legendText}>Investment flow</Text>
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          {stats.map((stat) => (
            <View key={stat.label} style={[styles.stat, stat.toneStyle]}>
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
    overflow: "hidden",
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: theme.spacing.lg,
    ...theme.shadow.card,
  },
  orbBlue: {
    position: "absolute",
    top: -80,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.accentGlow,
  },
  orbMint: {
    position: "absolute",
    bottom: 68,
    left: -64,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.ambientMint,
  },
  orbCoral: {
    position: "absolute",
    bottom: -28,
    right: 36,
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: theme.colors.ambientCoral,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: 8,
  },
  eyebrow: {
    color: "#CFE0FF",
    fontSize: theme.typography.caption,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontWeight: "800",
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: "800",
    lineHeight: 28,
    letterSpacing: -0.6,
  },
  copy: {
    maxWidth: 270,
    color: "rgba(243,246,255,0.72)",
    fontSize: theme.typography.caption,
    lineHeight: 19,
  },
  netCard: {
    minWidth: 124,
    backgroundColor: "rgba(7,11,18,0.3)",
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 5,
  },
  netLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.tiny,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    fontWeight: "800",
  },
  netValue: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "800",
    flexShrink: 1,
  },
  waveCard: {
    backgroundColor: "rgba(8,12,20,0.34)",
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  waveHeader: {
    gap: 4,
  },
  waveTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  waveCaption: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    lineHeight: 18,
  },
  waveCanvas: {
    marginHorizontal: -4,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendDotIncome: {
    backgroundColor: theme.colors.success,
  },
  legendDotExpense: {
    backgroundColor: theme.colors.danger,
  },
  legendDotInvestment: {
    backgroundColor: theme.colors.accent,
  },
  legendText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.tiny,
    fontWeight: "700",
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
    borderWidth: 1,
  },
  statToneIncome: {
    backgroundColor: "rgba(51,214,159,0.09)",
    borderColor: "rgba(51,214,159,0.16)",
  },
  statToneExpense: {
    backgroundColor: "rgba(255,107,129,0.09)",
    borderColor: "rgba(255,107,129,0.16)",
  },
  statToneInvestment: {
    backgroundColor: "rgba(121,168,255,0.09)",
    borderColor: "rgba(121,168,255,0.16)",
  },
  statToneNeutral: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.08)",
  },
  statLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.caption,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statValue: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 16,
  },
});
