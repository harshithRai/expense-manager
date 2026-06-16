export type TransactionType = "income" | "expense" | "investment";
export type RecurrenceFrequency = "weekly" | "monthly";

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note?: string;
  recurrence?: RecurrenceFrequency;
  recurrenceSourceId?: string;
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
  recurrence: "none" | RecurrenceFrequency;
};

export type QuickAddState = {
  visible: boolean;
  editingTransactionId?: string;
};

export type MonthlySummary = {
  income: number;
  expenses: number;
  investments: number;
  balance: number;
  remainingBudget: number;
  netCashflow: number;
};
