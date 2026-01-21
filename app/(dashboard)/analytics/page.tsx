"use client";

import React, { useEffect } from "react";
import Card from "@/components/ui/Card";
import { useDataStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsPage() {
  const { analytics, loading, fetchAnalytics } = useDataStore();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bank-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка аналитики...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="bg-gray-800 border-gray-700 text-center py-12">
        <p className="text-gray-400">Данных для аналитики пока нет</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Аналитика</h1>
        <p className="text-gray-400 mt-2">Анализ ваших финансов за текущий месяц</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700 shadow-lg">
          <p className="text-sm text-gray-400 mb-2">Доход за месяц</p>
          <p className="text-2xl font-bold text-bank-accent">
            {formatCurrency(analytics.totalIncome)}
          </p>
        </Card>
        <Card className="bg-gray-800 border-gray-700 shadow-lg">
          <p className="text-sm text-gray-400 mb-2">Расходы за месяц</p>
          <p className="text-2xl font-bold text-bank-danger">
            {formatCurrency(analytics.totalExpenses)}
          </p>
        </Card>
        <Card className="bg-gray-800 border-gray-700 shadow-lg">
          <p className="text-sm text-gray-400 mb-2">Остаток</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(
              analytics.totalIncome - analytics.totalExpenses
            )}
          </p>
        </Card>
      </div>

      {/* Expenses by Category */}
      <Card title="Расходы по категориям" className="bg-gray-800 border-gray-700 shadow-md">
        {analytics.expensesByCategory.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Нет данных о расходах</p>
        ) : (
          <div className="space-y-4">
            {analytics.expensesByCategory.map((item) => (
              <div key={item.categoryId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">
                    {item.categoryName}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-400">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-bank-blue h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Current Month */}
      <Card title="Текущий месяц" className="bg-gray-800 border-gray-700 shadow-md">
        {analytics.monthlyTrend.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Нет данных за текущий месяц</p>
        ) : (
          <div className="space-y-4">
            {analytics.monthlyTrend.map((month, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors"
              >
                <div>
                  <p className="font-medium text-white">{month.month}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div>
                      <p className="text-xs text-gray-400">Доходы</p>
                      <p className="text-sm font-semibold text-bank-accent">
                        {formatCurrency(month.income)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Расходы</p>
                      <p className="text-sm font-semibold text-bank-danger">
                        {formatCurrency(month.expenses)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Остаток</p>
                  <p className="text-sm font-bold text-white">
                    {formatCurrency(month.income - month.expenses)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
