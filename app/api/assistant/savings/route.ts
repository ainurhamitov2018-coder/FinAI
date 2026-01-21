/**
 * API Route: /api/assistant/savings
 * 
 * Предоставляет советы по экономии денег на основе реальных данных
 */

import { NextRequest, NextResponse } from "next/server";
import { GroqClient } from "@/lib/groq-client";
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    const groq = new GroqClient({ apiKey });

    // Умная логика выбора периода (как в analyze)
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthProgress = currentDay / daysInMonth;

    let periodStart: Date;
    let periodEnd: Date = now;
    
    if (monthProgress <= 0.5) {
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (monthProgress > 0.5 && monthProgress < 0.8) {
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      periodEnd = now;
    } else {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = now;
    }

    // Загружаем реальные данные
    const parsedPath = path.resolve(process.cwd(), 'scripts', 'out_parsed.json');
    let parsed: any = null;
    if (fs.existsSync(parsedPath)) {
      try { parsed = JSON.parse(fs.readFileSync(parsedPath, 'utf8')); } catch (e) { parsed = null; }
    }

    let expenses: Array<{ category: string; amount: number; percentage: number }> = [];
    let totalExpenses = 0;

    if (parsed && parsed.transactions) {
      const txs = parsed.transactions
        .map((t: any) => ({
          date: t.operationDate || t.processedDate || null,
          amount: Number(t.amount || 0),
          category: t.category || 'other',
          type: t.type || (t.amount < 0 ? 'expense' : 'income'),
        }))
        .filter((t: any) => {
          if (!t.date || t.type !== 'expense') return false;
          const txDate = new Date(t.date);
          return txDate >= periodStart && txDate <= periodEnd;
        })
        .filter((t: any) => t.category !== 'transfer' && !t.category?.toLowerCase().includes('transfer'));

      const catMap: Record<string, number> = {};
      for (const t of txs) {
        const k = t.category || 'other';
        catMap[k] = (catMap[k] || 0) + Number(t.amount || 0);
      }

      totalExpenses = Object.values(catMap).reduce((s: any, v: any) => s + v, 0);
      expenses = Object.entries(catMap)
        .map(([category, amount]) => ({
          category,
          amount: Number(amount),
          percentage: totalExpenses > 0 ? (Number(amount) / totalExpenses) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 8);
    }

    const advice = await groq.getSavingsTips(expenses, totalExpenses);

    return NextResponse.json({
      success: true,
      advice,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/assistant/savings:", error);
    return NextResponse.json(
      { error: "Failed to get savings advice" },
      { status: 500 }
    );
  }
}
