import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react-native";
import Animated, { Easing, FadeInDown, LinearTransition } from "react-native-reanimated";
import { Screen } from "@/components/ui/Screen";
import { SearchBar } from "@/components/ui/SearchBar";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { PressableScale } from "@/components/ui/PressableScale";
import { useFinance } from "@/hooks/useFinance";
import { theme } from "@/constants/theme";
import { formatFriendlyDate, formatMonthLabel, getMonthOptions, monthKey } from "@/utils/date";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, INVESTMENT_CATEGORIES } from "@/constants/categories";
import { Transaction, TransactionType } from "@/types";
import { formatCurrency } from "@/utils/currency";

type FilterType = "all" | TransactionType;

type ActiveFilter = {
  key: "type" | "month" | "category";
  label: string;
  onClear: () => void;
};

const calmLayout = LinearTransition.duration(180).easing(Easing.out(Easing.cubic));

export function TransactionsScreen() {
  const { transactions, loading, openQuickAdd, deleteTransaction } = useFinance();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [openSection, setOpenSection] = useState<"type" | "month" | "category" | null>("type");

  const monthOptions = useMemo(() => getMonthOptions(transactions), [transactions]);
  const categoryOptions = useMemo(
    () => ["all", ...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES, ...INVESTMENT_CATEGORIES])],
    []
  );
  const typeChips: { value: FilterType; label: string }[] = [
    { value: "all", label: "all" },
    { value: "expense", label: "expenditure" },
    { value: "income", label: "income" },
    { value: "investment", label: "investment" },
  ];

  const filtered = useMemo(() => {
    return transactions.filter((transaction) => {
      const searchValue = query.toLowerCase();
      const matchesQuery =
        transaction.title.toLowerCase().includes(searchValue) ||
        transaction.category.toLowerCase().includes(searchValue) ||
        (transaction.note ?? "").toLowerCase().includes(searchValue);
      const matchesType = typeFilter === "all" || transaction.type === typeFilter;
      const matchesMonth = monthFilter === "all" || monthKey(transaction.date) === monthKey(monthFilter);
      const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter;
      return matchesQuery && matchesType && matchesMonth && matchesCategory;
    });
  }, [transactions, query, typeFilter, monthFilter, categoryFilter]);

  const groupedTransactions = useMemo(() => buildTransactionGroups(filtered), [filtered]);
  const filteredTotals = useMemo(() => getFilteredTotals(filtered), [filtered]);
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const next: ActiveFilter[] = [];

    if (typeFilter !== "all") {
      next.push({
        key: "type",
        label: typeFilter === "expense" ? "Expenditure" : typeFilter === "investment" ? "Investment" : "Income",
        onClear: () => setTypeFilter("all"),
      });
    }

    if (monthFilter !== "all") {
      next.push({
        key: "month",
        label: formatMonthLabel(monthFilter),
        onClear: () => setMonthFilter("all"),
      });
    }

    if (categoryFilter !== "all") {
      next.push({
        key: "category",
        label: categoryFilter,
        onClear: () => setCategoryFilter("all"),
      });
    }

    return next;
  }, [categoryFilter, monthFilter, typeFilter]);

  const hasActiveFilters = activeFilters.length > 0 || query.length > 0;
  const typeSummary = typeChips.find((item) => item.value === typeFilter)?.label ?? "all";
  const monthSummary = monthFilter === "all" ? "all months" : formatMonthLabel(monthFilter);
  const categorySummary = categoryFilter === "all" ? "all categories" : categoryFilter;

  const toggleSection = (section: "type" | "month" | "category") => {
    setOpenSection((current) => (current === section ? null : section));
  };

  const clearAllFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setMonthFilter("all");
    setCategoryFilter("all");
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.heading}>Transactions</Text>
        <Text style={styles.subheading}>A cleaner ledger with faster filtering and sharper reading of what changed.</Text>
      </View>

      <View style={styles.searchBlock}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search title, category, or note" />
      </View>

      <Animated.View entering={FadeInDown.duration(220)} layout={calmLayout} style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryHeaderCopy}>
            <View style={styles.summaryBadge}>
              <SlidersHorizontal size={14} color={theme.colors.accent} />
              <Text style={styles.summaryBadgeText}>Ledger focus</Text>
            </View>
            <Text style={styles.summaryTitle}>
              {filtered.length === 0 ? "No results in view" : `${filtered.length} ${filtered.length === 1 ? "entry" : "entries"} in focus`}
            </Text>
          </View>
          {hasActiveFilters ? (
            <PressableScale haptic="selection" onPress={clearAllFilters} style={styles.clearPill}>
              <Text style={styles.clearPillText}>Reset</Text>
            </PressableScale>
          ) : null}
        </View>

        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.summaryValue}>{formatCurrency(filteredTotals.income)}</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryLabel}>Outflow</Text>
            <Text style={styles.summaryValue}>{formatCurrency(filteredTotals.outflow)}</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryLabel}>Net</Text>
            <Text style={styles.summaryValue}>{formatCurrency(filteredTotals.net)}</Text>
          </View>
        </View>

        {hasActiveFilters ? (
          <View style={styles.activeFilters}>
            {query.length > 0 ? (
              <ActiveFilterPill label={`Search: ${query}`} onClear={() => setQuery("")} />
            ) : null}
            {activeFilters.map((filter) => (
              <ActiveFilterPill key={filter.key} label={filter.label} onClear={filter.onClear} />
            ))}
          </View>
        ) : (
          <Text style={styles.defaultSummaryCopy}>All transactions are visible. Use filters to isolate a spending pattern or month.</Text>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(260)} layout={calmLayout} style={styles.filtersCard}>
        <AccordionSection
          label="Type"
          summary={typeSummary}
          open={openSection === "type"}
          onToggle={() => toggleSection("type")}
        >
          <View style={styles.row}>
            {typeChips.map((item) => (
              <Chip key={item.value} label={item.label} active={typeFilter === item.value} onPress={() => setTypeFilter(item.value)} />
            ))}
          </View>
        </AccordionSection>

        <AccordionSection
          label="Month"
          summary={monthSummary}
          open={openSection === "month"}
          onToggle={() => toggleSection("month")}
        >
          <View style={styles.row}>
            <Chip label="all months" active={monthFilter === "all"} onPress={() => setMonthFilter("all")} />
            {monthOptions.map((date) => (
              <Chip
                key={date}
                label={formatMonthLabel(date)}
                active={monthKey(monthFilter) === monthKey(date)}
                onPress={() => setMonthFilter(date)}
              />
            ))}
          </View>
        </AccordionSection>

        <AccordionSection
          label="Category"
          summary={categorySummary}
          open={openSection === "category"}
          onToggle={() => toggleSection("category")}
          last
        >
          <View style={styles.row}>
            {categoryOptions.map((item) => (
              <Chip key={item} label={item === "all" ? "all categories" : item} active={categoryFilter === item} onPress={() => setCategoryFilter(item)} />
            ))}
          </View>
        </AccordionSection>
      </Animated.View>

      {loading ? (
        <LoadingState label="Loading transactions..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matching transactions"
          description="Try a broader filter or add a fresh entry. The list stays focused when there is something worth showing."
          actionLabel="Add transaction"
          onAction={() => openQuickAdd()}
        />
      ) : (
        <Animated.View layout={calmLayout} style={styles.groupList}>
          {groupedTransactions.map((group) => (
            <Animated.View
              key={group.label}
              entering={FadeInDown.duration(220)}
              layout={calmLayout}
              style={styles.groupCard}
            >
              <View style={styles.groupHeader}>
                <View style={styles.groupHeaderCopy}>
                  <Text style={styles.groupTitle}>{group.label}</Text>
                  <Text style={styles.groupMeta}>{group.items.length === 1 ? "1 entry" : `${group.items.length} entries`}</Text>
                </View>
                <Text style={styles.groupTotal}>{formatCurrency(group.total)}</Text>
              </View>
              <View style={styles.groupItems}>
                {group.items.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={() => openQuickAdd(transaction)}
                    onDelete={() => deleteTransaction(transaction.id)}
                  />
                ))}
              </View>
            </Animated.View>
          ))}
        </Animated.View>
      )}
    </Screen>
  );
}

type AccordionSectionProps = {
  label: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  last?: boolean;
};

function AccordionSection({ label, summary, open, onToggle, children, last }: AccordionSectionProps) {
  return (
    <Animated.View layout={calmLayout} style={[styles.filterSection, !last && styles.filterSectionBorder]}>
      <PressableScale haptic="selection" onPress={onToggle} style={styles.filterHeader}>
        <View style={styles.filterHeaderCopy}>
          <Text style={styles.filterLabel}>{label}</Text>
          <Text numberOfLines={1} style={styles.filterSummary}>
            {summary}
          </Text>
        </View>
        <ChevronDown
          size={18}
          color={theme.colors.textSoft}
          style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
        />
      </PressableScale>
      {open ? (
        <Animated.View entering={FadeInDown.duration(140)} layout={calmLayout} style={styles.filterContent}>
          {children}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

function ActiveFilterPill({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <PressableScale haptic="selection" onPress={onClear} style={styles.activeFilterPill}>
      <Text numberOfLines={1} style={styles.activeFilterText}>
        {label}
      </Text>
      <X size={12} color={theme.colors.text} />
    </PressableScale>
  );
}

function buildTransactionGroups(transactions: Transaction[]) {
  const groups = new Map<string, { label: string; items: Transaction[]; total: number; latest: number }>();

  transactions.forEach((transaction) => {
    const label = formatFriendlyDate(transaction.date);
    const existing = groups.get(label);
    const signedAmount = transaction.type === "income" ? transaction.amount : -transaction.amount;
    const latest = new Date(transaction.date).getTime();

    if (existing) {
      existing.items.push(transaction);
      existing.total += signedAmount;
      existing.latest = Math.max(existing.latest, latest);
      return;
    }

    groups.set(label, {
      label,
      items: [transaction],
      total: signedAmount,
      latest,
    });
  });

  return Array.from(groups.values()).sort((a, b) => b.latest - a.latest);
}

function getFilteredTotals(transactions: Transaction[]) {
  return transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "income") {
        acc.income += transaction.amount;
      } else {
        acc.outflow += transaction.amount;
      }

      acc.net = acc.income - acc.outflow;
      return acc;
    },
    { income: 0, outflow: 0, net: 0 }
  );
}

const styles = StyleSheet.create({
  header: {
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
  searchBlock: {
    gap: theme.spacing.sm,
  },
  summaryCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadow.soft,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  summaryHeaderCopy: {
    flex: 1,
    gap: 8,
  },
  summaryBadge: {
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
  summaryBadgeText: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "800",
  },
  summaryTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h3,
    fontWeight: "800",
  },
  clearPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clearPillText: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "800",
  },
  summaryStats: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  summaryStat: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: theme.radius.md,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  summaryLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.caption,
    fontWeight: "700",
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  activeFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  activeFilterPill: {
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(121,168,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(121,168,255,0.28)",
  },
  activeFilterText: {
    maxWidth: 220,
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "700",
  },
  defaultSummaryCopy: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    lineHeight: 19,
  },
  filtersCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    ...theme.shadow.soft,
  },
  filterSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
    gap: 12,
  },
  filterSectionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  filterHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  filterLabel: {
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: theme.typography.tiny,
    fontWeight: "700",
  },
  filterSummary: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  filterContent: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  groupList: {
    gap: theme.spacing.md,
  },
  groupCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadow.soft,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  groupHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  groupTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h3,
    fontWeight: "800",
  },
  groupMeta: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.caption,
    fontWeight: "700",
  },
  groupTotal: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "800",
  },
  groupItems: {
    gap: theme.spacing.md,
  },
});
