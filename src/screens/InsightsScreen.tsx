import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useFinance } from "@/hooks/useFinance";
import { theme } from "@/constants/theme";
import {
  buildTrend,
  getBudgetPace,
  getBudgetPaceInsight,
  getCategoryTotals,
  getCurrentMonthTransactions,
  getMonthlySummary,
} from "@/utils/finance";
import { formatCurrency } from "@/utils/currency";

export function InsightsScreen() {
  const { transactions, budget, loading, openQuickAdd } = useFinance();
  const currentMonth = getCurrentMonthTransactions(transactions);
  const summary = getMonthlySummary(transactions, budget);
  const categoryTotals = getCategoryTotals(currentMonth);
  const trend = buildTrend(transactions);
  const budgetPace = getBudgetPace(summary, budget);
  const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const maxTrend = Math.max(...trend.map((item) => item.amount), 1);

  if (loading) {
    return (
      <Screen>
        <Text style={styles.heading}>Insights</Text>
        <LoadingState label="Crunching monthly patterns..." />
      </Screen>
    );
  }

  if (transactions.length === 0) {
    return (
      <Screen>
        <Text style={styles.heading}>Insights</Text>
        <EmptyState
          title="Insights need a little activity"
          description="Add a few entries and this screen will turn them into useful pace, category, and trend signals."
          actionLabel="Add transaction"
          onAction={() => openQuickAdd()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.heading}>Insights</Text>
        <Text style={styles.subheading}>Quiet signals, surfaced without dashboard clutter.</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>This month income</Text>
          <Text style={styles.summaryValue}>{formatCurrency(summary.income)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>This month expenses</Text>
          <Text style={styles.summaryValue}>{formatCurrency(summary.expenses)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Budget pace</Text>
        <Text style={styles.topCategory}>
          {budgetPace.status === "over"
            ? "Over pace"
            : budgetPace.status === "ahead"
              ? "Ahead of pace"
              : "On pace"}
        </Text>
        <Text style={styles.topValue}>{getBudgetPaceInsight(summary, budget)}</Text>
        <View style={styles.paceGrid}>
          <View style={styles.paceStat}>
            <Text style={styles.paceLabel}>Safe daily spend</Text>
            <Text style={styles.paceValue}>{formatCurrency(budgetPace.recommendedDailySpend)}</Text>
          </View>
          <View style={styles.paceStat}>
            <Text style={styles.paceLabel}>Projected month-end</Text>
            <Text style={styles.paceValue}>{formatCurrency(budgetPace.projectedMonthEndSpend)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top spending category</Text>
        <Text style={styles.topCategory}>{topCategoryEntry ? topCategoryEntry[0] : "No expense data yet"}</Text>
        <Text style={styles.topValue}>
          {topCategoryEntry ? formatCurrency(topCategoryEntry[1]) : "Start logging expenses to compare categories."}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Category-wise spend</Text>
        {Object.keys(categoryTotals).length === 0 ? (
          <Text style={styles.emptyCopy}>No expense categories this month yet.</Text>
        ) : (
          <View style={styles.categoryList}>
            {Object.entries(categoryTotals)
              .sort((a, b) => b[1] - a[1])
              .map(([category, total]) => {
                const width: `${number}%` = summary.expenses > 0 ? `${(total / summary.expenses) * 100}%` : "0%";
                return (
                  <View key={category} style={styles.categoryRow}>
                    <View style={styles.categoryLine}>
                      <Text style={styles.categoryName}>{category}</Text>
                      <Text style={styles.categoryValue}>{formatCurrency(total)}</Text>
                    </View>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width }]} />
                    </View>
                  </View>
                );
              })}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Spending trend</Text>
        {trend.length === 0 ? (
          <Text style={styles.emptyCopy}>Trend data appears after expense activity.</Text>
        ) : (
          <View style={styles.trendRow}>
            {trend.map((item) => (
              <View key={item.label} style={styles.trendItem}>
                <View style={styles.trendTrack}>
                  <View
                    style={[
                      styles.trendBar,
                      { height: (item.amount / maxTrend) * 132 + 8 },
                    ]}
                  />
                </View>
                <Text style={styles.trendLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 8,
  },
  heading: {
    color: theme.colors.text,
    fontSize: theme.typography.h1,
    fontWeight: "800",
  },
  subheading: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    ...theme.shadow.soft,
  },
  summaryItem: {
    flex: 1,
    gap: 8,
  },
  summaryDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  summaryLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: theme.typography.h3,
    fontWeight: "800",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
    ...theme.shadow.soft,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h3,
    fontWeight: "800",
  },
  topCategory: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "800",
  },
  topValue: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
  },
  emptyCopy: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  categoryList: {
    gap: theme.spacing.md,
  },
  paceGrid: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  paceStat: {
    flex: 1,
    gap: 8,
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  paceLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  paceValue: {
    color: theme.colors.text,
    fontWeight: "800",
  },
  categoryRow: {
    gap: 8,
  },
  categoryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  categoryName: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  categoryValue: {
    color: theme.colors.textMuted,
    fontWeight: "700",
  },
  track: {
    height: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    height: 160,
  },
  trendItem: {
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  trendTrack: {
    width: "100%",
    flex: 1,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMuted,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  trendBar: {
    width: "100%",
    minHeight: 8,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accentSecondary,
  },
  trendLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
});
