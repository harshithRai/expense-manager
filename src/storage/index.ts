import AsyncStorage from "@react-native-async-storage/async-storage";
import { Budget, Transaction } from "@/types";

const TRANSACTIONS_KEY = "expense-manager/transactions";
const BUDGET_KEY = "expense-manager/budget";

export async function loadTransactions() {
  const raw = await AsyncStorage.getItem(TRANSACTIONS_KEY);
  return raw ? (JSON.parse(raw) as Transaction[]) : [];
}

export async function saveTransactions(transactions: Transaction[]) {
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

export async function loadBudget() {
  const raw = await AsyncStorage.getItem(BUDGET_KEY);
  return raw ? (JSON.parse(raw) as Budget) : { monthlyBudget: 25000, categoryBudgets: {} };
}

export async function saveBudget(budget: Budget) {
  await AsyncStorage.setItem(BUDGET_KEY, JSON.stringify(budget));
}

export async function clearAllStoredData() {
  await AsyncStorage.multiRemove([TRANSACTIONS_KEY, BUDGET_KEY]);
}
