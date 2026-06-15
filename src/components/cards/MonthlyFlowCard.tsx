import React from "react";
import { StyleSheet, Text, View } from "react-native";
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

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {data.length === 0 ? (
        <Text style={styles.empty}>Add a few entries to start seeing monthly cash flow trends.</Text>
      ) : (
        <>
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

          <View style={styles.legendRow}>
            {legend.map((item) => (
              <View key={item.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.footerGrid}>
            {data.slice(-1).map((item) => (
              <React.Fragment key={`${item.label}-totals`}>
                <View style={styles.footerStat}>
                  <Text style={styles.footerLabel}>Income</Text>
                  <Text style={styles.footerValue}>{formatCurrency(item.income)}</Text>
                </View>
                <View style={styles.footerStat}>
                  <Text style={styles.footerLabel}>Expenses</Text>
                  <Text style={styles.footerValue}>{formatCurrency(item.expenses)}</Text>
                </View>
                <View style={styles.footerStat}>
                  <Text style={styles.footerLabel}>Investments</Text>
                  <Text style={styles.footerValue}>{formatCurrency(item.investments)}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
    ...theme.shadow.soft,
  },
  header: {
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
  empty: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 170,
    gap: 12,
    paddingTop: theme.spacing.md,
  },
  group: {
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  groupBars: {
    height: 140,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  bar: {
    width: 10,
    minHeight: 8,
    borderRadius: 999,
  },
  incomeBar: {
    backgroundColor: theme.colors.success,
  },
  expenseBar: {
    backgroundColor: theme.colors.danger,
  },
  investmentBar: {
    backgroundColor: theme.colors.accent,
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
    backgroundColor: theme.colors.surfaceSoft,
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
