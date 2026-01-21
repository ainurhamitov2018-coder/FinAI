/**
 * API endpoints для работы со счетами
 * GET /api/accounts - получить все счета пользователя
 * POST /api/accounts - создать новый счет
 * 
 * Для ВКР: демонстрирует CRUD операции и работу с БД через Prisma.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthenticatedRequest } from "@/lib/middleware";

const createAccountSchema = z.object({
  name: z.string().min(1, "Название счета обязательно"),
  balance: z.number().min(0, "Баланс не может быть отрицательным").default(0),
  currency: z.string().default("RUB"),
  type: z.enum(["checking", "savings", "credit"], {
    errorMap: () => ({ message: "Тип счета должен быть: checking, savings или credit" }),
  }),
});

// GET /api/accounts - получить все счета пользователя
export const GET = requireAuth(async (req: AuthenticatedRequest) => {
  try {
    const accounts = await prisma.account.findMany({
      where: {
        userId: req.userId!,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Ошибка получения счетов:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
});

// POST /api/accounts - создать новый счет
export const POST = requireAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();

    // Валидация данных
    const validation = createAccountSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, balance, currency, type } = validation.data;

    // Создание счета
    const account = await prisma.account.create({
      data: {
        userId: req.userId!,
        name,
        balance,
        currency,
        type,
      },
    });

    return NextResponse.json(
      {
        message: "Счет успешно создан",
        account,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Ошибка создания счета:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
});











