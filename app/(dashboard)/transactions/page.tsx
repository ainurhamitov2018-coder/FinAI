"use client";

import React, { useEffect, useState, Suspense } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useDataStore } from "@/lib/store";
import { formatCurrency, formatDate, maskFullName } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

function TransactionsContent() {
  const searchParams = useSearchParams();
  const accountId = searchParams.get("accountId");
  const {
    transactions,
    categories,
    accounts,
    loading,
    fetchTransactions,
    fetchCategories,
    fetchAccounts,
    createTransaction,
  } = useDataStore();
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    accountId: accountId || "",
    amount: "",
    type: "expense" as "income" | "expense",
    categoryId: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchTransactions({ accountId: accountId || undefined });
    fetchCategories();
    fetchAccounts();
  }, [accountId]);

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "all") return true;
    return t.type === filter;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTransaction({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setShowModal(false);
      setFormData({
        accountId: accountId || "",
        amount: "",
        type: "expense",
        categoryId: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Транзакции</h1>
          <p className="text-gray-400 mt-2">История всех операций</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Добавить транзакцию</Button>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700 shadow-md">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-300">Фильтр:</span>
          <Button
            variant={filter === "all" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Все
          </Button>
          <Button
            variant={filter === "income" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilter("income")}
          >
            Доходы
          </Button>
          <Button
            variant={filter === "expense" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilter("expense")}
          >
            Расходы
          </Button>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-gray-800 border-gray-700 shadow-md">
        {loading && transactions.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bank-blue mx-auto mb-4"></div>
              <p className="text-gray-400">Загрузка...</p>
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Транзакций не найдено</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                    Дата
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                    Описание
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                    Категория
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">
                    Сумма
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-700 hover:bg-gray-700 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: transaction.category?.color
                              ? `${transaction.category.color}30`
                              : "#374151",
                          }}
                        >
                          <span>
                            {transaction.category?.icon || "💳"}
                          </span>
                        </div>
                        <span className="font-medium text-white">
                          {maskFullName(transaction.description)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {transaction.category?.name || "Без категории"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-semibold ${
                          transaction.type === "income"
                            ? "text-bank-accent"
                            : "text-bank-danger"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(Math.abs(Number(transaction.amount)))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal для создания транзакции */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto bg-white">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Добавить транзакцию</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Счет
                </label>
                <select
                  value={formData.accountId}
                  onChange={(e) =>
                    setFormData({ ...formData, accountId: e.target.value })
                  }
                  required
                  className="input"
                >
                  <option value="">Выберите счет</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(Number(acc.balance))})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "income" | "expense",
                    })
                  }
                  className="input"
                >
                  <option value="income">Доход</option>
                  <option value="expense">Расход</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  required
                  className="input"
                >
                  <option value="">Выберите категорию</option>
                  {categories
                    .filter((cat) => cat.type === formData.type)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сумма
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                  min="0.01"
                  step="0.01"
                  className="input"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  className="input"
                  placeholder="Описание транзакции"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  className="input"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Отмена
                </Button>
                <Button type="submit" className="flex-1">
                  Добавить
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <TransactionsContent />
    </Suspense>
  );
}
