"use client";

import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useDataStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function AccountsPage() {
  const router = useRouter();
  const { accounts, loading, fetchAccounts, createAccount } = useDataStore();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    balance: 0,
    currency: "RUB",
    type: "checking" as "checking" | "savings" | "credit",
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAccount(formData);
      setShowModal(false);
      setFormData({ name: "", balance: 0, currency: "RUB", type: "checking" });
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Счета</h1>
          <p className="text-gray-400 mt-2">Управление вашими счетами</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Добавить счет</Button>
      </div>

      {loading && accounts.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bank-blue mx-auto mb-4"></div>
            <p className="text-gray-400">Загрузка...</p>
          </div>
        </div>
      ) : accounts.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700 text-center py-12">
          <p className="text-gray-400 mb-4">У вас пока нет счетов</p>
          <Button onClick={() => setShowModal(true)}>Создать первый счет</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <div
              key={account.id}
              onClick={() => router.push(`/accounts/${account.id}`)}
              className="cursor-pointer"
            >
              <Card className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow shadow-md h-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {account.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {account.type === "checking"
                          ? "Текущий счет"
                          : account.type === "savings"
                          ? "Накопительный счет"
                          : "Кредитный счет"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-bank-blue/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💳</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Баланс</p>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(Number(account.balance), account.currency)}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/transactions?accountId=${account.id}`);
                      }}
                    >
                      Операции
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Total Balance Summary */}
      {accounts.length > 0 && (
        <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm mb-1">
                Общий баланс по всем счетам
              </p>
              <p className="text-3xl font-bold">
                {formatCurrency(
                  accounts.reduce((sum, acc) => sum + Number(acc.balance), 0)
                )}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Modal для создания счета */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-white">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Создать новый счет</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название счета
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="input"
                  placeholder="Основной счет"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип счета
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as any,
                    })
                  }
                  className="input"
                >
                  <option value="checking">Текущий счет</option>
                  <option value="savings">Накопительный счет</option>
                  <option value="credit">Кредитный счет</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Начальный баланс
                </label>
                <input
                  type="number"
                  value={formData.balance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      balance: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="0.01"
                  className="input"
                  placeholder="0.00"
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
                  Создать
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}