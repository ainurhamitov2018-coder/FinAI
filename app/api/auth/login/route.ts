/**
 * API endpoint: Вход в систему
 * POST /api/auth/login
 * 
 * Для ВКР: демонстрирует аутентификацию пользователя.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { comparePassword, generateToken } from "@/lib/auth";

// Принимаем либо email, либо cardNumber + password
const loginSchema = z.object({
  email: z.string().email("Неверный формат email").optional(),
  cardNumber: z.string().min(12, "Неверный номер карты").optional(),
  password: z.string().min(1, "Пароль обязателен"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Валидация данных
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, cardNumber, password } = validation.data;

    // Поиск пользователя: сначала по email, затем по cardNumber
    let user = null as any;
    if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    } else if (cardNumber) {
      // Нормализуем номер карты: удаляем пробелы и все не-цифры
      const normalizedCard = String(cardNumber).replace(/\D/g, '');
      user = await prisma.user.findUnique({ where: { cardNumber: normalizedCard } as any });
    }

    if (!user) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 }
      );
    }

    // Проверка пароля
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 }
      );
    }

    // Генерация JWT токена
    const token = generateToken({
      userId: user.id,
      email: user.email || "",
    });

    return NextResponse.json({
      message: "Успешный вход",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error("Ошибка входа:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}











