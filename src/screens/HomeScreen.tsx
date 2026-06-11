import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ArrowRight, Sparkles } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BalanceCard } from "@/components/cards/BalanceCard";
import { InsightCard } from "@/components/cards/InsightCard";
import { BudgetPaceCard } from "@/components/cards/BudgetPaceCard";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useFinance } from "@/hooks/useFinance";
import { theme } from "@/constants/theme";
import { getAvailableBalance, getBudgetPace, getMonthlySummary, getWeeklyFoodInsight } from "@/utils/finance";
import { PressableScale } from "@/components/ui/PressableScale";
import { formatCurrency } from "@/utils/currency";

export function HomeScreen() {
  const { transactions, budget, loading, openQuickAdd, deleteTransaction } = useFinance();
  const summary = getMonthlySummary(transactions, budget);
  const availableBalance = getAvailableBalance(transactions);
  const budgetPace = getBudgetPace(summary, budget);
  const recentTransactions = transactions.slice(0, 4);
  const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date());

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Overview</Text>
          <Text style={styles.heading}>A cleaner view of {monthLabel}.</Text>
          <Text style={styles.subheading}>
            {transactions.length === 0
              ? "Start with one entry and the rest of the app will come alive."
              : `${transactions.length} entries tracked with a calm monthly snapshot.`}
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
        remainingBudget={summary.remainingBudget}
        savingsRate={summary.savingsRate}
      />

      {!loading && budget.monthlyBudget > 0 ? <BudgetPaceCard pace={budgetPace} /> : null}

      {loading ? <LoadingState /> : <InsightCard message={getWeeklyFoodInsight(transactions)} />}

      <SectionHeader title="Recent activity" />
      {loading ? (
        <LoadingState label="Fetching recent transactions..." />
      ) : recentTransactions.length === 0 ? (
        <EmptyState
          title="Your ledger is still quiet"
          description="Add one expense or income entry and the home screen will start surfacing balance, pace, and patterns."
          actionLabel="Add first entry"
          onAction={() => openQuickAdd()}
        />
      ) : (
        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text style={styles.listEyebrow}>Latest moves</Text>
            <Text style={styles.listSummary}>
              {summary.expenses > 0
                ? `${formatCurrency(summary.expenses / Math.max(recentTransactions.length, 1))} avg per entry`
                : "Fresh and tidy"}
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
});
