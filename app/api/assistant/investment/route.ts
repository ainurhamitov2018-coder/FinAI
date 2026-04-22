/**
 * API Route: /api/assistant/investment
 * 
 * Дает инвестиционные рекомендации на основе финансового состояния
 */

import { NextRequest, NextResponse } from "next/server";
import { GigaChatClient } from "@/lib/groq-client";

export async function POST(request: NextRequest) {
  try {
    const { availableMoney, savingsRate, riskTolerance = "medium" } =
      await request.json();

    if (!availableMoney || !savingsRate) {
      return NextResponse.json(
        { error: "availableMoney and savingsRate are required" },
        { status: 400 }
      );
    }

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

    const advice = await groq.getInvestmentAdvice(
      availableMoney,
      savingsRate,
      riskTolerance as "low" | "medium" | "high"
    );

    return NextResponse.json({
      success: true,
      advice,
      parameters: {
        availableMoney,
        savingsRate,
        riskTolerance,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/assistant/investment:", error);
    return NextResponse.json(
      { error: "Failed to get investment advice" },
      { status: 500 }
    );
  }
}
