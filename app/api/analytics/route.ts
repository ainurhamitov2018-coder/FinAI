/**
 * API endpoint для аналитики
 * GET /api/analytics
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthenticatedRequest } from "@/lib/middleware";

export const GET = requireAuth(async (req: AuthenticatedRequest) => {
  try {
    // Получаем все счета пользователя
    const userAccounts = await prisma.account.findMany({
      where: { userId: req.userId! },
      select: { id: true },
    });
    const accountIds = userAccounts.map((acc) => acc.id);

    if (accountIds.length === 0) {
      return NextResponse.json({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        expensesByCategory: [],
        monthlyTrend: [],
      });
    }

    // ИСПРАВЛЕНИЕ: Находим последнюю транзакцию пользователя
    const lastTransaction = await prisma.transaction.findFirst({
      where: { userId: req.userId! },
      orderBy: { date: 'desc' },
      select: { date: true }
    });

    // Если транзакций нет - возвращаем пустые данные
    if (!lastTransaction) {
      return NextResponse.json({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        expensesByCategory: [],
        monthlyTrend: [],
      });
    }

    // Используем месяц последней транзакции (не текущую дату!)
    const targetDate = new Date(lastTransaction.date);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    // Создаём границы месяца в UTC для корректной работы с timezone
    const monthStart = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    console.log('=== АНАЛИТИКА ===');
    console.log('Последняя транзакция:', lastTransaction.date);
    console.log('Анализируем период:', monthStart.toISOString(), '-', monthEnd.toISOString());

    // Получаем транзакции за этот месяц
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId!,
        accountId: { in: accountIds },
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      include: {
        category: true,
      },
    });

    console.log('Найдено транзакций:', transactions.length);

    // Расчет статистики
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    console.log('Доходы:', totalIncome, 'Расходы:', totalExpenses);

    // Общий баланс по всем счетам
    const accounts = await prisma.account.findMany({
      where: { userId: req.userId! },
    });
    const balance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    // Расходы по категориям
    const expensesByCategoryMap = new Map<string, { name: string; amount: number }>();
    
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const categoryId = t.categoryId || "unknown";
        const categoryName = t.category?.name || "Без категории";
        const current = expensesByCategoryMap.get(categoryId) || {
          name: categoryName,
          amount: 0,
        };
        current.amount += Math.abs(Number(t.amount));
        expensesByCategoryMap.set(categoryId, current);
      });

    const expensesByCategory = Array.from(expensesByCategoryMap.entries())
      .map(([categoryId, item]) => ({
        categoryId,
        categoryName: item.name,
        amount: item.amount,
        percentage: totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Месячная динамика
    const monthNames = [
      "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
      "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
    ];

    const monthlyTrend = [{
      month: `${monthNames[month]} ${year}`,
      income: totalIncome,
      expenses: totalExpenses,
    }];

    const result = {
      totalIncome,
      totalExpenses,
      balance,
      expensesByCategory,
      monthlyTrend,
    };

    console.log('Категорий расходов:', expensesByCategory.length);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Ошибка получения аналитики:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
});