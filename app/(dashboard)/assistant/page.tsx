'use client';

import React from 'react';
import FinancialAdvisor from '@/components/FinancialAdvisor';

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          💼 Финансовый ассистент
        </h1>
        <p className="text-gray-400 mt-2">
          Анализ ваших финансов и персональные рекомендации для развития финансовой грамотности
        </p>
      </div>

      {/* Основной контент */}
      <FinancialAdvisor />

      {/* Информация */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-bank-blue to-primary-600 rounded-xl p-6 text-white shadow-lg">
          <h3 className="font-semibold mb-2 text-lg">📊 Анализ</h3>
          <p className="text-sm opacity-90">
            Получите детальный анализ ваших расходов и доходов
          </p>
        </div>
        <div className="bg-gradient-to-br from-bank-blue to-primary-600 rounded-xl p-6 text-white shadow-lg">
          <h3 className="font-semibold mb-2 text-lg">💡 Экономия</h3>
          <p className="text-sm opacity-90">
            Конкретные советы по сокращению расходов и увеличению сбережений
          </p>
        </div>
        <div className="bg-gradient-to-br from-bank-blue to-primary-600 rounded-xl p-6 text-white shadow-lg">
          <h3 className="font-semibold mb-2 text-lg">💎 Инвестиции</h3>
          <p className="text-sm opacity-90">
            Рекомендации по приумножению денег в соответствии с вашей стратегией
          </p>
        </div>
      </div>
    </div>
  );
}