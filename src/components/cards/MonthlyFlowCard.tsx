import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Line } from "react-native-svg";
import { theme } from "@/constants/theme";
import { formatCurrency } from "@/utils/currency";

type FlowPoint = {
  label: string;
  income: number;
  expenses: number;
  investments: number;
};

type Props = {
  title: string;
  subtitle: string;
  data: FlowPoint[];
};

const legend = [
  { label: "Income", color: theme.colors.success },
  { label: "Expenses", color: theme.colors.danger },
  { label: "Investments", color: theme.colors.accent },
] as const;

export function MonthlyFlowCard({ title, subtitle, data }: Props) {
  const maxValue = Math.max(1, ...data.flatMap((item) => [item.income, item.expenses, item.investments]));
  const latest = data[data.length - 1];
  const previous = data[data.length - 2];
  const latestNet = latest ? latest.income - latest.expenses - latest.investments : 0;
  const previousNet = previous ? previous.income - previous.expenses - previous.investments : 0;
  const netDelta = latestNet - previousNet;
  const trendLabel = previous
    ? `${netDelta >= 0 ? "+" : "-"}${formatCurrency(Math.abs(netDelta))} vs ${previous.label}`
    : "Need one more month for a trend";
  const trendTone = latestNet >= 0 ? styles.trendPositive : styles.trendNegative;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.signalPill}>
          <Text style={styles.signalLabel}>Latest month</Text>
          <Text style={styles.signalValue}>{latest ? latest.label : "Waiting"}</Text>
        </View>
      </View>

      {data.length === 0 ? (
        <Text style={styles.empty}>Add a few entries to start seeing monthly cash flow trends.</Text>
      ) : (
        <>
          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.trendEyebrow}>Real trend</Text>
              <Text style={[styles.trendValue, trendTone]}>
                {latestNet >= 0 ? "+" : "-"}
                {formatCurrency(Math.abs(latestNet))}
              </Text>
            </View>
            <Text style={styles.trendTitle}>Net monthly flow</Text>
            <Text style={styles.trendSubtitle}>{trendLabel}</Text>
          </View>

          <View style={styles.chartShell}>
            <View pointerEvents="none" style={styles.chartGrid}>
              <Svg width="100%" height="160" viewBox="0 0 320 160">
                {[32, 70, 108, 146].map((y) => (
                  <Line
                    key={y}
                    x1="0"
                    y1={String(y)}
                    x2="320"
                    y2={String(y)}
                    stroke="rgba(255,255,255,0.08)"
                    strokeDasharray="3 7"
                  />
                ))}
              </Svg>
            </View>
            <View style={styles.chart}>
              {data.map((item) => (
                <View key={item.label} style={styles.group}>
                  <View style={styles.groupBars}>
                    <View style={[styles.bar, styles.incomeBar, { height: `${(item.income / maxValue) * 100}%` }]} />
                    <View style={[styles.bar, styles.expenseBar, { height: `${(item.expenses / maxValue) * 100}%` }]} />
                    <View
                      style={[styles.bar, styles.investmentBar, { height: `${(item.investments / maxValue) * 100}%` }]}
                    />
                  </View>
                  <Text style={styles.groupLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.legendRow}>
            {legend.map((item) => (
              <View key={item.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>

          {latest ? (
            <View style={styles.footerGrid}>
              <View style={styles.footerStat}>
                <Text style={styles.footerLabel}>Income</Text>
                <Text style={styles.footerValue}>{formatCurrency(latest.income)}</Text>
              </View>
              <View style={styles.footerStat}>
                <Text style={styles.footerLabel}>Expenses</Text>
                <Text style={styles.footerValue}>{formatCurrency(latest.expenses)}</Text>
              </View>
              <View style={styles.footerStat}>
                <Text style={styles.footerLabel}>Investments</Text>
                <Text style={styles.footerValue}>{formatCurrency(latest.investments)}</Text>
              </View>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceGlass,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
    overflow: "hidden",
    ...theme.shadow.soft,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h3,
    fontWeight: "800",
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 21,
  },
  signalPill: {
    minWidth: 94,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 4,
  },
  signalLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.tiny,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  signalValue: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "800",
  },
  empty: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  trendCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 4,
  },
  trendHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  trendEyebrow: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.tiny,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  trendValue: {
    fontSize: theme.typography.body,
    fontWeight: "800",
  },
  trendPositive: {
    color: theme.colors.success,
  },
  trendNegative: {
    color: theme.colors.danger,
  },
  trendTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "800",
  },
  trendSubtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    lineHeight: 18,
  },
  chartShell: {
    position: "relative",
    minHeight: 180,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  chartGrid: {
    position: "absolute",
    top: 12,
    right: 10,
    left: 10,
    height: 160,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 160,
    gap: 12,
    zIndex: 1,
  },
  group: {
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  groupBars: {
    height: 136,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  bar: {
    width: 11,
    minHeight: 10,
    borderRadius: 999,
  },
  incomeBar: {
    backgroundColor: theme.colors.success,
    shadowColor: theme.colors.success,
    shadowOpacity: 0.24,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  expenseBar: {
    backgroundColor: theme.colors.danger,
    shadowColor: theme.colors.danger,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  investmentBar: {
    backgroundColor: theme.colors.accent,
    shadowColor: theme.colors.accent,
    shadowOpacity: 0.24,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  groupLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.caption,
    fontWeight: "700",
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    fontWeight: "700",
  },
  footerGrid: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  footerStat: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: theme.radius.md,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  footerLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.caption,
  },
  footerValue: {
    color: theme.colors.text,
    fontWeight: "800",
  },
});
