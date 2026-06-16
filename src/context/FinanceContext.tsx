import React, { createContext, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, Info, TriangleAlert } from "lucide-react-native";
import { Budget, QuickAddState, RecurrenceFrequency, Transaction, TransactionDraft } from "@/types";
import { theme } from "@/constants/theme";
import { clearAllStoredData, loadBudget, loadTransactions, saveBudget, saveTransactions } from "@/storage";
import { toISODate } from "@/utils/date";

type FinanceContextValue = {
  transactions: Transaction[];
  budget: Budget;
  loading: boolean;
  quickAdd: QuickAddState;
  sheetRef: React.RefObject<BottomSheetModal | null>;
  openQuickAdd: (transaction?: Transaction) => void;
  closeQuickAdd: () => void;
  syncQuickAddClosed: () => void;
  addTransaction: (draft: TransactionDraft) => Promise<void>;
  updateTransaction: (id: string, draft: TransactionDraft) => Promise<void>;
  deleteTransaction: (id: string) => void;
  setMonthlyBudget: (amount: number) => Promise<void>;
  setCategoryBudgets: (budgets: Record<string, number>) => Promise<void>;
  clearAllData: () => void;
};

export const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<Budget>({ monthlyBudget: 25000 });
  const [loading, setLoading] = useState(true);
  const [quickAdd, setQuickAdd] = useState<QuickAddState>({ visible: false });
  const [feedback, setFeedback] = useState<{ message: string; tone: "success" | "info" | "warning" } | null>(null);
  const sheetRef = useRef<BottomSheetModal>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function bootstrap() {
      try {
        const [storedTransactions, storedBudget] = await Promise.all([loadTransactions(), loadBudget()]);
        const normalizedBudget = {
          monthlyBudget: storedBudget.monthlyBudget,
          categoryBudgets: storedBudget.categoryBudgets ?? {},
        };
        const normalizedTransactions = materializeRecurringTransactions(storedTransactions);
        setTransactions(normalizedTransactions.sort((a, b) => +new Date(b.date) - +new Date(a.date)));
        setBudget(normalizedBudget);
        if (normalizedTransactions.length !== storedTransactions.length) {
          await saveTransactions(normalizedTransactions);
        }
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const showFeedback = (message: string, tone: "success" | "info" | "warning" = "info") => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    setFeedback({ message, tone });
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
    }, 2200);
  };

  const persistTransactions = async (nextTransactions: Transaction[]) => {
    setTransactions(nextTransactions);
    await saveTransactions(nextTransactions);
  };

  useEffect(() => {
    if (loading) {
      return;
    }

    const normalizedTransactions = materializeRecurringTransactions(transactions);
    if (normalizedTransactions.length !== transactions.length) {
      void persistTransactions(normalizedTransactions.sort((a, b) => +new Date(b.date) - +new Date(a.date)));
    }
  }, [loading, transactions]);

  const openQuickAdd = (transaction?: Transaction) => {
    void Haptics.selectionAsync();
    setQuickAdd({ visible: true, editingTransactionId: transaction?.id });
    sheetRef.current?.present();
  };

  const closeQuickAdd = () => {
    setQuickAdd({ visible: false });
    sheetRef.current?.dismiss();
  };

  const syncQuickAddClosed = () => {
    setQuickAdd({ visible: false });
  };

  const addTransaction = async (draft: TransactionDraft) => {
    const now = toISODate();
    const transaction: Transaction = {
      id: `${Date.now()}`,
      title: draft.title.trim() || draft.category,
      amount: Number(draft.amount),
      type: draft.type,
      category: draft.category,
      date: draft.date,
      note: draft.note.trim() || undefined,
      recurrence: draft.recurrence === "none" ? undefined : draft.recurrence,
      createdAt: now,
      updatedAt: now,
    };

    const next = [transaction, ...transactions].sort((a, b) => +new Date(b.date) - +new Date(a.date));
    await persistTransactions(next);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showFeedback("Transaction added", "success");
  };

  const updateTransaction = async (id: string, draft: TransactionDraft) => {
    const next = transactions
      .map((item) =>
        item.id === id
          ? {
              ...item,
              title: draft.title.trim() || draft.category,
              amount: Number(draft.amount),
              type: draft.type,
              category: draft.category,
              date: draft.date,
              note: draft.note.trim() || undefined,
              recurrence: draft.recurrence === "none" ? undefined : draft.recurrence,
              updatedAt: toISODate(),
            }
          : item
      )
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));

    await persistTransactions(next);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showFeedback("Transaction updated", "info");
  };

  const deleteTransaction = (id: string) => {
    Alert.alert("Delete transaction", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const next = transactions.filter((item) => item.id !== id);
          await persistTransactions(next);
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          showFeedback("Transaction deleted", "warning");
        },
      },
    ]);
  };

  const setMonthlyBudget = async (amount: number) => {
    const nextBudget = { ...budget, monthlyBudget: amount };
    setBudget(nextBudget);
    await saveBudget(nextBudget);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showFeedback("Budget saved", "success");
  };

  const setCategoryBudgets = async (nextCategoryBudgets: Record<string, number>) => {
    const nextBudget = {
      ...budget,
      categoryBudgets: Object.fromEntries(Object.entries(nextCategoryBudgets).filter(([, value]) => value > 0)),
    };
    setBudget(nextBudget);
    await saveBudget(nextBudget);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showFeedback("Category budgets saved", "success");
  };

  const clearAllData = () => {
    Alert.alert("Clear all data", "This will remove all transactions and budget settings.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          setTransactions([]);
          setBudget({ monthlyBudget: 25000, categoryBudgets: {} });
          await clearAllStoredData();
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          showFeedback("All data cleared", "warning");
        },
      },
    ]);
  };

  const value = {
    transactions,
    budget,
    loading,
    quickAdd,
    sheetRef,
    openQuickAdd,
    closeQuickAdd,
    syncQuickAddClosed,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setMonthlyBudget,
    setCategoryBudgets,
    clearAllData,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
      {feedback ? <FeedbackBanner feedback={feedback} topInset={insets.top} /> : null}
    </FinanceContext.Provider>
  );
}

function materializeRecurringTransactions(transactions: Transaction[]) {
  const today = startOfDay(new Date());
  const existingIds = new Set(transactions.map((transaction) => transaction.id));
  const nextTransactions = [...transactions];
  const roots = transactions.filter((transaction) => transaction.recurrence && !transaction.recurrenceSourceId);

  roots.forEach((root) => {
    const series = nextTransactions
      .filter((transaction) => transaction.id === root.id || transaction.recurrenceSourceId === root.id)
      .sort((a, b) => +new Date(a.date) - +new Date(b.date));

    let latest = series[series.length - 1];
    if (!latest?.recurrence) {
      latest = { ...root };
    }

    let nextDate = shiftRecurringDate(new Date(latest.date), root.recurrence!);

    while (startOfDay(nextDate).getTime() <= today.getTime()) {
      const nextDateIso = toISODate(nextDate);
      const generatedId = `${root.id}-${nextDateIso.slice(0, 10)}`;

      if (!existingIds.has(generatedId)) {
        nextTransactions.push({
          id: generatedId,
          title: root.title,
          amount: root.amount,
          type: root.type,
          category: root.category,
          date: nextDateIso,
          note: root.note,
          recurrence: root.recurrence,
          recurrenceSourceId: root.id,
          createdAt: toISODate(),
          updatedAt: toISODate(),
        });
        existingIds.add(generatedId);
      }

      nextDate = shiftRecurringDate(nextDate, root.recurrence!);
    }
  });

  return nextTransactions;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function shiftRecurringDate(date: Date, recurrence: RecurrenceFrequency) {
  const next = new Date(date);
  if (recurrence === "weekly") {
    next.setDate(next.getDate() + 7);
    return next;
  }

  next.setMonth(next.getMonth() + 1);
  return next;
}

function FeedbackBanner({
  feedback,
  topInset,
}: {
  feedback: { message: string; tone: "success" | "info" | "warning" };
  topInset: number;
}) {
  const iconColor =
    feedback.tone === "success" ? theme.colors.success : feedback.tone === "warning" ? theme.colors.danger : theme.colors.accent;
  const Icon = feedback.tone === "success" ? Check : feedback.tone === "warning" ? TriangleAlert : Info;

  return (
    <View pointerEvents="none" style={[styles.feedbackLayer, { top: topInset + 10 }]}>
      <Animated.View entering={FadeInDown.duration(240)} exiting={FadeOutUp.duration(220)} style={styles.feedbackCard}>
        <View style={[styles.feedbackIcon, { backgroundColor: `${iconColor}22`, borderColor: `${iconColor}33` }]}>
          <Icon size={14} color={iconColor} />
        </View>
        <Text style={styles.feedbackText}>{feedback.message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  feedbackLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  feedbackCard: {
    minWidth: 180,
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(14,19,32,0.96)",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 11,
    ...theme.shadow.soft,
  },
  feedbackIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  feedbackText: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "800",
  },
});
