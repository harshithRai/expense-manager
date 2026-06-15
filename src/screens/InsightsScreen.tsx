import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { MonthlyFlowCard } from "@/components/cards/MonthlyFlowCard";
import { useFinance } from "@/hooks/useFinance";
import { theme } from "@/constants/theme";
import {
  buildMonthlyFlow,
  getCategoryTotals,
  getCurrentMonthTransactions,
  getMonthlySummary,
  getOutflowShare,
  getTopCategory,
} from "@/utils/finance";
import { formatCurrency } from "@/utils/currency";

export function InsightsScreen() {
  const { transactions, budget, loading, openQuickAdd } = useFinance();
  const currentMonth = getCurrentMonthTransactions(transactions);
  const summary = getMonthlySummary(transactions, budget);
  const monthlyFlow = buildMonthlyFlow(transactions);
  const spendingTotals = getCategoryTotals(currentMonth, "expense");
  const investmentTotals = getCategoryTotals(currentMonth, "investment");
  const topSpend = getTopCategory(currentMonth, "expense");
  const topInvestment = getTopCategory(currentMonth, "investment");
  const outflowShare = getOutflowShare(summary);
  const totalOutflow = summary.expenses + summary.investments;
  const maxOutflow = Math.max(...Object.values({ ...spendingTotals, ...investmentTotals }), 1);

  if (loading) {
    return (
      <Screen>
        <Text style={styles.heading}>Trends</Text>
        <LoadingState label="Preparing charts..." />
      </Screen>
    );
  }

  if (transactions.length === 0) {
    return (
      <Screen>
        <Text style={styles.heading}>Trends</Text>
        <EmptyState
          title="Charts need a little activity"
          description="Add a few transactions and this screen will show cash flow, spending mix, and where investments are going."
          actionLabel="Add transaction"
          onAction={() => openQuickAdd()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.heading}>Trends</Text>
        <Text style={styles.subheading}>A cleaner read on income, expenditure, and investments.</Text>
      </View>

      <MonthlyFlowCard
        title="Cash flow by month"
        subtitle="Compare what came in against what went out to spending and investments."
        data={monthlyFlow}
      />

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>This month income</Text>
          <Text style={styles.summaryValue}>{formatCurrency(summary.income)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Net cash flow</Text>
          <Text style={styles.summaryValue}>{formatCurrency(summary.netCashflow)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Outflow split</Text>
        <Text style={styles.cardCopy}>
          {totalOutflow > 0
            ? `${Math.round(outflowShare.expenses)}% expenditure and ${Math.round(outflowShare.investments)}% investment this month.`
            : "No outflow recorded for this month yet."}
        </Text>
        <View style={styles.splitBar}>
          {totalOutflow > 0 ? (
            <>
              <View style={[styles.spendFill, { width: `${outflowShare.expenses}%` }]} />
              <View style={[styles.investmentFill, { width: `${outflowShare.investments}%` }]} />
            </>
          ) : null}
        </View>
      </View>

      <View style={styles.dualGrid}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top spending category</Text>
          <Text style={styles.heroValue}>{topSpend ? topSpend[0] : "No spend yet"}</Text>
          <Text style={styles.cardCopy}>
            {topSpend ? formatCurrency(topSpend[1]) : "Track a few expenses to compare categories."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top investment bucket</Text>
          <Text style={styles.heroValue}>{topInvestment ? topInvestment[0] : "No investments yet"}</Text>
          <Text style={styles.cardCopy}>
            {topInvestment ? formatCurrency(topInvestment[1]) : "Log investments to see where capital is going."}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Category totals this month</Text>
        {Object.keys(spendingTotals).length === 0 && Object.keys(investmentTotals).length === 0 ? (
          <Text style={styles.cardCopy}>No expenditure or investment categories recorded this month.</Text>
        ) : (
          <View style={styles.categoryList}>
            {[
              ...Object.entries(spendingTotals).map(([category, total]) => ({
                key: `spend-${category}`,
                category,
                total,
                color: theme.colors.danger,
              })),
              ...Object.entries(investmentTotals).map(([category, total]) => ({
                key: `invest-${category}`,
                category,
                total,
                color: theme.colors.accent,
              })),
            ]
              .sort((a, b) => b.total - a.total)
              .map((item) => {
                const width: `${number}%` = `${(item.total / maxOutflow) * 100}%`;
                return (
                  <View key={item.key} style={styles.categoryRow}>
                    <View style={styles.categoryLine}>
                      <Text style={styles.categoryName}>{item.category}</Text>
                      <Text style={styles.categoryValue}>{formatCurrency(item.total)}</Text>
                    </View>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width, backgroundColor: item.color }]} />
                    </View>
                  </View>
                );
              })}
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
  cardCopy: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  splitBar: {
    flexDirection: "row",
    height: 14,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
  },
  spendFill: {
    backgroundColor: theme.colors.danger,
  },
  investmentFill: {
    backgroundColor: theme.colors.accent,
  },
  dualGrid: {
    gap: theme.spacing.md,
  },
  heroValue: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  categoryList: {
    gap: theme.spacing.md,
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
    fontWeight: "700",
  },
  categoryValue: {
    color: theme.colors.textMuted,
    fontWeight: "700",
  },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceSoft,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});
