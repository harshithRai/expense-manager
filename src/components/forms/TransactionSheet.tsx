import React, { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { BottomSheetBackdrop, BottomSheetFooter, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Plus } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, INVESTMENT_CATEGORIES } from "@/constants/categories";
import { useFinance } from "@/hooks/useFinance";
import { Chip } from "@/components/ui/Chip";
import { PressableScale } from "@/components/ui/PressableScale";
import { TransactionDraft } from "@/types";
import { formatCurrency } from "@/utils/currency";
import { formatFriendlyDate, formatMonthLabel, toISODate } from "@/utils/date";

function createDefaultDraft(): TransactionDraft {
  return {
    title: "",
    amount: "",
    type: "expense",
    category: getDefaultCategory("expense"),
    date: toISODate(),
    note: "",
    recurrence: "none",
  };
}

export function TransactionSheet() {
  const { quickAdd, sheetRef, transactions, addTransaction, updateTransaction, closeQuickAdd, syncQuickAddClosed } = useFinance();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<TransactionDraft>(createDefaultDraft);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "success">("idle");
  const [showDetails, setShowDetails] = useState(false);
  const [showDateControls, setShowDateControls] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const amountRef = useRef<TextInput>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapPoints = useMemo(() => ["68%", "84%"], []);
  const navGuardHeight = Platform.OS === "android" ? Math.max(insets.bottom + 8, 40) : Math.max(insets.bottom, 16);
  const today = useMemo(() => startOfDay(new Date()), []);
  const selectedDate = new Date(draft.date);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(selectedDate));
  const isCurrentMonthVisible =
    visibleMonth.getFullYear() === today.getFullYear() && visibleMonth.getMonth() === today.getMonth();
  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);

  useEffect(() => {
    const current = transactions.find((item) => item.id === quickAdd.editingTransactionId);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    setSaveState("idle");

    if (current) {
      const nextDate = new Date(current.date);
      setDraft({
        title: current.title,
        amount: String(current.amount),
        type: current.type,
        category: current.category,
        date: toISODate(nextDate),
        note: current.note ?? "",
        recurrence: current.recurrence ?? "none",
      });
      setShowDetails(Boolean(current.title || current.note));
      setShowDateControls(false);
      setVisibleMonth(startOfMonth(nextDate));
      return;
    }

    const nextDate = new Date();
    setDraft(createDefaultDraft());
    setShowDetails(false);
    setShowDateControls(false);
    setVisibleMonth(startOfMonth(nextDate));
  }, [quickAdd.editingTransactionId, transactions]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const categories =
    draft.type === "expense"
      ? EXPENSE_CATEGORIES
      : draft.type === "investment"
        ? INVESTMENT_CATEGORIES
        : INCOME_CATEGORIES;

  useEffect(() => {
    if (!categories.some((category) => category === draft.category)) {
      setDraft((current) => ({ ...current, category: getDefaultCategory(current.type) }));
    }
  }, [categories, draft.category]);

  const isValid = Number(draft.amount) > 0 && Boolean(draft.category);
  const isEditing = Boolean(quickAdd.editingTransactionId);
  const formattedAmount = draft.amount ? formatCurrency(Number(draft.amount)) : formatCurrency(0);
  const summaryTone =
    draft.type === "expense" ? "Outgoing" : draft.type === "investment" ? "Future value" : "Incoming";
  const completionCount = Number(Boolean(draft.amount)) + Number(Boolean(draft.category)) + Number(Boolean(draft.date));
  const recurrenceLabel =
    draft.recurrence === "weekly" ? "Repeats weekly" : draft.recurrence === "monthly" ? "Repeats monthly" : "One-time entry";
  const amountPresets =
    draft.type === "expense"
      ? ["200", "500", "1000", "2500"]
      : draft.type === "investment"
        ? ["1000", "2500", "5000", "10000"]
        : ["5000", "10000", "25000"];
  const typeAccent =
    draft.type === "expense" ? theme.colors.danger : draft.type === "investment" ? theme.colors.accent : theme.colors.success;
  const typeAccentSoft =
    draft.type === "expense"
      ? "rgba(255,107,129,0.18)"
      : draft.type === "investment"
        ? "rgba(121,168,255,0.18)"
        : "rgba(51,214,159,0.18)";
  const typeAccentBorder =
    draft.type === "expense"
      ? "rgba(255,107,129,0.26)"
      : draft.type === "investment"
        ? "rgba(121,168,255,0.26)"
        : "rgba(51,214,159,0.26)";
  const footerHeight = saveState === "success" ? 158 : 104;
  const contentBottomPadding =
    footerHeight + navGuardHeight + theme.spacing.xl + (showDetails || keyboardVisible ? theme.spacing.xxxl : theme.spacing.lg);

  const handleSheetChange = (index: number) => {
    if (index >= 0 && !isEditing) {
      setTimeout(() => amountRef.current?.focus(), 180);
    }
  };

  const handleSubmit = async () => {
    if (!isValid || saving || saveState === "success") {
      return;
    }

    Keyboard.dismiss();
    setSaving(true);

    try {
      if (quickAdd.editingTransactionId) {
        await updateTransaction(quickAdd.editingTransactionId, draft);
      } else {
        await addTransaction(draft);
      }

      setSaveState("success");
      saveTimeoutRef.current = setTimeout(() => {
        setDraft(createDefaultDraft());
        setShowDetails(false);
        setShowDateControls(false);
        setSaveState("idle");
        closeQuickAdd();
      }, 900);
    } finally {
      setSaving(false);
    }
  };

  const applyAmountPreset = (value: string) => {
    setDraft((current) => ({ ...current, amount: value }));
  };

  const updateDraftCategory = (nextCategory: string) => {
    setDraft((current) => ({
      ...current,
      category: nextCategory,
      title: nextCategory,
    }));
  };

  const updateDraftType = (nextType: TransactionDraft["type"]) => {
    const nextCategory = getDefaultCategory(nextType);
    setDraft((current) => ({
      ...current,
      type: nextType,
      category: nextCategory,
      title: nextCategory,
    }));
  };

  const setDraftDate = (dateValue: string) => {
    setDraft((current) => ({ ...current, date: dateValue }));
    setShowDateControls(false);
  };

  const longDateLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(selectedDate);

  const saveButtonLabel =
    saveState === "success" ? (isEditing ? "Changes saved" : "Transaction saved") : saving ? "Saving..." : isEditing ? "Save changes" : "Save transaction";

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      onChange={handleSheetChange}
      onDismiss={syncQuickAddClosed}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.72}
          pressBehavior="close"
        />
      )}
      footerComponent={(props) => (
        <BottomSheetFooter {...props} bottomInset={0}>
          <View style={[styles.footer, { minHeight: footerHeight, paddingBottom: navGuardHeight }]}>
            {saveState === "success" ? (
              <View style={[styles.successBanner, { borderColor: typeAccentBorder, backgroundColor: typeAccentSoft }]}>
                <View style={[styles.successIcon, { backgroundColor: typeAccent }]}>
                  <Check size={14} color={theme.colors.background} />
                </View>
                <View style={styles.successCopy}>
                  <Text style={styles.successTitle}>{isEditing ? "Entry updated" : "Entry recorded"}</Text>
                  <Text style={styles.successBody}>The ledger and insights will refresh with this change.</Text>
                </View>
              </View>
            ) : null}

            <PressableScale
              haptic="medium"
              disabled={!isValid || saving || saveState === "success"}
              onPress={handleSubmit}
              style={[
                styles.saveButton,
                { backgroundColor: typeAccent },
                (!isValid || saving || saveState === "success") && styles.saveButtonDisabled,
              ]}
            >
              <Text style={styles.saveText}>{saveButtonLabel}</Text>
            </PressableScale>
          </View>
        </BottomSheetFooter>
      )}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: contentBottomPadding }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.headerAura, { backgroundColor: typeAccentSoft, borderColor: typeAccentBorder }]}>
          <View style={[styles.headerAuraOrb, { backgroundColor: typeAccent }]} />
        </View>

        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{isEditing ? "Refine entry" : "Quick add"}</Text>
            <Text style={styles.subtitle}>Capture the amount first, then shape the story around it.</Text>
          </View>
          <PressableScale
            haptic="selection"
            onPress={() => {
              Keyboard.dismiss();
              setShowDateControls((current) => !current);
            }}
            style={[styles.datePill, { borderColor: typeAccentBorder }]}
          >
            <CalendarDays size={14} color={theme.colors.textMuted} />
            <Text style={styles.dateText}>{formatFriendlyDate(draft.date)}</Text>
          </PressableScale>
        </View>

        <View style={styles.composerSummary}>
          <View style={styles.composerSummaryRow}>
            <View>
              <Text style={styles.composerLabel}>Entry focus</Text>
              <Text style={styles.composerValue}>{summaryTone}</Text>
            </View>
            <View style={[styles.completionPill, { borderColor: typeAccentBorder, backgroundColor: typeAccentSoft }]}>
              <Text style={styles.completionText}>{completionCount}/3 ready</Text>
            </View>
          </View>
          <Text style={styles.composerMeta}>
            {draft.category} • {formatFriendlyDate(draft.date)} • {draft.type === "expense" ? "Expenditure" : draft.type === "investment" ? "Investment" : "Income"} • {recurrenceLabel}
          </Text>
        </View>

        <View style={styles.stepRail}>
          <View style={styles.stepItem}>
            <Text style={styles.stepIndex}>01</Text>
            <Text style={styles.stepLabel}>Choose type</Text>
          </View>
          <View style={styles.stepDivider} />
          <View style={styles.stepItem}>
            <Text style={styles.stepIndex}>02</Text>
            <Text style={styles.stepLabel}>Set amount</Text>
          </View>
          <View style={styles.stepDivider} />
          <View style={styles.stepItem}>
            <Text style={styles.stepIndex}>03</Text>
            <Text style={styles.stepLabel}>Pick category</Text>
          </View>
        </View>

        {showDateControls ? (
          <View style={styles.dateCard}>
            <View style={styles.dateAdjustRow}>
              <PressableScale
                haptic="selection"
                onPress={() => setVisibleMonth((current) => shiftMonth(current, -1))}
                style={styles.dateArrowButton}
              >
                <ChevronLeft size={16} color={theme.colors.text} />
              </PressableScale>
              <View style={styles.dateSummary}>
                <Text style={styles.dateSummaryLabel}>Select date</Text>
                <Text style={styles.dateSummaryValue}>{formatMonthLabel(visibleMonth.toISOString())}</Text>
              </View>
              <PressableScale
                haptic="selection"
                disabled={isCurrentMonthVisible}
                onPress={() => setVisibleMonth((current) => shiftMonth(current, 1))}
                style={[styles.dateArrowButton, isCurrentMonthVisible && styles.dateArrowButtonDisabled]}
              >
                <ChevronRight size={16} color={isCurrentMonthVisible ? theme.colors.textSoft : theme.colors.text} />
              </PressableScale>
            </View>

            <View style={styles.weekdaysRow}>
              {WEEKDAY_LABELS.map((label, index) => (
                <Text key={`${label}-${index}`} style={styles.weekdayLabel}>
                  {label}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((day) => {
                const isSelected = selectedDate.toDateString() === day.date.toDateString();
                const isFuture = day.date.getTime() > today.getTime();

                return (
                  <PressableScale
                    key={day.key}
                    haptic="selection"
                    disabled={isFuture}
                    onPress={() => setDraftDate(toISODate(day.date))}
                    style={[
                      styles.dayCell,
                      !day.inMonth && styles.dayCellMuted,
                      isSelected && styles.dayCellSelected,
                      isFuture && styles.dayCellDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayCellText,
                        !day.inMonth && styles.dayCellTextMuted,
                        isSelected && styles.dayCellTextSelected,
                        isFuture && styles.dayCellTextDisabled,
                      ]}
                    >
                      {day.date.getDate()}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>

            <View style={styles.dateFooter}>
              <Text style={styles.dateFooterText}>{longDateLabel}</Text>
              <Chip label="Today" active={selectedDate.toDateString() === today.toDateString()} onPress={() => setDraftDate(toISODate(today))} />
            </View>
          </View>
        ) : null}

        <View style={styles.typeRow}>
          {(["expense", "income", "investment"] as const).map((type) => (
            <PressableScale
              key={type}
              haptic="selection"
              onPress={() => updateDraftType(type)}
              style={[
                styles.typeButton,
                draft.type === type && styles.typeButtonActive,
                draft.type === type && { backgroundColor: typeAccent },
              ]}
            >
              <Text style={[styles.typeText, draft.type === type && styles.typeTextActive]}>
                {type === "expense" ? "Expenditure" : type === "investment" ? "Investment" : "Income"}
              </Text>
            </PressableScale>
          ))}
        </View>

        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.amountPreview}>{formattedAmount}</Text>
          </View>
          <TextInput
            ref={amountRef}
            value={draft.amount}
            onChangeText={(amount) => setDraft((current) => ({ ...current, amount: amount.replace(/[^0-9.]/g, "") }))}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={theme.colors.textSoft}
            style={styles.amountInput}
          />
          <Text style={styles.inputHint}>Use a clean number. The formatted amount updates as you type.</Text>
        </View>

        <View style={styles.presetRow}>
          {amountPresets.map((value) => (
            <Chip key={value} label={`₹${value}`} active={draft.amount === value} onPress={() => applyAmountPreset(value)} />
          ))}
        </View>

        <View style={styles.block}>
          <View style={styles.inputHeader}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.categoryPreview}>{draft.category}</Text>
          </View>
          <View style={styles.chips}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                active={draft.category === category}
                onPress={() => updateDraftCategory(category)}
              />
            ))}
          </View>
        </View>

        <View style={styles.block}>
          <View style={styles.inputHeader}>
            <Text style={styles.label}>Repeat</Text>
            <Text style={styles.categoryPreview}>{recurrenceLabel}</Text>
          </View>
          <View style={styles.chips}>
            <Chip label="one-time" active={draft.recurrence === "none"} onPress={() => setDraft((current) => ({ ...current, recurrence: "none" }))} />
            <Chip label="weekly" active={draft.recurrence === "weekly"} onPress={() => setDraft((current) => ({ ...current, recurrence: "weekly" }))} />
            <Chip label="monthly" active={draft.recurrence === "monthly"} onPress={() => setDraft((current) => ({ ...current, recurrence: "monthly" }))} />
          </View>
        </View>

        <PressableScale
          haptic="selection"
          onPress={() => {
            Keyboard.dismiss();
            setShowDetails((current) => !current);
          }}
          style={styles.detailsToggle}
        >
          <View style={styles.detailsToggleLeft}>
            <Plus size={15} color={theme.colors.textMuted} />
            <Text style={styles.detailsToggleText}>Optional details</Text>
          </View>
          <ChevronDown
            size={16}
            color={theme.colors.textSoft}
            style={{ transform: [{ rotate: showDetails ? "180deg" : "0deg" }] }}
          />
        </PressableScale>

        {showDetails ? (
          <View style={styles.detailsBlock}>
            <View style={styles.inputCard}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                value={draft.title}
                onChangeText={(title) => setDraft((current) => ({ ...current, title }))}
                placeholder="Optional title"
                placeholderTextColor={theme.colors.textSoft}
                style={styles.textInput}
              />
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.label}>Note</Text>
              <TextInput
                value={draft.note}
                onChangeText={(note) => setDraft((current) => ({ ...current, note }))}
                placeholder="Optional note"
                placeholderTextColor={theme.colors.textSoft}
                style={[styles.textInput, styles.noteInput]}
                multiline
              />
            </View>
          </View>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function getDefaultCategory(type: TransactionDraft["type"]) {
  if (type === "expense") {
    return EXPENSE_CATEGORIES[0];
  }
  if (type === "investment") {
    return INVESTMENT_CATEGORIES[0];
  }
  return INCOME_CATEGORIES[0];
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shiftMonth(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function buildCalendarDays(monthDate: Date) {
  const firstDay = startOfMonth(monthDate);
  const firstGridDate = new Date(firstDay);
  firstGridDate.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstGridDate);
    date.setDate(firstGridDate.getDate() + index);

    return {
      key: date.toISOString(),
      date,
      inMonth: date.getMonth() === monthDate.getMonth(),
    };
  });
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#0F1524",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  indicator: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 42,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.lg,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    backgroundColor: "rgba(15,21,36,0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.md,
  },
  headerAura: {
    position: "absolute",
    top: 10,
    right: 18,
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    opacity: 0.7,
  },
  headerAuraOrb: {
    position: "absolute",
    top: 24,
    left: 24,
    width: 92,
    height: 92,
    borderRadius: 46,
    opacity: 0.18,
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  composerSummary: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  composerSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  composerLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.tiny,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    fontWeight: "800",
  },
  composerValue: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  completionPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  completionText: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "800",
  },
  composerMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    lineHeight: 18,
  },
  stepRail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepItem: {
    flex: 1,
    gap: 4,
  },
  stepIndex: {
    color: theme.colors.accent,
    fontSize: theme.typography.tiny,
    fontWeight: "800",
    letterSpacing: 0.9,
  },
  stepLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.caption,
    fontWeight: "700",
  },
  stepDivider: {
    width: 18,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  typeRow: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: theme.radius.pill,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.text,
  },
  typeText: {
    color: theme.colors.textMuted,
    fontWeight: "700",
  },
  typeTextActive: {
    color: theme.colors.background,
  },
  inputCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  amountInput: {
    color: theme.colors.text,
    fontSize: 40,
    fontWeight: "800",
    paddingVertical: 4,
    letterSpacing: -1,
  },
  amountPreview: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "800",
  },
  inputHint: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.caption,
    lineHeight: 18,
  },
  textInput: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    paddingVertical: 2,
  },
  categoryPreview: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "800",
  },
  noteInput: {
    minHeight: 48,
    textAlignVertical: "top",
  },
  block: {
    gap: 12,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  detailsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  detailsToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailsToggleText: {
    color: theme.colors.textMuted,
    fontWeight: "700",
  },
  detailsBlock: {
    gap: theme.spacing.md,
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
  },
  dateCard: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateAdjustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  dateArrowButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateArrowButtonDisabled: {
    opacity: 0.5,
  },
  dateSummary: {
    flex: 1,
    gap: 4,
  },
  dateSummaryLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.tiny,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  dateSummaryValue: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  weekdaysRow: {
    flexDirection: "row",
    gap: 8,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    color: theme.colors.textSoft,
    fontSize: theme.typography.tiny,
    fontWeight: "700",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayCell: {
    width: "12.9%",
    aspectRatio: 1,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: "transparent",
  },
  dayCellMuted: {
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  dayCellSelected: {
    backgroundColor: theme.colors.text,
  },
  dayCellDisabled: {
    opacity: 0.28,
  },
  dayCellText: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "700",
  },
  dayCellTextMuted: {
    color: theme.colors.textSoft,
  },
  dayCellTextSelected: {
    color: theme.colors.background,
  },
  dayCellTextDisabled: {
    color: theme.colors.textSoft,
  },
  dateFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  dateFooterText: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  dateText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: 14,
  },
  successIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  successCopy: {
    flex: 1,
    gap: 2,
  },
  successTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "800",
  },
  successBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    lineHeight: 18,
  },
  saveButton: {
    borderRadius: theme.radius.pill,
    alignItems: "center",
    paddingVertical: 17,
    ...theme.shadow.soft,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: "800",
  },
});
