/**
 * API Route: /api/assistant/analyze
 * 
 * Анализирует финансовые данные пользователя с помощью Groq AI
 * и предоставляет детальный анализ расходов и доходов
 */

import { NextRequest, NextResponse } from "next/server";
import { GigaChatClient } from "@/lib/groq-client";
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

    function getMonthRange(date: Date) {
      return {
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59),
      };
    }

    function parseTransactionDate(tx: any) {
      return tx.operationDate ? new Date(tx.operationDate) : tx.processedDate ? new Date(tx.processedDate) : null;
    }

    function isTransferCategory(category: string) {
      return category.toLowerCase().includes('transfer') || category.toLowerCase().includes('перевод');
    }

    function filterTransactions(transactions: any[], start: Date, end: Date) {
      return transactions
        .map((t: any) => ({
          date: parseTransactionDate(t),
          description: (t.description || '').replace(/\n+/g, ' '),
          amount: Number(t.amount || 0),
          category: t.category || 'other',
          type: t.type || (Number(t.amount || 0) < 0 ? 'expense' : 'income'),
        }))
        .filter((t: any) => {
          if (!t.date) return false;
          const txDate = new Date(t.date);
          return txDate >= start && txDate <= end;
        })
        .filter((t: any) => !isTransferCategory(t.category) && !t.description.toLowerCase().includes('переводы через сбп'));
    }

    function findLastExpenseMonth(transactions: any[]) {
      const expenseTx = transactions
        .map((t: any) => ({ ...t, date: parseTransactionDate(t) }))
        .filter((t: any) => t.date && (t.type === 'expense' || Number(t.amount || 0) < 0))
        .sort((a: any, b: any) => b.date.getTime() - a.date.getTime());

      if (!expenseTx.length) return null;
      return getMonthRange(expenseTx[0].date);
    }

    let periodStart: Date;
    let periodEnd: Date = now;
    if (monthProgress <= 0.5) {
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (monthProgress < 0.8) {
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      periodEnd = now;
    } else {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = now;
    }

    let txs: any[] = [];
    let selectedPeriod = { start: periodStart, end: periodEnd };
    if (parsed && parsed.transactions) {
      txs = filterTransactions(parsed.transactions, periodStart, periodEnd);

      if (!txs.length) {
        const previousPeriod = getMonthRange(new Date(now.getFullYear(), now.getMonth() - 1, 1));
        txs = filterTransactions(parsed.transactions, previousPeriod.start, previousPeriod.end);
        selectedPeriod = previousPeriod;
      }

      if (!txs.length) {
        const fallbackPeriod = findLastExpenseMonth(parsed.transactions);
        if (fallbackPeriod) {
          txs = filterTransactions(parsed.transactions, fallbackPeriod.start, fallbackPeriod.end);
          selectedPeriod = fallbackPeriod;
        }
      }

      const filteredIncome = txs.filter((t:any)=>t.type==='income').reduce((s:number,t:any)=>s+t.amount,0);
      const filteredExpenses = txs.filter((t:any)=>t.type==='expense').reduce((s:number,t:any)=>s+t.amount,0);

      transactionSummary = {
        totalIncome: filteredIncome,
        totalExpenses: filteredExpenses,
        netBalance: filteredIncome - filteredExpenses,
        currency: 'RUB',
        period: {
          start: selectedPeriod.start.toISOString().split('T')[0],
          end: selectedPeriod.end.toISOString().split('T')[0],
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
