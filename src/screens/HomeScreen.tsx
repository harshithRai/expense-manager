import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ArrowRight, Sparkles, Waves } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BalanceCard } from "@/components/cards/BalanceCard";
import { MonthlyFlowCard } from "@/components/cards/MonthlyFlowCard";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useFinance } from "@/hooks/useFinance";
import { theme } from "@/constants/theme";
import { buildMonthlyFlow, getAvailableBalance, getCategoryBudgetSummaries, getMonthlySummary, getOutflowShare } from "@/utils/finance";
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
  const categoryBudgetSummaries = getCategoryBudgetSummaries(transactions, budget).slice(0, 3);
  const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date());
  const pulseTone = summary.netCashflow >= 0 ? "Balanced rise" : "Pressure zone";

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>Financial weather</Text>
          <Text style={styles.heading}>Your money has a mood in {monthLabel}.</Text>
          <Text style={styles.subheading}>
            {transactions.length === 0
              ? "Log the first movement and the dashboard will start building a pulse around it."
              : `${transactions.length} ${transactions.length === 1 ? "entry" : "entries"} are shaping this month’s atmosphere.`}
          </Text>
        </View>

        <View style={styles.heroRow}>
          <View style={styles.signalCard}>
            <View style={styles.signalHeader}>
              <View style={styles.signalBadge}>
                <Waves size={14} color={theme.colors.accent} />
                <Text style={styles.signalBadgeText}>Pulse</Text>
              </View>
              <Text style={styles.signalTone}>{pulseTone}</Text>
            </View>
            <Text style={styles.signalValue}>{formatCurrency(availableBalance)}</Text>
            <View style={styles.signalStats}>
              <View style={styles.signalStat}>
                <Text style={styles.signalStatLabel}>Spent</Text>
                <Text style={styles.signalStatValue}>{formatCurrency(summary.expenses)}</Text>
              </View>
              <View style={styles.signalStat}>
                <Text style={styles.signalStatLabel}>Invested</Text>
                <Text style={styles.signalStatValue}>{formatCurrency(summary.investments)}</Text>
              </View>
            </View>
          </View>

          <PressableScale haptic="medium" onPress={() => openQuickAdd()} style={styles.quickPill}>
            <LinearGradient
              colors={["#F7FAFF", "#D8E5FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickGradient}
            >
              <Sparkles size={15} color={theme.colors.background} />
              <Text style={styles.quickPillText}>Quick add</Text>
              <ArrowRight size={16} color={theme.colors.background} />
            </LinearGradient>
          </PressableScale>
        </View>
      </Animated.View>

      <BalanceCard
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
            subtitle="See income, expenditure, and investments as separate waveforms instead of one flat summary."
            data={monthlyFlow}
          />
          <View style={styles.outflowCard}>
            <View style={styles.outflowHeader}>
              <Text style={styles.outflowEyebrow}>Outflow composition</Text>
              <Text style={styles.outflowTitle}>Where the pressure is coming from</Text>
              <Text style={styles.outflowSubtitle}>
                {totalOutflow > 0
                  ? `${Math.round(outflowShare.expenses)}% spending and ${Math.round(outflowShare.investments)}% investing.`
                  : "No outflow logged yet, so the pressure line is still flat."}
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
              <View style={[styles.outflowStat, styles.outflowStatSpend]}>
                <Text style={styles.outflowStatLabel}>Expenditure</Text>
                <Text style={styles.outflowStatValue}>{formatCurrency(summary.expenses)}</Text>
              </View>
              <View style={[styles.outflowStat, styles.outflowStatInvest]}>
                <Text style={styles.outflowStatLabel}>Investment</Text>
                <Text style={styles.outflowStatValue}>{formatCurrency(summary.investments)}</Text>
              </View>
            </View>
          </View>
          {categoryBudgetSummaries.length > 0 ? (
            <View style={styles.budgetCard}>
              <View style={styles.outflowHeader}>
                <Text style={styles.outflowEyebrow}>Category budgets</Text>
                <Text style={styles.outflowTitle}>Where limits are getting tested</Text>
                <Text style={styles.outflowSubtitle}>Current-month spending against the category budgets you configured in settings.</Text>
              </View>
              <View style={styles.budgetList}>
                {categoryBudgetSummaries.map((item) => {
                  const usage = Math.min(item.usage, 100);
                  const over = item.usage > 100;

                  return (
                    <View key={item.category} style={styles.budgetRow}>
                      <View style={styles.categoryLine}>
                        <Text style={styles.categoryName}>{item.category}</Text>
                        <Text style={styles.categoryValue}>
                          {formatCurrency(item.spent)} / {formatCurrency(item.limit)}
                        </Text>
                      </View>
                      <View style={styles.track}>
                        <View
                          style={[
                            styles.fill,
                            {
                              width: `${usage}%`,
                              backgroundColor: over ? theme.colors.danger : theme.colors.accent,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.budgetMeta}>
                        {over ? `${formatCurrency(Math.abs(item.remaining))} over budget` : `${formatCurrency(item.remaining)} remaining`}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}
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
            <View style={styles.listHeaderCopy}>
              <Text style={styles.listEyebrow}>Latest moves</Text>
              <Text style={styles.listSummary}>
                {recentTransactions.length === 1 ? "1 recent entry" : `${recentTransactions.length} recent entries`}
              </Text>
            </View>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live ledger</Text>
            </View>
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
  hero: {
    gap: theme.spacing.lg,
  },
  heroCopy: {
    gap: 10,
  },
  eyebrow: {
    color: "#BED4FF",
    fontSize: theme.typography.tiny,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  heading: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: "800",
    maxWidth: 310,
    lineHeight: 38,
    letterSpacing: -1,
  },
  subheading: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
    maxWidth: 320,
  },
  heroRow: {
    gap: theme.spacing.md,
  },
  signalCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: theme.spacing.lg,
    gap: 12,
    ...theme.shadow.soft,
  },
  signalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  signalBadge: {
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
  signalBadgeText: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "800",
  },
  signalTone: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.caption,
    fontWeight: "700",
  },
  signalValue: {
    color: theme.colors.text,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1.1,
  },
  signalStats: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  signalStat: {
    flex: 1,
    backgroundColor: "rgba(7,11,18,0.28)",
    borderRadius: theme.radius.md,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  signalStatLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.caption,
    fontWeight: "700",
  },
  signalStatValue: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  quickPill: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.pill,
    overflow: "hidden",
    ...theme.shadow.soft,
  },
  quickGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  quickPillText: {
    color: theme.colors.background,
    fontWeight: "800",
  },
  listCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: theme.radius.xl,
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
  listHeaderCopy: {
    gap: 4,
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
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(51,214,159,0.1)",
    borderWidth: 1,
    borderColor: "rgba(51,214,159,0.18)",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
  },
  liveText: {
    color: theme.colors.text,
    fontSize: theme.typography.tiny,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  list: {
    gap: theme.spacing.md,
  },
  outflowCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadow.soft,
  },
  outflowHeader: {
    gap: 6,
  },
  outflowEyebrow: {
    color: theme.colors.accent,
    fontSize: theme.typography.tiny,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    fontWeight: "800",
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
    height: 16,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
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
    borderRadius: theme.radius.md,
    padding: 14,
    gap: 8,
    borderWidth: 1,
  },
  outflowStatSpend: {
    backgroundColor: theme.colors.dangerSoft,
    borderColor: "rgba(255,107,129,0.2)",
  },
  outflowStatInvest: {
    backgroundColor: "rgba(121,168,255,0.12)",
    borderColor: "rgba(121,168,255,0.2)",
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
  budgetCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadow.soft,
  },
  budgetList: {
    gap: theme.spacing.md,
  },
  budgetRow: {
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
  budgetMeta: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.caption,
    fontWeight: "700",
  },
});
