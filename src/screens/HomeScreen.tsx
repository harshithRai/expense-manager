import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ArrowRight, Sparkles } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BalanceCard } from "@/components/cards/BalanceCard";
import { MonthlyFlowCard } from "@/components/cards/MonthlyFlowCard";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useFinance } from "@/hooks/useFinance";
import { theme } from "@/constants/theme";
import { buildMonthlyFlow, getAvailableBalance, getMonthlySummary, getOutflowShare } from "@/utils/finance";
import { PressableScale } from "@/components/ui/PressableScale";
import { formatCurrency } from "@/utils/currency";

export function HomeScreen() {
  const { transactions, budget, loading, openQuickAdd, deleteTransaction } = useFinance();
  const summary = getMonthlySummary(transactions, budget);
  const availableBalance = getAvailableBalance(transactions);
  const monthlyFlow = buildMonthlyFlow(transactions);
  const outflowShare = getOutflowShare(summary);
  const totalOutflow = summary.expenses + summary.investments;
  const recentTransactions = transactions.slice(0, 4);
  const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date());

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Overview</Text>
          <Text style={styles.heading}>Your money at a glance for {monthLabel}.</Text>
          <Text style={styles.subheading}>
            {transactions.length === 0
              ? "Start with one entry and the rest of the app will come alive."
              : `${transactions.length} ${transactions.length === 1 ? "entry" : "entries"} recorded so far this month.`}
          </Text>
        </View>
        <PressableScale haptic="medium" onPress={() => openQuickAdd()} style={styles.quickPill}>
          <Sparkles size={15} color={theme.colors.background} />
          <Text style={styles.quickPillText}>Quick add</Text>
          <ArrowRight size={16} color={theme.colors.background} />
        </PressableScale>
      </Animated.View>

      <BalanceCard
        availableBalance={availableBalance}
        income={summary.income}
        expenses={summary.expenses}
        investments={summary.investments}
        remainingBudget={summary.remainingBudget}
        netCashflow={summary.netCashflow}
      />

      {loading ? (
        <LoadingState label="Preparing your monthly flow..." />
      ) : (
        <>
          <MonthlyFlowCard
            title="Monthly flow"
            subtitle="See income, expenditure, and investments together instead of guessing where cash moved."
            data={monthlyFlow}
          />
          <View style={styles.outflowCard}>
            <View style={styles.outflowHeader}>
              <Text style={styles.outflowTitle}>This month outflow mix</Text>
              <Text style={styles.outflowSubtitle}>
                {summary.expenses + summary.investments > 0
                  ? `${Math.round(outflowShare.expenses)}% spending • ${Math.round(outflowShare.investments)}% investing`
                  : "No outflow logged yet"}
              </Text>
            </View>
            <View style={styles.outflowBar}>
              {totalOutflow > 0 ? (
                <>
                  <View style={[styles.outflowSpendFill, { width: `${outflowShare.expenses}%` }]} />
                  <View style={[styles.outflowInvestmentFill, { width: `${outflowShare.investments}%` }]} />
                </>
              ) : null}
            </View>
            <View style={styles.outflowStats}>
              <View style={styles.outflowStat}>
                <Text style={styles.outflowStatLabel}>Expenditure</Text>
                <Text style={styles.outflowStatValue}>{formatCurrency(summary.expenses)}</Text>
              </View>
              <View style={styles.outflowStat}>
                <Text style={styles.outflowStatLabel}>Investment</Text>
                <Text style={styles.outflowStatValue}>{formatCurrency(summary.investments)}</Text>
              </View>
            </View>
          </View>
        </>
      )}

      <SectionHeader title="Recent activity" />
      {loading ? (
        <LoadingState label="Fetching recent transactions..." />
      ) : recentTransactions.length === 0 ? (
        <EmptyState
          title="Your ledger is still quiet"
          description="Add one transaction and the home screen will start surfacing balance, monthly flow, and recent activity."
          actionLabel="Add first entry"
          onAction={() => openQuickAdd()}
        />
      ) : (
        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text style={styles.listEyebrow}>Latest moves</Text>
            <Text style={styles.listSummary}>
              {recentTransactions.length === 1 ? "1 recent entry" : `${recentTransactions.length} recent entries`}
            </Text>
          </View>
          <View style={styles.list}>
            {recentTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onEdit={() => openQuickAdd(transaction)}
                onDelete={() => deleteTransaction(transaction.id)}
              />
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.lg,
  },
  headerCopy: {
    gap: 8,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: theme.typography.tiny,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  heading: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "800",
    maxWidth: 280,
    lineHeight: 36,
    letterSpacing: -0.8,
  },
  subheading: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
    maxWidth: 310,
  },
  quickPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: theme.colors.text,
    borderRadius: theme.radius.pill,
    ...theme.shadow.soft,
  },
  quickPillText: {
    color: theme.colors.background,
    fontWeight: "800",
  },
  listCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadow.soft,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  listEyebrow: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  listSummary: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.caption,
  },
  list: {
    gap: theme.spacing.md,
  },
  outflowCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadow.soft,
  },
  outflowHeader: {
    gap: 6,
  },
  outflowTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h3,
    fontWeight: "800",
  },
  outflowSubtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 21,
  },
  outflowBar: {
    flexDirection: "row",
    height: 14,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
  },
  outflowSpendFill: {
    backgroundColor: theme.colors.danger,
  },
  outflowInvestmentFill: {
    backgroundColor: theme.colors.accent,
  },
  outflowStats: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  outflowStat: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  outflowStatLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.caption,
    fontWeight: "700",
  },
  outflowStatValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
});
