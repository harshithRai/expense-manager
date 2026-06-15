import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { SearchBar } from "@/components/ui/SearchBar";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { PressableScale } from "@/components/ui/PressableScale";
import { useFinance } from "@/hooks/useFinance";
import { theme } from "@/constants/theme";
import { formatMonthLabel, getMonthOptions, monthKey } from "@/utils/date";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, INVESTMENT_CATEGORIES } from "@/constants/categories";
import { TransactionType } from "@/types";

type FilterType = "all" | TransactionType;

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
      const matchesQuery =
        transaction.title.toLowerCase().includes(query.toLowerCase()) ||
        transaction.category.toLowerCase().includes(query.toLowerCase()) ||
        (transaction.note ?? "").toLowerCase().includes(query.toLowerCase());
      const matchesType = typeFilter === "all" || transaction.type === typeFilter;
      const matchesMonth = monthFilter === "all" || monthKey(transaction.date) === monthKey(monthFilter);
      const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter;
      return matchesQuery && matchesType && matchesMonth && matchesCategory;
    });
  }, [transactions, query, typeFilter, monthFilter, categoryFilter]);

  const typeSummary = typeChips.find((item) => item.value === typeFilter)?.label ?? "all";
  const monthSummary = monthFilter === "all" ? "all months" : formatMonthLabel(monthFilter);
  const categorySummary = categoryFilter === "all" ? "all categories" : categoryFilter;

  const toggleSection = (section: "type" | "month" | "category") => {
    setOpenSection((current) => (current === section ? null : section));
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.heading}>Transactions</Text>
        <Text style={styles.subheading}>Refined search, clean filters, and direct edits.</Text>
      </View>

      <SearchBar value={query} onChangeText={setQuery} placeholder="Search title, category, or note" />

      <View style={styles.filtersCard}>
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
      </View>

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
        <View style={styles.list}>
          {filtered.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onEdit={() => openQuickAdd(transaction)}
              onDelete={() => deleteTransaction(transaction.id)}
            />
          ))}
        </View>
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
    <View style={[styles.filterSection, !last && styles.filterSectionBorder]}>
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
      {open ? <View style={styles.filterContent}>{children}</View> : null}
    </View>
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
  },
  filtersCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
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
  list: {
    gap: theme.spacing.md,
  },
});
