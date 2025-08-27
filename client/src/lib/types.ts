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

export const CATEGORIES = {
  // Расходы
  food: { label: "Еда", icon: "fas fa-shopping-cart", color: "bg-orange-100 text-orange-800" },
  transport: { label: "Транспорт", icon: "fas fa-subway", color: "bg-purple-100 text-purple-800" },
  utilities: { label: "Коммунальные", icon: "fas fa-home", color: "bg-blue-100 text-blue-800" },
  entertainment: { label: "Развлечения", icon: "fas fa-gamepad", color: "bg-pink-100 text-pink-800" },
  healthcare: { label: "Здоровье", icon: "fas fa-medkit", color: "bg-red-100 text-red-800" },
  shopping: { label: "Покупки", icon: "fas fa-shopping-bag", color: "bg-indigo-100 text-indigo-800" },
  education: { label: "Образование", icon: "fas fa-graduation-cap", color: "bg-yellow-100 text-yellow-800" },
  
  // Доходы
  salary: { label: "Зарплата", icon: "fas fa-money-bill-wave", color: "bg-green-100 text-green-800" },
  freelance: { label: "Фриланс", icon: "fas fa-laptop-code", color: "bg-green-100 text-green-800" },
  business: { label: "Бизнес", icon: "fas fa-briefcase", color: "bg-green-100 text-green-800" },
  investment: { label: "Инвестиции", icon: "fas fa-chart-line", color: "bg-green-100 text-green-800" },
  gift: { label: "Подарок", icon: "fas fa-gift", color: "bg-green-100 text-green-800" },
  other: { label: "Прочее", icon: "fas fa-question-circle", color: "bg-gray-100 text-gray-800" },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
