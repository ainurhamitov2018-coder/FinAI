/**
 * API Route: /api/assistant/analyze
 * 
 * Анализирует финансовые данные пользователя с помощью Groq AI
 * и предоставляет детальный анализ расходов и доходов
 */

import { NextRequest, NextResponse } from "next/server";
import { GroqClient } from "@/lib/groq-client";
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { accountId, period = "month" } = await request.json();

    // Попробуем загрузить распаршенную выписку из `scripts/out_parsed.json` (dev fallback)
    const parsedPath = path.resolve(process.cwd(), 'scripts', 'out_parsed.json');
    let parsed: any = null;
    if (fs.existsSync(parsedPath)) {
      try { parsed = JSON.parse(fs.readFileSync(parsedPath, 'utf8')); } catch (e) { parsed = null; }
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    const groq = new GroqClient({ apiKey });

    // Построим реальный запрос на анализ на основе файла или fallback
    let transactionSummary = {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      currency: 'RUB',
      period: { start: '', end: '' },
    };

    // Умная логика выбора периода для анализа
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthProgress = currentDay / daysInMonth;

    let periodStart: Date;
    let periodEnd: Date = now;
    
    if (monthProgress <= 0.5) {
      // Начало месяца - используем прошлый месяц
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (monthProgress > 0.5 && monthProgress < 0.8) {
      // Больше половины месяца - используем прошлый + текущий
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      periodEnd = now;
    } else {
      // Ближе к концу месяца - используем текущий месяц
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = now;
    }

    let txs: any[] = [];
    if (parsed && parsed.transactions) {
      // Фильтруем транзакции по выбранному периоду
      txs = parsed.transactions
        .map((t: any) => ({
          date: t.operationDate || t.processedDate || null,
          description: (t.description || '').replace(/\n+/g, ' '),
          amount: Number(t.amount || 0),
          category: t.category || 'other',
          type: t.type || (t.amount < 0 ? 'expense' : 'income'),
        }))
        .filter((t: any) => {
          if (!t.date) return false;
          const txDate = new Date(t.date);
          return txDate >= periodStart && txDate <= periodEnd;
        })
        // Исключаем переводы (transfer) из анализа
        .filter((t: any) => t.category !== 'transfer' && !t.description.toLowerCase().includes('переводы через сбп'));

      const filteredIncome = txs.filter((t:any)=>t.type==='income').reduce((s:number,t:any)=>s+t.amount,0);
      const filteredExpenses = txs.filter((t:any)=>t.type==='expense').reduce((s:number,t:any)=>s+t.amount,0);

      transactionSummary = {
        totalIncome: filteredIncome,
        totalExpenses: filteredExpenses,
        netBalance: filteredIncome - filteredExpenses,
        currency: 'RUB',
        period: { 
          start: periodStart.toISOString().split('T')[0], 
          end: periodEnd.toISOString().split('T')[0] 
        },
      };
    }

    // Сгруппировать расходы по категориям
    const catMap: Record<string, number> = {};
    for (const t of txs) {
      if (t.type !== 'expense') continue;
      const k = t.category || 'other';
      catMap[k] = (catMap[k] || 0) + Number(t.amount || 0);
    }
    const totalExpenses = transactionSummary.totalExpenses || Object.values(catMap).reduce((s:any,v:any)=>s+v,0);
    const topExpenseCategories = Object.entries(catMap)
      .map(([category, amount]) => ({ category, amount, percentage: totalExpenses ? (amount / totalExpenses) * 100 : 0 }))
      .sort((a,b) => b.amount - a.amount)
      .slice(0, 8);

    // Топ продавцов (мерчантов)
    const merchantMap: Record<string, number> = {};
    for (const t of txs) {
      if (t.type !== 'expense') continue;
      const desc = (t.description || '').split(/—|\bпо\b/i)[0].trim();
      const key = desc || 'Unknown';
      merchantMap[key] = (merchantMap[key] || 0) + Number(t.amount || 0);
    }
    const topMerchants = Object.entries(merchantMap)
      .map(([merchant, amount]) => ({ merchant, amount }))
      .sort((a,b) => b.amount - a.amount)
      .slice(0, 8);

    const recentTransactions = txs.slice().sort((a,b) => (new Date(b.date).getTime() - new Date(a.date).getTime())).slice(0, 20);

    const analysisRequest = {
      transactionSummary,
      topExpenseCategories,
      recentTransactions,
      topMerchants,
    };

    const analysis = await groq.analyzeFinancialData(analysisRequest as any);

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/assistant/analyze:", error);
    return NextResponse.json(
      { error: "Failed to analyze financial data" },
      { status: 500 }
    );
  }
}
