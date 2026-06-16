import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ArrowDownRight, ArrowUpRight, Equal, Sparkles } from "lucide-react-native";
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
import { monthKey } from "@/utils/date";
import { Transaction } from "@/types";
import { formatCurrency } from "@/utils/currency";

export function InsightsScreen() {
  const { transactions, budget, loading, openQuickAdd } = useFinance();
  const currentMonth = getCurrentMonthTransactions(transactions);
  const previousMonth = useMemo(() => getPreviousMonthTransactions(transactions), [transactions]);
  const summary = getMonthlySummary(transactions, budget);
  const previousSummary = getMonthSummary(previousMonth, budget.monthlyBudget);
  const monthlyFlow = buildMonthlyFlow(transactions);
  const spendingTotals = getCategoryTotals(currentMonth, "expense");
  const investmentTotals = getCategoryTotals(currentMonth, "investment");
  const topSpend = getTopCategory(currentMonth, "expense");
  const topInvestment = getTopCategory(currentMonth, "investment");
  const outflowShare = getOutflowShare(summary);
  const totalOutflow = summary.expenses + summary.investments;
  const maxOutflow = Math.max(...Object.values({ ...spendingTotals, ...investmentTotals }), 1);
  const incomeDelta = summary.income - previousSummary.income;
  const outflowDelta = totalOutflow - (previousSummary.expenses + previousSummary.investments);
  const netDelta = summary.netCashflow - previousSummary.netCashflow;
  const budgetDelta = summary.remainingBudget - previousSummary.remainingBudget;
  const movement = getLargestCategoryMovement(currentMonth, previousMonth);
  const insightLines = buildInsightLines({
    summary,
    previousSummary,
    topSpend,
    topInvestment,
    movement,
  });

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
        <Text style={styles.subheading}>Read what changed this month, not just what exists right now.</Text>
      </View>

      <View style={styles.storyCard}>
        <View style={styles.storyHeader}>
          <View style={styles.storyBadge}>
            <Sparkles size={14} color={theme.colors.accent} />
            <Text style={styles.storyBadgeText}>Monthly read</Text>
          </View>
          <Text style={styles.storyTitle}>What stands out now</Text>
        </View>
        <View style={styles.storyList}>
          {insightLines.map((line) => (
            <Text key={line} style={styles.storyLine}>
              {line}
            </Text>
          ))}
        </View>
      </View>

      <MonthlyFlowCard
        title="Cash flow by month"
        subtitle="Compare what came in against what went out to spending and investments."
        data={monthlyFlow}
      />

      <View style={styles.signalGrid}>
        <SignalCard
          label="Income"
          value={formatCurrency(summary.income)}
          delta={incomeDelta}
          tone="income"
          helper="Compared with last month"
        />
        <SignalCard
          label="Outflow"
          value={formatCurrency(totalOutflow)}
          delta={outflowDelta}
          tone="outflow"
          helper="Expenses plus investments"
        />
        <SignalCard
          label="Net cash flow"
          value={formatCurrency(summary.netCashflow)}
          delta={netDelta}
          tone="net"
          helper="After spend and investing"
        />
        <SignalCard
          label="Budget left"
          value={formatCurrency(summary.remainingBudget)}
          delta={budgetDelta}
          tone="budget"
          helper="Remaining against budget"
        />
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

      {movement ? (
        <View style={styles.movementCard}>
          <Text style={styles.cardTitle}>Largest category movement</Text>
          <View style={styles.movementRow}>
            <View>
              <Text style={styles.movementCategory}>{movement.category}</Text>
              <Text style={styles.cardCopy}>{movement.type === "expense" ? "Spending category" : "Investment category"}</Text>
            </View>
            <DeltaBadge delta={movement.delta} inverseBad={movement.type === "expense"} />
          </View>
          <Text style={styles.cardCopy}>
            {formatCurrency(movement.current)} this month versus {formatCurrency(movement.previous)} last month.
          </Text>
        </View>
      ) : null}

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

function SignalCard({
  label,
  value,
  delta,
  tone,
  helper,
}: {
  label: string;
  value: string;
  delta: number;
  tone: "income" | "outflow" | "net" | "budget";
  helper: string;
}) {
  const accentColor =
    tone === "income" ? theme.colors.success : tone === "outflow" ? theme.colors.danger : tone === "budget" ? theme.colors.accent : theme.colors.text;

  return (
    <View style={styles.signalCard}>
      <Text style={styles.signalLabel}>{label}</Text>
      <Text style={styles.signalValue}>{value}</Text>
      <View style={styles.signalFooter}>
        <Text style={styles.signalHelper}>{helper}</Text>
        <DeltaBadge delta={delta} accentColor={accentColor} inverseBad={tone === "outflow"} />
      </View>
    </View>
  );
}

function DeltaBadge({
  delta,
  accentColor,
  inverseBad,
}: {
  delta: number;
  accentColor?: string;
  inverseBad?: boolean;
}) {
  const isNeutral = delta === 0;
  const positiveIsGood = !inverseBad;
  const isPositive = delta > 0;
  const toneColor = isNeutral ? theme.colors.textSoft : isPositive === positiveIsGood ? theme.colors.success : theme.colors.danger;
  const Icon = isNeutral ? Equal : isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <View style={[styles.deltaPill, { borderColor: `${toneColor}33`, backgroundColor: `${toneColor}14` }]}>
      <Icon size={13} color={accentColor ?? toneColor} />
      <Text style={[styles.deltaText, { color: toneColor }]}>
        {isNeutral ? "Flat" : `${delta > 0 ? "+" : "-"}${formatCurrency(Math.abs(delta)).replace("₹", "")}`}
      </Text>
    </View>
  );
}

function getPreviousMonthTransactions(transactions: Transaction[]) {
  if (transactions.length === 0) {
    return [];
  }

  const currentDate = new Date();
  const previousDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const previousKey = monthKey(previousDate.toISOString());
  return transactions.filter((transaction) => monthKey(transaction.date) === previousKey);
}

function getMonthSummary(transactions: Transaction[], monthlyBudget: number) {
  const income = transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const investments = transactions.filter((item) => item.type === "investment").reduce((sum, item) => sum + item.amount, 0);

  return {
    income,
    expenses,
    investments,
    remainingBudget: monthlyBudget - expenses,
    netCashflow: income - expenses - investments,
  };
}

function getLargestCategoryMovement(currentMonth: Transaction[], previousMonth: Transaction[]) {
  const currentExpenseTotals = getCategoryTotals(currentMonth, "expense");
  const currentInvestmentTotals = getCategoryTotals(currentMonth, "investment");
  const previousExpenseTotals = getCategoryTotals(previousMonth, "expense");
  const previousInvestmentTotals = getCategoryTotals(previousMonth, "investment");

  const changes = [
    ...getCategoryChanges("expense", currentExpenseTotals, previousExpenseTotals),
    ...getCategoryChanges("investment", currentInvestmentTotals, previousInvestmentTotals),
  ];

  return changes.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
}

function getCategoryChanges(
  type: "expense" | "investment",
  currentTotals: Record<string, number>,
  previousTotals: Record<string, number>
) {
  const categories = new Set([...Object.keys(currentTotals), ...Object.keys(previousTotals)]);

  return Array.from(categories).map((category) => {
    const current = currentTotals[category] ?? 0;
    const previous = previousTotals[category] ?? 0;
    return {
      type,
      category,
      current,
      previous,
      delta: current - previous,
    };
  });
}

function buildInsightLines({
  summary,
  previousSummary,
  topSpend,
  topInvestment,
  movement,
}: {
  summary: ReturnType<typeof getMonthlySummary>;
  previousSummary: ReturnType<typeof getMonthSummary>;
  topSpend: ReturnType<typeof getTopCategory>;
  topInvestment: ReturnType<typeof getTopCategory>;
  movement?: ReturnType<typeof getLargestCategoryMovement>;
}) {
  const lines = [];

  if (summary.netCashflow > previousSummary.netCashflow) {
    lines.push(`Net cash flow improved by ${formatCurrency(summary.netCashflow - previousSummary.netCashflow)} versus last month.`);
  } else if (summary.netCashflow < previousSummary.netCashflow) {
    lines.push(`Net cash flow softened by ${formatCurrency(previousSummary.netCashflow - summary.netCashflow)} compared with last month.`);
  } else {
    lines.push("Net cash flow is tracking flat against last month.");
  }

  if (topSpend) {
    lines.push(`${topSpend[0]} is your biggest spending category at ${formatCurrency(topSpend[1])}.`);
  }

  if (topInvestment) {
    lines.push(`${topInvestment[0]} leads your investment allocation at ${formatCurrency(topInvestment[1])}.`);
  }

  if (movement && movement.delta !== 0) {
    const direction = movement.delta > 0 ? "rose" : "fell";
    lines.push(`${movement.category} ${direction} by ${formatCurrency(Math.abs(movement.delta))} month over month.`);
  }

  return lines.slice(0, 3);
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
    lineHeight: 22,
  },
  storyCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
    ...theme.shadow.soft,
  },
  storyHeader: {
    gap: 8,
  },
  storyBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(121,168,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(121,168,255,0.24)",
  },
  storyBadgeText: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "800",
  },
  storyTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h3,
    fontWeight: "800",
  },
  storyList: {
    gap: 10,
  },
  storyLine: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  signalGrid: {
    gap: theme.spacing.md,
  },
  signalCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
    ...theme.shadow.soft,
  },
  signalLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.caption,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "800",
  },
  signalValue: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: "800",
  },
  signalFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  signalHelper: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    lineHeight: 18,
  },
  deltaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  deltaText: {
    fontSize: theme.typography.caption,
    fontWeight: "800",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
    ...theme.shadow.soft,
  },
  movementCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
    ...theme.shadow.soft,
  },
  movementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  movementCategory: {
    color: theme.colors.text,
    fontSize: theme.typography.h3,
    fontWeight: "800",
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
