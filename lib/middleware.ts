/**
 * Middleware для API endpoints
 * 
 * Проверка аутентификации и валидация данных.
 * 
 * Для ВКР: демонстрирует использование middleware для защиты API.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "./auth";

export interface AuthenticatedRequest extends NextRequest {
  userId?: string;
  userEmail?: string;
}

/**
 * Middleware для проверки аутентификации
 */
export function requireAuth(
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any) => {
    const authHeader = req.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: "Требуется аутентификация" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Недействительный токен" },
        { status: 401 }
      );
    }

    // Добавляем информацию о пользователе в запрос
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.userId = payload.userId;
    authenticatedReq.userEmail = payload.email;

    return handler(authenticatedReq, context);
  };
}

/**
 * Валидация JSON тела запроса
 */
export function validateBody<T>(
  body: unknown,
  validator: (data: unknown) => data is T
): { success: true; data: T } | { success: false; error: string } {
  if (!body) {
    return { success: false, error: "Тело запроса пустое" };
  }

  if (!validator(body)) {
    return { success: false, error: "Неверный формат данных" };
  }

  return { success: true, data: body };
}

