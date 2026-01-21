"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [cardNumber, setCardNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(cardNumber, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  const formatCard = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const onCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCard(e.target.value));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bank-blue via-primary-600 to-primary-700 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col items-start justify-center text-left text-white px-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4">
            <span className="text-3xl font-bold text-bank-blue">F</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">FinAI</h1>
          <p className="text-white/90 mb-6">Интеллектуальный финансовый ассистент — аналитика, прогнозы и помощь в учёте расходов.</p>
          <ul className="text-sm text-white/80 space-y-2">
            <li>• Быстрый обзор счёта</li>
            <li>• Категоризация трат</li>
            <li>• Интеллектуальные подсказки</li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Вход в Интернет-банк</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Номер карты
              </label>
              <input
                id="cardNumber"
                inputMode="numeric"
                pattern="[0-9 ]*"
                maxLength={19}
                value={cardNumber}
                onChange={onCardChange}
                required
                className="input"
                placeholder="1111 2222 3333 4444"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                >
                  {showPassword ? "Скрыть" : "Показать"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" checked={remember} onChange={() => setRemember((r) => !r)} />
                Запомнить меня
              </label>
              <Link href="#" className="text-primary-600 hover:underline">Забыли пароль?</Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Вход..." : "Войти"}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <p className="text-gray-600">Нет аккаунта?</p>
            <Link href="/register" className="text-primary-600 hover:underline font-medium">Зарегистрироваться</Link>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2 font-medium">Демо-аккаунт:</p>
            <p className="text-xs text-gray-500">Номер карты: 1111 2222 3333 4444</p>
            <p className="text-xs text-gray-500">Пароль: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

