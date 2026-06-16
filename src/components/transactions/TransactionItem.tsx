import React, { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { ArrowDownLeft, ArrowUpRight, ChevronRight, PencilLine, PiggyBank, Trash2 } from "lucide-react-native";
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
  const swipeRef = useRef<Swipeable>(null);
  const isIncome = transaction.type === "income";
  const isInvestment = transaction.type === "investment";

  const closeAndRun = (callback: () => void) => {
    swipeRef.current?.close();
    callback();
  };

  return (
    <Swipeable
      ref={swipeRef}
      overshootRight={false}
      renderRightActions={() => (
        <View style={styles.revealActions}>
          <Pressable onPress={() => closeAndRun(onEdit)} style={[styles.revealButton, styles.revealEdit]}>
            <PencilLine size={16} color={theme.colors.text} />
            <Text style={styles.revealText}>Edit</Text>
          </Pressable>
          <Pressable onPress={() => closeAndRun(onDelete)} style={[styles.revealButton, styles.revealDelete]}>
            <Trash2 size={16} color={theme.colors.danger} />
            <Text style={[styles.revealText, styles.revealDeleteText]}>Delete</Text>
          </Pressable>
        </View>
      )}
    >
      <PressableScale haptic="light" onPress={onEdit} style={styles.card}>
        <View style={[styles.edgeGlow, isIncome ? styles.edgeIncome : isInvestment ? styles.edgeInvestment : styles.edgeExpense]} />
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
              {transaction.recurrence ? (
                <View style={styles.recurringBadge}>
                  <Text style={styles.recurringText}>
                    {transaction.recurrence === "weekly" ? "Weekly repeat" : "Monthly repeat"}
                  </Text>
                </View>
              ) : null}
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
            {transaction.note ? <Text style={styles.note}>{transaction.note}</Text> : <Text style={styles.hint}>Swipe left for actions</Text>}
            <View style={styles.actions}>
              <View style={styles.actionBadge}>
                <PencilLine size={12} color={theme.colors.textSoft} />
              </View>
              <View style={[styles.actionBadge, styles.deleteBadge]}>
                <Trash2 size={12} color={theme.colors.danger} />
              </View>
            </View>
          </View>
        </View>
      </PressableScale>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    flexDirection: "row",
    gap: theme.spacing.md,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    ...theme.shadow.soft,
  },
  revealActions: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    marginLeft: 12,
  },
  revealButton: {
    width: 86,
    borderRadius: theme.radius.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  revealEdit: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  revealDelete: {
    backgroundColor: "rgba(255,107,129,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,107,129,0.18)",
  },
  revealText: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "800",
  },
  revealDeleteText: {
    color: theme.colors.danger,
  },
  edgeGlow: {
    position: "absolute",
    top: 14,
    bottom: 14,
    left: 0,
    width: 3,
    borderRadius: 999,
  },
  edgeIncome: {
    backgroundColor: theme.colors.success,
  },
  edgeExpense: {
    backgroundColor: theme.colors.danger,
  },
  edgeInvestment: {
    backgroundColor: theme.colors.accent,
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
  recurringBadge: {
    alignSelf: "flex-start",
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(121,168,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(121,168,255,0.2)",
  },
  recurringText: {
    color: theme.colors.text,
    fontSize: theme.typography.tiny,
    fontWeight: "800",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: theme.spacing.md,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  deleteBadge: {
    backgroundColor: "rgba(255,107,129,0.08)",
    borderColor: "rgba(255,107,129,0.18)",
  },
  note: {
    flex: 1,
    color: theme.colors.textSoft,
    fontSize: theme.typography.caption,
    lineHeight: 18,
  },
  hint: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.caption,
    lineHeight: 18,
  },
});
