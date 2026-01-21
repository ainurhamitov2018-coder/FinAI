// Типы для пользователя
export interface User {
  id: string;
  email: string;
  cardNumber?: string;
  name: string;
  createdAt: Date;
}

// Типы для счетов
export interface Account {
  id: string;
  userId: string;
  name: string;
  balance: number;
  currency: string;
  type: "checking" | "savings" | "credit";
  createdAt: Date;
}

// Типы для транзакций
export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  category?: Category;
  description: string;
  date: Date;
  createdAt: Date;
}

// Типы для категорий
export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon?: string;
  color?: string;
}

// Типы для аналитики
export interface AnalyticsData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  expensesByCategory: CategoryExpense[];
  monthlyTrend: MonthlyTrend[];
}

export interface CategoryExpense {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
}

// Типы для прогнозирования
export interface Prediction {
  period: string;
  predictedExpenses: number;
  confidence: number;
  explanation: string;
}

// Типы для AI чата
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}













