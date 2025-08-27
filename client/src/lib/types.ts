export interface FilterState {
  search: string;
  category: string;
  type: "all" | "income" | "expense";
  dateRange: "all" | "today" | "week" | "month" | "year" | "custom";
  customStartDate?: Date;
  customEndDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface FinancialSummary {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  incomeTransactionCount: number;
  expenseTransactionCount: number;
  totalTransactions: number;
}
