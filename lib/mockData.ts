import { Account, Transaction, Category, AnalyticsData } from "@/types";
import parsed from "../scripts/out_parsed.json";
import { merchantMap } from "../scripts/merchantMap";

// Мок-данные для разработки Frontend — используем реальную распаршенную выписку при наличии

// Иконки в стиле ВТБ - минималистичные и профессиональные
export const mockCategories: Category[] = [
  { id: "1", name: "Продукты", type: "expense", icon: "🛍️", color: "#0663EF" },
  { id: "2", name: "Транспорт", type: "expense", icon: "🚇", color: "#0663EF" },
  { id: "3", name: "Развлечения", type: "expense", icon: "🎯", color: "#0663EF" },
  { id: "4", name: "Здоровье", type: "expense", icon: "⚕️", color: "#0663EF" },
  { id: "5", name: "Образование", type: "expense", icon: "📖", color: "#0663EF" },
  { id: "6", name: "Зарплата", type: "income", icon: "💳", color: "#22c55e" },
  { id: "7", name: "Подарки", type: "income", icon: "🎁", color: "#22c55e" },
  { id: "8", name: "Прочие", type: "expense", icon: "📋", color: "#94a3b8" },
  { id: "9", name: "Еда и кафе", type: "expense", icon: "☕", color: "#0663EF" },
  { id: "10", name: "Переводы", type: "expense", icon: "↔️", color: "#0663EF" },
  { id: "11", name: "Автомобиль", type: "expense", icon: "🚗", color: "#0663EF" },
  { id: "12", name: "Одежда", type: "expense", icon: "👔", color: "#0663EF" },
  { id: "13", name: "Доставка", type: "expense", icon: "📦", color: "#0663EF" },
  { id: "14", name: "Красота", type: "expense", icon: "✨", color: "#0663EF" },
  { id: "15", name: "Коммунальные услуги", type: "expense", icon: "🏡", color: "#0663EF" },
];

export const mockAccounts: Account[] = [
  {
    id: "1",
    userId: "user1",
    name: "Основной счет",
    balance: 125000.5,
    currency: "RUB",
    type: "checking",
    createdAt: new Date("2024-01-15"),
  },
];

function mapParsedCategory(cat: string) {
  if (!cat) return mockCategories.find(c => c.name === "Прочие")!.id;
  const norm = cat.toLowerCase();
  
  // Маппируем категории из парсера на ID категорий в UI
  if (norm.includes("transport") || norm.includes("taxi")) return mockCategories[1].id; // Транспорт
  if (norm.includes("groceries")) return mockCategories[0].id; // Продукты
  if (norm.includes("food") || norm.includes("cafe") || norm.includes("fast_food")) return mockCategories[8].id; // Еда и кафе
  if (norm.includes("entertainment") || norm.includes("gaming")) return mockCategories[2].id; // Развлечения
  if (norm.includes("health") || norm.includes("pharmacy")) return mockCategories[3].id; // Здоровье
  if (norm.includes("education")) return mockCategories[4].id; // Образование
  if (norm.includes("alcohol")) return mockCategories[8].id; // Еда и кафе (напитки)
  if (norm.includes("auto") || norm.includes("fuel")) return mockCategories[10].id; // Автомобиль
  if (norm.includes("clothing") || norm.includes("shopping")) return mockCategories[11].id; // Одежда
  if (norm.includes("delivery")) return mockCategories[12].id; // Доставка
  if (norm.includes("beauty")) return mockCategories[13].id; // Красота
  if (norm.includes("utilities")) return mockCategories[14].id; // Коммунальные услуги
  if (norm.includes("transfer")) return mockCategories[9].id; // Переводы
  if (norm.includes("income")) return mockCategories[5].id; // Зарплата (доход)
  
  return mockCategories.find(c => c.name === "Прочие")!.id;
}

function extractMerchant(description: string | null) {
  if (!description) return null;
  let d = description.replace(/\n+/g, ' ').trim();
  d = d.replace(/Оплата товаров и услуг\.|Переводы через СБП\.|Поступление заработной платы\.|Операция зачисления\./gi, '').trim();
  const cut = d.split(/\bпо\b/i)[0].trim();
  return cut.split(/\s+по\s+|\s+по карте\s+|\s+\*/i)[0].trim();
}

// Используем ВСЕ транзакции из data.txt, без ограничений
export const mockTransactions: Transaction[] = (parsed?.transactions || []).map((tx: any, idx: number) => {
  const categoryId = mapParsedCategory(tx.category);
  const merchant = extractMerchant(tx.description) || '';
  return {
    id: tx.id || `${idx + 1}`,
    accountId: mockAccounts[0].id,
    amount: tx.amount,
    type: tx.type === 'income' ? 'income' : 'expense',
    categoryId,
    category: mockCategories.find(c => c.id === categoryId),
    description: (merchant ? merchant + ' — ' : '') + (tx.description || ''),
    date: tx.operationDate ? new Date(tx.operationDate) : new Date(),
    createdAt: tx.operationDate ? new Date(tx.operationDate) : new Date(),
  } as Transaction;
});

export const mockAnalytics: AnalyticsData = {
  totalIncome: 2500,
  totalExpenses: 2251.56,
  balance: 125000.5,
  expensesByCategory: [],
  monthlyTrend: [],
};








