/**
 * API Route: /api/assistant/forecast
 * 
 * Прогнозирует будущие расходы на основе истории
 */

import { NextRequest, NextResponse } from "next/server";
import { GigaChatClient } from "@/lib/groq-client";
import fs from 'fs';
import path from 'path';

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

    function getMonthRange(date: Date) {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      return { start, end };
    }

    function parseTransactionDate(tx: any) {
      return tx.operationDate ? new Date(tx.operationDate) : tx.processedDate ? new Date(tx.processedDate) : null;
    }

    function filterExpenses(transactions: any[], start: Date, end: Date) {
      return transactions
        .map((t: any) => ({
          date: parseTransactionDate(t),
          amount: Number(t.amount || 0),
          category: t.category || t.categoryName || 'other',
          type: t.type || (Number(t.amount || 0) < 0 ? 'expense' : 'income'),
        }))
        .filter((t: any) => t.date && t.date >= start && t.date <= end && t.type === 'expense' && t.category !== 'transfer');
    }

    function findLastExpenseMonth(transactions: any[]) {
      const expenseTx = transactions
        .map((t: any) => ({ ...t, date: parseTransactionDate(t) }))
        .filter((t: any) => t.date && (t.type === 'expense' || Number(t.amount || 0) < 0))
        .sort((a: any, b: any) => b.date.getTime() - a.date.getTime());

      if (!expenseTx.length) return null;
      const latest = expenseTx[0].date;
      return getMonthRange(latest);
    }

    function parseNumber(str: any) {
      if (str == null) return null;
      let cleaned = String(str).trim();
      cleaned = cleaned.replace(/\s/g, '');
      if (/\,\d{2}$/.test(cleaned)) {
        cleaned = cleaned.replace(',', '.');
      } else if (cleaned.includes(',') && cleaned.includes('.')) {
        cleaned = cleaned.replace(/,/g, '');
      }
      const m = cleaned.match(/(-?\d+(?:\.\d+)?)/);
      return m ? parseFloat(m[1]) : null;
    }

    function toISO(dateStr: string, timeStr?: string) {
      if (!dateStr) return null;
      const d = dateStr.trim().split('.');
      if (d.length !== 3) return null;
      const [dd, mm, yyyy] = d;
      if (timeStr) {
        const t = timeStr.trim();
        return `${yyyy}-${mm}-${dd}T${t}`;
      }
      return `${yyyy}-${mm}-${dd}`;
    }

    function parseDataText(text: string) {
      const transactions: any[] = [];
      const txRegex = /(\d{2}\.\d{2}\.\d{4})\s+(\d{2}:\d{2}:\d{2})\s+(\d{2}\.\d{2}\.\d{4})\s+([\-\d,\.]+)\s+RUB\s+([\d,\.]*)\s+RUB\s+([\d,\.]*)\s+RUB\s+([0-9,\.]+)\s+(.*?)(?=\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}:\d{2}|$)/gs;
      let match;
      while ((match = txRegex.exec(text)) !== null) {
        const opDate = match[1];
        const opTime = match[2];
        const procDate = match[3];
        const opAmountStr = match[4];
        const descriptionStr = match[8];
        const opAmount = parseNumber(opAmountStr);
        if (opAmount === null) continue;

        const description = descriptionStr.trim() || 'Прочее';
        const category = description;
        transactions.push({
          id: `tx_${Date.now()}_${transactions.length + 1}`,
          operationDate: toISO(opDate, opTime),
          processedDate: toISO(procDate, undefined),
          amount: opAmount,
          currency: 'RUB',
          type: opAmount < 0 ? 'expense' : 'income',
          description,
          category,
          categoryName: description,
        });
      }
      return { transactions };
    }

    function loadParsedData() {
      const parsedPath = path.resolve(process.cwd(), 'scripts', 'out_parsed.json');
      if (fs.existsSync(parsedPath)) {
        try { return JSON.parse(fs.readFileSync(parsedPath, 'utf8')); } catch (e) { return null; }
      }

      const dataPath = path.resolve(process.cwd(), 'data.txt');
      if (fs.existsSync(dataPath)) {
        try {
          const text = fs.readFileSync(dataPath, 'utf8');
          return parseDataText(text);
        } catch (e) {
          console.warn('Could not parse data.txt at runtime:', e);
        }
      }

      return null;
    }

    const parsed = loadParsedData();

    const now = new Date();
    const currentPeriod = getMonthRange(now);
    const previousPeriod = getMonthRange(new Date(now.getFullYear(), now.getMonth() - 1, 1));

    let historicalData: Array<{ category: string; amount: number; percentage: number }> = [];
    let totalExpenses = 0;

    if (parsed && parsed.transactions) {
      let txs = filterExpenses(parsed.transactions, currentPeriod.start, currentPeriod.end);
      let selectedPeriod = currentPeriod;

      if (!txs.length) {
        txs = filterExpenses(parsed.transactions, previousPeriod.start, previousPeriod.end);
        selectedPeriod = previousPeriod;
      }

      if (!txs.length) {
        const fallbackPeriod = findLastExpenseMonth(parsed.transactions);
        if (fallbackPeriod) {
          txs = filterExpenses(parsed.transactions, fallbackPeriod.start, fallbackPeriod.end);
          selectedPeriod = fallbackPeriod;
        }
      }

      if (txs.length) {
        const catMap: Record<string, number> = {};
        for (const t of txs) {
          const key = t.category || 'other';
          catMap[key] = (catMap[key] || 0) + Math.abs(Number(t.amount || 0));
        }

        totalExpenses = Object.values(catMap).reduce((sum: number, value: number) => sum + value, 0);
        historicalData = Object.entries(catMap)
          .map(([category, amount]) => ({
            category,
            amount: Number(amount),
            percentage: totalExpenses > 0 ? (Number(amount) / totalExpenses) * 100 : 0,
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 8);
      }
    }

    if (historicalData.length === 0) {
      historicalData = [
        { category: 'shopping', amount: 15000, percentage: 40 },
        { category: 'food', amount: 10000, percentage: 27 },
        { category: 'transport', amount: 5000, percentage: 13 },
        { category: 'entertainment', amount: 4000, percentage: 11 },
        { category: 'utilities', amount: 3500, percentage: 9 },
      ];
    }

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