export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type Budget = {
  monthlyBudget: number;
  categoryBudgets?: Record<string, number>;
};

export type TransactionDraft = {
  title: string;
  amount: string;
  type: TransactionType;
  category: string;
  date: string;
  note: string;
};

export type QuickAddState = {
  visible: boolean;
  editingTransactionId?: string;
};

export type MonthlySummary = {
  income: number;
  expenses: number;
  balance: number;
  remainingBudget: number;
  savingsRate: number;
};

export type BudgetPace = {
  daysElapsed: number;
  daysLeft: number;
  expectedSpend: number;
  actualDailySpend: number;
  recommendedDailySpend: number;
  projectedMonthEndSpend: number;
  variance: number;
  status: "ahead" | "on-track" | "over";
};
