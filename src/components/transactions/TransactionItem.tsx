import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ArrowDownLeft, ArrowUpRight, ChevronRight, PiggyBank, Trash2 } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { Transaction } from "@/types";
import { formatCurrency } from "@/utils/currency";
import { formatFriendlyDate } from "@/utils/date";
import { PressableScale } from "@/components/ui/PressableScale";

type Props = {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
};

export function TransactionItem({ transaction, onEdit, onDelete }: Props) {
  const isIncome = transaction.type === "income";
  const isInvestment = transaction.type === "investment";

  return (
    <PressableScale haptic="light" onPress={onEdit} style={styles.card}>
      <View
        style={[
          styles.iconWrap,
          isIncome ? styles.iconIncome : isInvestment ? styles.iconInvestment : styles.iconExpense,
        ]}
      >
        {isIncome ? (
          <ArrowDownLeft size={18} color={theme.colors.success} />
        ) : isInvestment ? (
          <PiggyBank size={18} color={theme.colors.accent} />
        ) : (
          <ArrowUpRight size={18} color={theme.colors.danger} />
        )}
      </View>

      <View style={styles.main}>
        <View style={styles.row}>
          <View style={styles.titleWrap}>
            <Text numberOfLines={1} style={styles.title}>
              {transaction.title}
            </Text>
            <Text style={styles.meta}>
              {transaction.category} • {formatFriendlyDate(transaction.date)}
            </Text>
          </View>
          <View style={styles.amountWrap}>
            <Text
              style={[
                styles.amount,
                isIncome ? styles.amountIncome : isInvestment ? styles.amountInvestment : styles.amountExpense,
              ]}
            >
              {isIncome ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </Text>
            <ChevronRight size={16} color={theme.colors.textSoft} />
          </View>
        </View>

        <View style={styles.footer}>
          {transaction.note ? <Text style={styles.note}>{transaction.note}</Text> : <View />}
          <PressableScale haptic="medium" onPress={onDelete} style={styles.actionButton}>
            <Trash2 size={14} color={theme.colors.danger} />
          </PressableScale>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    ...theme.shadow.soft,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  iconIncome: {
    backgroundColor: "rgba(51,214,159,0.1)",
  },
  iconExpense: {
    backgroundColor: "rgba(255,107,129,0.1)",
  },
  iconInvestment: {
    backgroundColor: "rgba(121,168,255,0.14)",
  },
  main: {
    flex: 1,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  titleWrap: {
    flex: 1,
    gap: 5,
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  amountWrap: {
    alignItems: "flex-end",
    gap: 6,
  },
  amount: {
    fontSize: 16,
    fontWeight: "800",
  },
  amountIncome: {
    color: theme.colors.success,
  },
  amountExpense: {
    color: theme.colors.text,
  },
  amountInvestment: {
    color: theme.colors.accent,
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: theme.spacing.md,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  note: {
    flex: 1,
    color: theme.colors.textSoft,
    fontSize: theme.typography.caption,
    lineHeight: 18,
  },
});
