/**
 * API endpoints для работы с конкретным счетом
 * GET /api/accounts/[id] - получить счет по ID
 * PUT /api/accounts/[id] - обновить счет
 * DELETE /api/accounts/[id] - удалить счет
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthenticatedRequest } from "@/lib/middleware";

// GET /api/accounts/[id]
export const GET = requireAuth(async (
  req: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const params = await context.params;
    const account = await prisma.account.findFirst({
      where: {
        id: params.id,
        userId: req.userId!,
      },
      include: {
        transactions: {
          take: 10,
          orderBy: { date: "desc" },
          include: {
            category: true,
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Счет не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error("Ошибка получения счета:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
});

// DELETE /api/accounts/[id]
export const DELETE = requireAuth(async (
  req: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const params = await context.params;
    // Проверка существования счета и принадлежности пользователю
    const account = await prisma.account.findFirst({
      where: {
        id: params.id,
        userId: req.userId!,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Счет не найден" },
        { status: 404 }
      );
    }

    // Удаление счета (транзакции удалятся каскадно)
    await prisma.account.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Счет успешно удален",
    });
  } catch (error) {
    console.error("Ошибка удаления счета:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
});

