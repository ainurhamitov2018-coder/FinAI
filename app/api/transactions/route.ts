/**
 * API endpoints для работы с транзакциями
 * GET /api/transactions - получить транзакции с фильтрами
 * POST /api/transactions - создать новую транзакцию
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthenticatedRequest } from "@/lib/middleware";

const createTransactionSchema = z.object({
  accountId: z.string().uuid("Неверный формат ID счета"),
  amount: z.number().positive("Сумма должна быть положительной"),
  type: z.enum(["income", "expense"]),
  categoryId: z.string().uuid("Неверный формат ID категории"),
  description: z.string().min(1, "Описание обязательно"),
  date: z.string().or(z.date()),
});

// GET /api/transactions
export const GET = requireAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Получаем все счета пользователя для фильтрации
    const userAccounts = await prisma.account.findMany({
      where: { userId: req.userId! },
      select: { id: true },
    });
    const accountIds = userAccounts.map((acc) => acc.id);

    // Если указан accountId, проверяем принадлежность
    if (accountId && !accountIds.includes(accountId)) {
      return NextResponse.json(
        { error: "Счет не найден или не принадлежит вам" },
        { status: 404 }
      );
    }

    // Построение запроса
    const where: any = {
      accountId: accountId || { in: accountIds },
    };

    if (type === "income" || type === "expense") {
      where.type = type;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.transaction.count({ where });

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Ошибка получения транзакций:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
});

// POST /api/transactions
export const POST = requireAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();

    // Валидация данных
    const validation = createTransactionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { accountId, amount, type, categoryId, description, date } = validation.data;

    // Проверка принадлежности счета пользователю
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: req.userId!,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Счет не найден или не принадлежит вам" },
        { status: 404 }
      );
    }

    // Проверка существования категории
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 }
      );
    }

    // Создание транзакции
    const transaction = await prisma.transaction.create({
      data: {
        accountId,
        amount: type === "expense" ? -Math.abs(amount) : Math.abs(amount),
        type,
        categoryId,
        description,
        date: typeof date === "string" ? new Date(date) : date,
      },
      include: {
        category: true,
        account: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Обновление баланса счета
    const newBalance = Number(account.balance) + Number(transaction.amount);
    await prisma.account.update({
      where: { id: accountId },
      data: { balance: newBalance },
    });

    return NextResponse.json(
      {
        message: "Транзакция успешно создана",
        transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Ошибка создания транзакции:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
});











