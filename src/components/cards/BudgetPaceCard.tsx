import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Activity, ArrowDownRight, ArrowUpRight, Target } from "lucide-react-native";
import { BudgetPace } from "@/types";
import { theme } from "@/constants/theme";
import { formatCurrency } from "@/utils/currency";

type Props = {
  pace: BudgetPace;
};

const copyByStatus = {
  ahead: {
    title: "Ahead of budget pace",
    accent: theme.colors.success,
    icon: ArrowDownRight,
  },
  "on-track": {
    title: "On budget pace",
    accent: theme.colors.accent,
    icon: Target,
  },
  over: {
    title: "Running hot this month",
    accent: theme.colors.warning,
    icon: ArrowUpRight,
  },
} as const;

export function BudgetPaceCard({ pace }: Props) {
  const status = copyByStatus[pace.status];
  const StatusIcon = status.icon;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${status.accent}20` }]}>
          <StatusIcon color={status.accent} size={18} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Budget pace</Text>
          <Text style={styles.title}>{status.title}</Text>
        </View>
      </View>

      <View style={styles.heroRow}>
        <View>
          <Text style={styles.heroLabel}>Safe daily spend</Text>
          <Text style={styles.heroValue}>{formatCurrency(pace.recommendedDailySpend)}</Text>
        </View>
        <View style={styles.daysPill}>
          <Activity size={14} color={theme.colors.textSoft} />
          <Text style={styles.daysText}>{pace.daysLeft} days left</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Projected spend</Text>
          <Text style={styles.statValue}>{formatCurrency(pace.projectedMonthEndSpend)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Current daily pace</Text>
          <Text style={styles.statValue}>{formatCurrency(pace.actualDailySpend)}</Text>
        </View>
      </View>
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
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.tiny,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h3,
    fontWeight: "800",
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  heroLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  heroValue: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: "800",
  },
  daysPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
  },
  daysText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  stat: {
    flex: 1,
    gap: 8,
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  statValue: {
    color: theme.colors.text,
    fontWeight: "800",
  },
});
