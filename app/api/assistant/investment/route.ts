/**
 * API Route: /api/assistant/investment
 * 
 * Дает инвестиционные рекомендации на основе финансового состояния
 */

import { NextRequest, NextResponse } from "next/server";
import { GroqClient } from "@/lib/groq-client";

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

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    const groq = new GroqClient({ apiKey });

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
