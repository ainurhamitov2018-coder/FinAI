"use client";

import React, { useEffect } from "react";
import Card from "@/components/ui/Card";
import { useDataStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const {
    accounts,
    transactions,
    analytics,
    loading,
    fetchAccounts,
    fetchTransactions,
    fetchAnalytics,
    refreshData,
  } = useDataStore();

  useEffect(() => {
    refreshData();
  }, []);

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const recentTransactions = transactions.slice(0, 5);

  if (loading && accounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bank-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Дашборд</h1>
        <p className="text-gray-400 mt-2">Обзор ваших финансов</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm mb-1">Общий баланс</p>
              <p className="text-3xl font-bold">
                {formatCurrency(totalBalance)}
              </p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl">💳</span>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Доходы за месяц</p>
              <p className="text-2xl font-bold text-bank-accent">
                {analytics ? formatCurrency(analytics.totalIncome) : "₽0.00"}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">↑</span>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Расходы за месяц</p>
              <p className="text-2xl font-bold text-bank-danger">
                {analytics ? formatCurrency(analytics.totalExpenses) : "₽0.00"}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">↓</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Accounts Overview */}
      <Card title="Мои счета" className="bg-gray-800 border-gray-700 shadow-md">
        {accounts.length === 0 ? (
          <p className="text-gray-400 text-center py-8">У вас пока нет счетов</p>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors"
              >
                <div>
                  <p className="font-semibold text-white">{account.name}</p>
                  <p className="text-sm text-gray-400">
                    {account.type === "checking"
                      ? "Текущий счет"
                      : account.type === "savings"
                      ? "Накопительный счет"
                      : "Кредитный счет"}
                  </p>
                </div>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(Number(account.balance), account.currency)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Transactions */}
      <Card title="Последние транзакции" className="bg-gray-800 border-gray-700 shadow-md">
        {recentTransactions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Транзакций пока нет</p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border-b border-gray-700 last:border-0 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: transaction.category?.color
                        ? `${transaction.category.color}30`
                        : "#374151",
                    }}
                  >
                    <span className="text-lg">
                      {transaction.category?.icon || "💳"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-400">
                      {transaction.category?.name || "Без категории"} •{" "}
                      {new Date(transaction.date).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-semibold ${
                    transaction.type === "income"
                      ? "text-bank-accent"
                      : "text-bank-danger"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(Math.abs(Number(transaction.amount)))}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
