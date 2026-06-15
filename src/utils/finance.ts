import { Budget, MonthlySummary, Transaction, TransactionType } from "@/types";
import { monthKey } from "@/utils/date";

export function getCurrentMonthTransactions(transactions: Transaction[]) {
  const currentKey = monthKey(new Date().toISOString());
  return transactions.filter((transaction) => monthKey(transaction.date) === currentKey);
}

export function getMonthlySummary(transactions: Transaction[], budget: Budget): MonthlySummary {
  const current = getCurrentMonthTransactions(transactions);
  const income = current
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const expenses = current
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);
  const investments = current
    .filter((item) => item.type === "investment")
    .reduce((sum, item) => sum + item.amount, 0);
  const balance = income - expenses - investments;
  const remainingBudget = budget.monthlyBudget - expenses;
  const netCashflow = income - expenses - investments;

  return {
    income,
    expenses,
    investments,
    balance,
    remainingBudget,
    netCashflow,
  };
}

export function getAvailableBalance(transactions: Transaction[]) {
  return transactions.reduce((sum, item) => {
    return item.type === "income" ? sum + item.amount : sum - item.amount;
  }, 0);
}

export function getCategoryTotals(transactions: Transaction[], type: TransactionType = "expense") {
  return transactions
    .filter((item) => item.type === type)
    .reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + item.amount;
      return acc;
    }, {});
}

export function buildMonthlyFlow(transactions: Transaction[]) {
  const months = new Map<
    string,
    { label: string; income: number; expenses: number; investments: number; stamp: number }
  >();
  transactions
    .slice()
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .forEach((item) => {
      const date = new Date(item.date);
      const label = new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const previous = months.get(key);
      months.set(key, {
        label,
        income: (previous?.income ?? 0) + (item.type === "income" ? item.amount : 0),
        expenses: (previous?.expenses ?? 0) + (item.type === "expense" ? item.amount : 0),
        investments: (previous?.investments ?? 0) + (item.type === "investment" ? item.amount : 0),
        stamp: date.getTime(),
      });
    });

  return Array.from(months.values())
    .sort((a, b) => a.stamp - b.stamp)
    .slice(-4)
    .map(({ label, income, expenses, investments }) => ({ label, income, expenses, investments }));
}

export function getTopCategory(transactions: Transaction[], type: TransactionType) {
  const totals = getCategoryTotals(transactions, type);
  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
}

export function getOutflowShare(summary: MonthlySummary) {
  const totalOutflow = summary.expenses + summary.investments;
  if (totalOutflow <= 0) {
    return { expenses: 0, investments: 0 };
  }
  return {
    expenses: (summary.expenses / totalOutflow) * 100,
    investments: (summary.investments / totalOutflow) * 100,
  };
}
