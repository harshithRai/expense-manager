import { Budget, BudgetPace, MonthlySummary, Transaction, TransactionType } from "@/types";
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
  const balance = income - expenses;
  const remainingBudget = budget.monthlyBudget - expenses;
  const savingsRate = income > 0 ? Math.max(0, (balance / income) * 100) : 0;

  return {
    income,
    expenses,
    balance,
    remainingBudget,
    savingsRate,
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

export function getWeeklyFoodInsight(transactions: Transaction[]) {
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - 6);

  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(now.getDate() - 13);
  const lastWeekEnd = new Date(now);
  lastWeekEnd.setDate(now.getDate() - 7);

  const isFoodExpense = (item: Transaction) => item.type === "expense" && item.category === "Food";
  const current = transactions
    .filter(isFoodExpense)
    .filter((item) => new Date(item.date) >= currentWeekStart)
    .reduce((sum, item) => sum + item.amount, 0);
  const previous = transactions
    .filter(isFoodExpense)
    .filter((item) => {
      const date = new Date(item.date);
      return date >= lastWeekStart && date <= lastWeekEnd;
    })
    .reduce((sum, item) => sum + item.amount, 0);

  if (current === 0 && previous === 0) {
    return "Track a few expenses to unlock smarter spending insights.";
  }

  if (previous === 0) {
    return "Your Food spend started this week. Keep an eye on it early.";
  }

  const change = Math.round(((current - previous) / previous) * 100);
  if (change > 0) {
    return `You spent ${change}% more on Food this week.`;
  }
  if (change < 0) {
    return `Food spending is down ${Math.abs(change)}% from last week.`;
  }
  return "Your Food spending is steady versus last week.";
}

export function buildTrend(transactions: Transaction[]) {
  const months = new Map<string, { label: string; amount: number; stamp: number }>();
  transactions
    .slice()
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .filter((item) => item.type === "expense")
    .forEach((item) => {
      const date = new Date(item.date);
      const label = new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const previous = months.get(key);
      months.set(key, {
        label,
        amount: (previous?.amount ?? 0) + item.amount,
        stamp: date.getTime(),
      });
    });

  return Array.from(months.values())
    .sort((a, b) => a.stamp - b.stamp)
    .slice(-4)
    .map(({ label, amount }) => ({ label, amount }));
}

export function getBudgetPace(summary: MonthlySummary, budget: Budget, date = new Date()): BudgetPace {
  const year = date.getFullYear();
  const month = date.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const daysElapsed = Math.min(Math.max(date.getDate(), 1), totalDays);
  const daysLeft = Math.max(totalDays - daysElapsed, 0);
  const expectedSpend = (budget.monthlyBudget / totalDays) * daysElapsed;
  const actualDailySpend = summary.expenses / daysElapsed;
  const remainingBudget = Math.max(summary.remainingBudget, 0);
  const recommendedDailySpend = daysLeft > 0 ? remainingBudget / daysLeft : 0;
  const projectedMonthEndSpend = actualDailySpend * totalDays;
  const variance = summary.expenses - expectedSpend;
  const tolerance = Math.max(budget.monthlyBudget * 0.04, 500);

  let status: BudgetPace["status"] = "on-track";
  if (variance > tolerance) {
    status = "over";
  } else if (variance < -tolerance) {
    status = "ahead";
  }

  return {
    daysElapsed,
    daysLeft,
    expectedSpend,
    actualDailySpend,
    recommendedDailySpend,
    projectedMonthEndSpend,
    variance,
    status,
  };
}

export function getBudgetPaceInsight(summary: MonthlySummary, budget: Budget, date = new Date()) {
  const pace = getBudgetPace(summary, budget, date);

  if (budget.monthlyBudget <= 0) {
    return "Set a monthly budget to unlock pace tracking.";
  }

  if (summary.expenses === 0) {
    return `You have ${formatRoundedDaily(pace.recommendedDailySpend)} per day available for the rest of the month.`;
  }

  if (pace.status === "over") {
    return `You are spending ${formatRoundedDaily(pace.actualDailySpend)} per day, above the ${formatRoundedDaily(
      pace.expectedSpend / pace.daysElapsed
    )} pace.`;
  }

  if (pace.status === "ahead") {
    return `You are under budget pace. You can spend about ${formatRoundedDaily(
      pace.recommendedDailySpend
    )} per day for the remaining ${pace.daysLeft} days.`;
  }

  return `You are on budget pace with about ${formatRoundedDaily(
    pace.recommendedDailySpend
  )} per day left for the rest of the month.`;
}

function formatRoundedDaily(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}
