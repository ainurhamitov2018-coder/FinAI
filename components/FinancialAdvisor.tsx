/**
 * Financial Advisor Component
 * 
 * Интерфейс для работы с FinAI рекомендациями
 */

'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Card, Button } from '@/components/ui';

interface Advice {
  type: 'analysis' | 'savings' | 'forecast' | 'investment' | 'goal';
  content: string;
  loading: boolean;
  timestamp?: number;
}

interface FinancialGoal {
  amount: number;
  deadline: string;
  monthlySavings: number;
}

// Функция для очистки Markdown-разметки
function cleanMarkdown(text: string): string {
  return text
    // Убираем заголовки ### ## #
    .replace(/^#{1,6}\s+/gm, '')
    // Убираем жирный текст **text** -> text (но сохраняем для HTML)
    // .replace(/\*\*(.+?)\*\*/g, '$1')
    // Убираем курсив *text* -> text
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '$1')
    // Убираем маркеры списка * item -> • item
    .replace(/^\*\s+/gm, '• ')
    // Убираем маркеры списка - item -> • item  
    .replace(/^-\s+/gm, '• ')
    // Убираем нумерованные списки 1. 2. 3. -> просто номер с точкой
    .replace(/^(\d+)\.\s+/gm, '$1. ')
    // Убираем код `code` -> code
    .replace(/`(.+?)`/g, '$1')
    // Убираем ссылки [text](url) -> text
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Убираем горизонтальные линии ---
    .replace(/^-{3,}$/gm, '')
    // Убираем лишние пустые строки (больше 2 подряд)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Функция для форматирования текста в HTML
function formatContent(text: string): string {
  const cleaned = cleanMarkdown(text);
  
  return cleaned
    // Жирный текст **text** -> <strong>text</strong>
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    // Переносы строк
    .replace(/\n/g, '<br />');
}

export default function FinancialAdvisor() {
  const [currentAdvice, setCurrentAdvice] = useState<Advice | null>(null);
  const [loadingType, setLoadingType] = useState<Advice['type'] | null>(null);
  const [goal, setGoal] = useState<FinancialGoal | null>(null);
  const [showGoalForm, setShowGoalForm] = useState(false);

  const handleAnalyze = async () => {
    setLoadingType('analysis');
    await fetchAdvice('analysis', async () => {
      return await api.analyzeFinancialData({ accountId: 'acc_123' });
    });
    setLoadingType(null);
  };

  const handleSavings = async () => {
    setLoadingType('savings');
    await fetchAdvice('savings', async () => {
      return await api.getSavingsAdvice({ accountId: 'acc_123' });
    });
    setLoadingType(null);
  };

  const handleForecast = async () => {
    setLoadingType('forecast');
    await fetchAdvice('forecast', async () => {
      return await api.getForecast({ accountId: 'acc_123', months: 3 });
    });
    setLoadingType(null);
  };

  const handleInvestment = async () => {
    setLoadingType('investment');
    await fetchAdvice('investment', async () => {
      return await api.getInvestmentAdvice({
        availableMoney: 50000,
        savingsRate: 5000,
        riskTolerance: 'medium',
      });
    });
    setLoadingType(null);
  };

  const fetchAdvice = async (
    type: Advice['type'],
    fetcher: () => Promise<any>
  ) => {
    try {
      const response = await fetcher();
      const rawContent = response.analysis || response.advice || response.forecast || '';
      
      setCurrentAdvice({
        type,
        content: rawContent,
        loading: false,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error(`Failed to get ${type}:`, error);
      setCurrentAdvice({
        type,
        content: `Ошибка: не удалось получить рекомендации. Попробуйте позже.`,
        loading: false,
      });
    }
  };

  const handleGoalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const deadline = formData.get('deadline') as string;
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const monthsDiff = Math.max(1, Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const monthlySavings = amount / monthsDiff;

    const newGoal: FinancialGoal = { amount, deadline, monthlySavings };
    setGoal(newGoal);
    setShowGoalForm(false);

    setLoadingType('goal');
    try {
      const response = await api.analyzeFinancialData({ accountId: 'acc_123' });
      const goalAdvice = `Финансовая цель: накопить ${amount.toFixed(2)} ₽ к ${new Date(deadline).toLocaleDateString('ru-RU')}\n\n` +
        `Для достижения цели вам нужно откладывать ${monthlySavings.toFixed(2)} ₽ в месяц.\n\n` +
        `Советы для достижения цели:\n${response.analysis || ''}`;
      
      setCurrentAdvice({
        type: 'goal',
        content: goalAdvice,
        loading: false,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to get goal advice:', error);
    } finally {
      setLoadingType(null);
    }
  };

  const getTitle = (type: Advice['type']): string => {
    switch (type) {
      case 'analysis':
        return '📊 Анализ финансов';
      case 'savings':
        return '💡 Советы по экономии';
      case 'forecast':
        return '📈 Прогноз расходов';
      case 'investment':
        return '💎 Инвестиционные рекомендации';
      case 'goal':
        return '🎯 Финансовая цель';
    }
  };

  return (
    <div className="space-y-6">
      {/* Кнопки */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={handleAnalyze}
          disabled={!!loadingType}
          className="bg-bank-blue hover:bg-primary-600 text-white"
        >
          {loadingType === 'analysis' ? '⏳ Анализирую...' : '📊 Анализ финансов'}
        </Button>
        <Button
          onClick={handleSavings}
          disabled={!!loadingType}
          className="bg-bank-accent hover:bg-green-600 text-white"
        >
          {loadingType === 'savings' ? '⏳ Думаю...' : '💡 Советы по экономии'}
        </Button>
        <Button
          onClick={handleForecast}
          disabled={!!loadingType}
          className="bg-bank-blue hover:bg-primary-600 text-white"
        >
          {loadingType === 'forecast' ? '⏳ Прогнозирую...' : '📈 Прогноз расходов'}
        </Button>
        <Button
          onClick={handleInvestment}
          disabled={!!loadingType}
          className="bg-bank-blue hover:bg-primary-600 text-white"
        >
          {loadingType === 'investment' ? '⏳ Ищу возможности...' : '💎 Инвестиции'}
        </Button>
      </div>

      {/* Финансовая цель */}
      <Card className="p-6 bg-gray-800 border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">🎯 Финансовая цель</h3>
          {!goal && (
            <Button
              onClick={() => setShowGoalForm(!showGoalForm)}
              className="bg-bank-blue hover:bg-primary-600"
            >
              {showGoalForm ? 'Отмена' : '+ Установить цель'}
            </Button>
          )}
        </div>
        
        {showGoalForm && (
          <form onSubmit={handleGoalSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Сумма цели (₽)
              </label>
              <input
                type="number"
                name="amount"
                required
                min="1"
                step="0.01"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-bank-blue"
                placeholder="100000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Срок достижения
              </label>
              <input
                type="date"
                name="deadline"
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-bank-blue"
              />
            </div>
            <Button type="submit" className="w-full bg-bank-blue hover:bg-primary-600">
              Установить цель
            </Button>
          </form>
        )}

        {goal && !showGoalForm && (
          <div className="mt-4 p-4 bg-gray-700 rounded-lg">
            <p className="text-white font-semibold text-lg">
              {goal.amount.toFixed(2)} ₽ к {new Date(goal.deadline).toLocaleDateString('ru-RU')}
            </p>
            <p className="text-gray-300 text-sm mt-2">
              Нужно откладывать: {goal.monthlySavings.toFixed(2)} ₽/месяц
            </p>
            <Button
              onClick={() => setGoal(null)}
              variant="outline"
              size="sm"
              className="mt-3 text-gray-300 border-gray-600 hover:bg-gray-600"
            >
              Изменить цель
            </Button>
          </div>
        )}
      </Card>

      {/* Одно окно для ответов */}
      <div>
        {!currentAdvice && !loadingType ? (
          <Card className="p-6 text-center text-gray-400 bg-gray-800 border-gray-700">
            <p>Выберите один из вариантов выше, чтобы получить рекомендации от FinAI</p>
          </Card>
        ) : (
          <Card className="p-6 bg-gray-800 border-gray-700">
            {loadingType && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bank-blue mx-auto mb-4"></div>
                <p className="text-gray-400">Анализирую ваши финансы...</p>
              </div>
            )}
            {currentAdvice && !loadingType && (
              <>
                <h3 className="text-lg font-semibold mb-4 text-white">
                  {getTitle(currentAdvice.type)}
                </h3>
                <div className="prose prose-sm max-w-none">
                  <div
                    className="text-gray-200 leading-relaxed"
                    style={{ fontWeight: 400 }}
                    dangerouslySetInnerHTML={{
                      __html: formatContent(currentAdvice.content)
                    }}
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-400">
                    💼 Ответ от FinAI • {currentAdvice.timestamp ? new Date(currentAdvice.timestamp).toLocaleString('ru-RU') : ''}
                  </p>
                </div>
              </>
            )}
          </Card>
        )}
      </div>

      {/* Информационный блок */}
      <Card className="p-6 bg-gray-800 border-gray-700">
        <h3 className="font-semibold mb-2 text-white">
          ℹ️ О финансовом ассистенте
        </h3>
        <p className="text-sm text-gray-300">
          Этот ассистент использует <strong>искусственный интеллект</strong> для анализа ваших финансов
          и предоставления практических рекомендаций по финансовой грамотности. Все данные обрабатываются 
          конфиденциально и не передаются третьим лицам.
        </p>
      </Card>
    </div>
  );
}