import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Check, Database, Fingerprint, ShieldCheck, Wallet } from "lucide-react-native";
import Animated, { FadeInDown, LinearTransition } from "react-native-reanimated";
import { Screen } from "@/components/ui/Screen";
import { useFinance } from "@/hooks/useFinance";
import { theme } from "@/constants/theme";
import { PressableScale } from "@/components/ui/PressableScale";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/utils/currency";
import { EXPENSE_CATEGORIES } from "@/constants/categories";

export function SettingsScreen() {
  const { budget, loading, setMonthlyBudget, setCategoryBudgets, clearAllData } = useFinance();
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState(String(budget.monthlyBudget));
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [categoryBudgetInputs, setCategoryBudgetInputs] = useState<Record<string, string>>({});
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMonthlyBudgetInput(String(budget.monthlyBudget));
    setCategoryBudgetInputs(
      Object.fromEntries(EXPENSE_CATEGORIES.map((category) => [category, String(budget.categoryBudgets?.[category] ?? "")]))
    );
  }, [budget.categoryBudgets, budget.monthlyBudget]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const saveBudget = async () => {
    await setMonthlyBudget(Number(monthlyBudgetInput) || 0);
    setSaveState("saved");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      setSaveState("idle");
    }, 1400);
  };

  const saveCategoryBudgets = async () => {
    await setCategoryBudgets(
      Object.fromEntries(
        Object.entries(categoryBudgetInputs).map(([category, value]) => [category, Number(value) || 0])
      )
    );
  };

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(260)} style={styles.hero}>
        <Text style={styles.heading}>Settings</Text>
        <Text style={styles.subheading}>Quiet controls, clear trust signals, and feedback that feels deliberate.</Text>
      </Animated.View>

      {loading ? <LoadingState label="Loading preferences..." /> : null}

      <Animated.View entering={FadeInDown.duration(320)} layout={LinearTransition.springify().damping(18)} style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <View style={styles.overviewIcon}>
            <Wallet size={18} color={theme.colors.accent} />
          </View>
          <View style={styles.overviewCopy}>
            <Text style={styles.overviewEyebrow}>Budget posture</Text>
            <Text style={styles.overviewValue}>{formatCurrency(budget.monthlyBudget)}</Text>
          </View>
        </View>
        <Text style={styles.overviewText}>Your monthly budget is the baseline used for current spending signals and remaining budget calculations.</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(380)} layout={LinearTransition.springify().damping(18)} style={styles.card}>
        <Text style={styles.cardTitle}>Monthly budget</Text>
        <Text style={styles.cardCopy}>Set the ceiling you want spending decisions to work against.</Text>
        <TextInput
          value={monthlyBudgetInput}
          onChangeText={(value) => setMonthlyBudgetInput(value.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          style={styles.input}
          placeholder="25000"
          placeholderTextColor={theme.colors.textSoft}
        />
        {saveState === "saved" ? (
          <View style={styles.successBanner}>
            <View style={styles.successIcon}>
              <Check size={13} color={theme.colors.background} />
            </View>
            <Text style={styles.successText}>Budget saved and reflected across the app.</Text>
          </View>
        ) : null}
        <PressableScale style={styles.primaryButton} haptic="medium" onPress={saveBudget}>
          <Text style={styles.primaryButtonText}>{saveState === "saved" ? "Saved" : "Save budget"}</Text>
        </PressableScale>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(440)} layout={LinearTransition.springify().damping(18)} style={styles.card}>
        <Text style={styles.cardTitle}>Category budgets</Text>
        <Text style={styles.cardCopy}>Set spending guardrails for the categories you want to watch closely.</Text>
        <View style={styles.categoryBudgetList}>
          {EXPENSE_CATEGORIES.map((category) => (
            <View key={category} style={styles.categoryBudgetRow}>
              <View style={styles.categoryBudgetCopy}>
                <Text style={styles.categoryBudgetTitle}>{category}</Text>
                <Text style={styles.categoryBudgetMeta}>
                  {budget.categoryBudgets?.[category] ? formatCurrency(budget.categoryBudgets?.[category] ?? 0) : "No limit set"}
                </Text>
              </View>
              <TextInput
                value={categoryBudgetInputs[category] ?? ""}
                onChangeText={(value) =>
                  setCategoryBudgetInputs((current) => ({
                    ...current,
                    [category]: value.replace(/[^0-9]/g, ""),
                  }))
                }
                keyboardType="number-pad"
                style={styles.categoryBudgetInput}
                placeholder="0"
                placeholderTextColor={theme.colors.textSoft}
              />
            </View>
          ))}
        </View>
        <PressableScale style={styles.secondaryButton} haptic="medium" onPress={saveCategoryBudgets}>
          <Text style={styles.secondaryButtonText}>Save category budgets</Text>
        </PressableScale>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500)} layout={LinearTransition.springify().damping(18)} style={styles.card}>
        <Text style={styles.cardTitle}>Product direction</Text>
        <View style={styles.featureList}>
          <FeatureRow icon={<Fingerprint size={16} color={theme.colors.text} />} title="PIN / biometric lock" description="Protect the ledger before the app opens." />
          <FeatureRow icon={<Database size={16} color={theme.colors.text} />} title="Private backup sync" description="Keep local-first control with safer continuity." />
          <FeatureRow icon={<ShieldCheck size={16} color={theme.colors.text} />} title="CSV export" description="Move clean transaction history into spreadsheets or reports." />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(560)} layout={LinearTransition.springify().damping(18)} style={styles.card}>
        <Text style={styles.cardTitle}>App info</Text>
        <Text style={styles.meta}>Expense Manager v1.0.0</Text>
        <Text style={styles.meta}>Local-first storage with AsyncStorage</Text>
      </Animated.View>

      <PressableScale style={styles.destructiveButton} haptic="medium" onPress={clearAllData}>
        <Text style={styles.destructiveText}>Clear all data</Text>
      </PressableScale>
    </Screen>
  );
}

function FeatureRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>{icon}</View>
      <View style={styles.featureCopy}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
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
    lineHeight: 22,
  },
  overviewCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
    ...theme.shadow.soft,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  overviewIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(121,168,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(121,168,255,0.2)",
  },
  overviewCopy: {
    flex: 1,
    gap: 4,
  },
  overviewEyebrow: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.tiny,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    fontWeight: "800",
  },
  overviewValue: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: "800",
  },
  overviewText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
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
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h3,
    fontWeight: "800",
  },
  cardCopy: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 21,
  },
  input: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.colors.text,
    fontSize: theme.typography.body,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(51,214,159,0.14)",
    borderWidth: 1,
    borderColor: "rgba(51,214,159,0.22)",
    borderRadius: theme.radius.md,
    padding: 12,
  },
  successIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.success,
  },
  successText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    paddingVertical: 15,
    ...theme.shadow.soft,
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontWeight: "800",
  },
  featureList: {
    gap: 12,
  },
  categoryBudgetList: {
    gap: 12,
  },
  categoryBudgetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: theme.radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  categoryBudgetCopy: {
    flex: 1,
    gap: 4,
  },
  categoryBudgetTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  categoryBudgetMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  categoryBudgetInput: {
    width: 90,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: theme.colors.text,
    fontSize: theme.typography.body,
    textAlign: "right",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButton: {
    backgroundColor: "rgba(121,168,255,0.14)",
    borderRadius: theme.radius.pill,
    alignItems: "center",
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "rgba(121,168,255,0.2)",
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontWeight: "800",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  featureIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
  },
  featureCopy: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  featureDescription: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    lineHeight: 18,
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
  },
  destructiveButton: {
    backgroundColor: "rgba(255,107,129,0.12)",
    borderRadius: theme.radius.pill,
    alignItems: "center",
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "rgba(255,107,129,0.28)",
    ...theme.shadow.soft,
  },
  destructiveText: {
    color: theme.colors.danger,
    fontWeight: "800",
  },
});
