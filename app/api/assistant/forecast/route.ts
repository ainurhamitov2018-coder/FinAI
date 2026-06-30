/**
 * API Route: /api/assistant/forecast
 * 
 * Прогнозирует будущие расходы на основе истории
 */

import { NextRequest, NextResponse } from "next/server";
import { GigaChatClient } from "@/lib/groq-client";

export async function POST(request: NextRequest) {
  try {
    const { accountId, months = 3 } = await request.json();

    const apiKey = process.env.GIGACHAT_AUTH_KEY;
    const baseUrl = process.env.GIGACHAT_BASE_URL || 'https://gigachat.devices.sberbank.ru/api/v1';
    if (!apiKey) {
      return NextResponse.json(
        { error: "GigaChat auth key not configured" },
        { status: 500 }
      );
    }

    const groq = new GigaChatClient({ 
      authKey: apiKey,
      baseUrl,
      model: process.env.GIGACHAT_MODEL
    });

    const historicalData = [
      { category: 'shopping', amount: 15000, percentage: 40 },
      { category: 'food', amount: 10000, percentage: 27 },
      { category: 'transport', amount: 5000, percentage: 13 },
      { category: 'entertainment', amount: 4000, percentage: 11 },
      { category: 'utilities', amount: 3500, percentage: 9 },
    ];

    const forecast = await groq.forecastExpenses(historicalData, months);

    return NextResponse.json({
      success: true,
      forecast,
      months,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/assistant/forecast:", error);
    return NextResponse.json(
      { error: "Failed to forecast expenses" },
      { status: 500 }
    );
  }
}