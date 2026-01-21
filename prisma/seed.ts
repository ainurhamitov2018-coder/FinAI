/**
 * Seed скрипт для заполнения базы данных
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HASHED_PASSWORD = "$2a$10$SZZM0rKrKLBthzQLoTB8yuQ.AhXOE.wZ7xiGv0GtFhQtVoMG5MkOy";

async function main() {
  console.log("🌱 Начинаем заполнение базы данных...");

  console.log("🧹 Очистка старых данных...");
  await prisma.aIChatHistory.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Создание пользователя...");
  const user = await prisma.user.create({
    data: {
      email: "demo@finai.ru",
      cardNumber: "1111222233334444",
      passwordHash: HASHED_PASSWORD,
      name: "Демо Пользователь",
    },
  });

  console.log("📁 Создание категорий...");
  
  // Категории расходов
  const expenseCategories = [
    { name: "Сотовая связь", type: "expense", icon: "📱", color: "#6366f1" },
    { name: "Такси", type: "expense", icon: "🚕", color: "#f59e0b" },
    { name: "Транспорт", type: "expense", icon: "🚌", color: "#f97316" },
    { name: "Автомобиль", type: "expense", icon: "🚗", color: "#64748b" },
    { name: "Продукты", type: "expense", icon: "🛒", color: "#22c55e" },
    { name: "Кафе и рестораны", type: "expense", icon: "🍽️", color: "#ec4899" },
    { name: "Фастфуд", type: "expense", icon: "🍔", color: "#f43f5e" },
    { name: "Доставка еды", type: "expense", icon: "🛵", color: "#f97316" },
    { name: "Покупки", type: "expense", icon: "🛍️", color: "#8b5cf6" },
    { name: "Одежда", type: "expense", icon: "👕", color: "#a855f7" },
    { name: "Здоровье", type: "expense", icon: "💊", color: "#10b981" },
    { name: "Красота", type: "expense", icon: "💅", color: "#ec4899" },
    { name: "Развлечения", type: "expense", icon: "🎬", color: "#8b5cf6" },
    { name: "Подписки", type: "expense", icon: "📺", color: "#6366f1" },
    { name: "ЖКХ", type: "expense", icon: "🏠", color: "#0ea5e9" },
    { name: "Образование", type: "expense", icon: "📚", color: "#3b82f6" },
    { name: "Путешествия", type: "expense", icon: "✈️", color: "#0ea5e9" },
    { name: "Переводы людям", type: "expense", icon: "💸", color: "#64748b" },
    { name: "Прочее", type: "expense", icon: "📦", color: "#94a3b8" },
  ];

  // Категории доходов
  const incomeCategories = [
    { name: "Зарплата", type: "income", icon: "💰", color: "#22c55e" },
    { name: "Переводы от людей", type: "income", icon: "💵", color: "#10b981" },
    { name: "Кэшбэк", type: "income", icon: "🎁", color: "#f59e0b" },
    { name: "Возврат", type: "income", icon: "↩️", color: "#0ea5e9" },
    { name: "Проценты", type: "income", icon: "📈", color: "#22c55e" },
    { name: "Прочие доходы", type: "income", icon: "💎", color: "#a855f7" },
  ];

  const allCategories = [...expenseCategories, ...incomeCategories];

  await prisma.category.createMany({
    data: allCategories,
  });

  console.log("💳 Создание счетов...");
  const account1 = await prisma.account.create({
    data: {
      userId: user.id,
      name: "Основной счет",
      balance: 125000.50,
      currency: "RUB",
      type: "checking",
    },
  });

  await prisma.account.create({
    data: {
      userId: user.id,
      name: "Накопительный счет",
      balance: 50000.00,
      currency: "RUB",
      type: "savings",
    },
  });

  console.log("✅ База данных успешно заполнена!");
  console.log("\n📊 Создано:");
  console.log(`   - 1 пользователь (карта: 1111222233334444, пароль: password123)`);
  console.log(`   - ${allCategories.length} категорий (${expenseCategories.length} расходов, ${incomeCategories.length} доходов)`);
  console.log(`   - 2 счета`);
}

main()
  .catch((e) => {
    console.error("❌ Ошибка при заполнении БД:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });