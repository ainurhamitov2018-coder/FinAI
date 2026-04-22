/**
 * AI Integration Service (GigaChat)
 * 
 * Используется для анализа финансовых данных и предоставления рекомендаций
 * через GigaChat API
 */

import axios from 'axios';

interface GigaChatConfig {
  authKey?: string;
  baseUrl?: string;
  model?: string;
}

interface FinancialAnalysisRequest {
  transactionSummary: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    currency: string;
    period: {
      start: string;
      end: string;
    };
  };
  topExpenseCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  recentTransactions: Array<{
    date: string;
    description: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
  }>;
}

interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Маппинг английских категорий на русские
const categoryTranslations: Record<string, string> = {
  'shopping': 'Покупки',
  'food': 'Еда и продукты',
  'transport': 'Транспорт',
  'transfer': 'Переводы',
  'entertainment': 'Развлечения',
  'utilities': 'Коммунальные услуги',
  'health': 'Здоровье',
  'education': 'Образование',
  'travel': 'Путешествия',
  'auto': 'Автомобиль',
  'clothing': 'Одежда',
  'beauty': 'Красота и уход',
  'sports': 'Спорт',
  'gifts': 'Подарки',
  'subscriptions': 'Подписки',
  'communication': 'Связь',
  'other': 'Прочее',
  'income': 'Доход',
  'salary': 'Зарплата',
  'cashback': 'Кэшбэк',
  'refund': 'Возврат',
  'groceries': 'Продукты',
  'transfer_out': 'Переводы',
  'transfer_in': 'Переводы',
  'taxi': 'Такси',
  'transportation': 'Транспорт',
  'food_delivery': 'Доставка еды',
};

function translateCategory(category: string): string {
  const lower = category.toLowerCase();
  return categoryTranslations[lower] || category;
}

function translateCategories(
  categories: Array<{ category: string; amount: number; percentage: number }>
): Array<{ category: string; amount: number; percentage: number }> {
  return categories.map(c => ({
    ...c,
    category: translateCategory(c.category),
  }));
}

class GigaChatClient {
  private authKey: string;
  private baseUrl: string;
  private model: string;
  private accessToken: string | null = null;
  private expiresAt: number = 0;

  constructor(config: GigaChatConfig) {
    this.authKey = config.authKey || '';
    this.baseUrl = config.baseUrl || 'https://gigachat.devices.sberbank.ru/api/v1';
    this.model = config.model || 'GigaChat-Max';
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.expiresAt - 60000) { // 1 min buffer
      return this.accessToken;
    }

    const rqUID = 'f1d27f13-af6b-432a-abee-43e8ebf5da98'; // Use fixed UUID for simplicity
    const response = await axios.post('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', 'scope=GIGACHAT_API_PERS', {
      headers: {
        'Authorization': `Basic ${this.authKey}`,
        'RqUID': rqUID,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
      proxy: false
    });

    this.accessToken = response.data.access_token;
    this.expiresAt = response.data.expires_at;
    return this.accessToken!;
  }

  /**
   * Анализирует финансовые данные и предоставляет рекомендации
   */
  async analyzeFinancialData(
    request: FinancialAnalysisRequest
  ): Promise<string> {
    // Переводим категории на русский
    const translatedRequest = {
      ...request,
      topExpenseCategories: translateCategories(request.topExpenseCategories),
      recentTransactions: request.recentTransactions.map(t => ({
        ...t,
        category: translateCategory(t.category),
      })),
    };
    
    const prompt = this.buildFinancialAnalysisPrompt(translatedRequest);
    return this.callGigaChatAPI(prompt);
  }

  /**
   * Даёт советы по сбережению денег
   */
  async getSavingsTips(
    expenses: FinancialAnalysisRequest['topExpenseCategories'],
    budget: number
  ): Promise<string> {
    // Переводим категории на русский
    const translatedExpenses = translateCategories(expenses);
    
    const expenseText = translatedExpenses
      .map(e => `${e.category}: ${Math.abs(e.amount).toFixed(2)} ₽ (${e.percentage.toFixed(1)}%)`)
      .join('\n');

    const prompt = `Ты — финансовый консультант по экономии бюджета. Ответь только на русском.
Используй только данные об этих расходах и не добавляй ничего лишнего.

Расходы:
${expenseText}

Задача:
1. Найди 3-4 категории с наибольшим потенциалом экономии.
2. Для каждой категории укажи:
   - Текущую трата
   - Конкретное изменение
   - Потенциальную экономию в месяц, руб.
3. Если можно, сравни альтернативы: такси → общественный транспорт, доставка еды → готовка дома, подписка → отказ/дешёвая замена.

Формат ответа:
1) Категория: ...
   - Текущая трата: ...
   - Совет: ...
   - Экономия: ...
2) ...

Ни слова на английском. Не повторяй текст задачи.`;

    return this.callGigaChatAPI(prompt);
  }

  /**
   * Прогнозирует будущие расходы на основе истории
   */
  async forecastExpenses(
    historicalData: FinancialAnalysisRequest['topExpenseCategories'],
    months: number = 3
  ): Promise<string> {
    // Переводим категории на русский
    const translatedData = translateCategories(historicalData);
    
    const dataText = translatedData
      .map(e => `${e.category}: ${Math.abs(e.amount).toFixed(2)} ₽`)
      .join('\n');

    const prompt = `Ты — финансовый аналитик. Ответь только на русском.
Используй только эту информацию и не добавляй новые даты.

Расходы по категориям:
${dataText}

Задача:
1. Спрогнозируй расходы на следующие ${months} месяца по каждой категории.
2. Для каждой категории поясни, почему прогноз меняется: сезонность, праздники, погодные условия, события или личные расходы (например 8 марта, 14 февраля, день рождения, осенние дожди и т.п.).
3. Укажи тренд: ↑ растет, ↓ падает, → стабильно.
4. Назови 1-2 категории с самым большим ростом расходов.
5. Дай один короткий совет для контроля бюджета.

Формат ответа:
- Категория: прогноз/тренд + причина
- Совет: ...

Ни слова на английском.`;

    return this.callGigaChatAPI(prompt);
  }

  /**
   * Дает инвестиционные рекомендации
   */
  async getInvestmentAdvice(
    availableMoney: number,
    savingsRate: number,
    riskTolerance: 'low' | 'medium' | 'high'
  ): Promise<string> {
    const riskMap = {
      'low': 'Низкий (банки, вклады)',
      'medium': 'Средний (облигации, ETF)',
      'high': 'Высокий (акции)',
    };
    
    const prompt = `Ты — инвестиционный консультант. Ответь только на русском. Используй только эти данные и не добавляй ничего лишнего.

Доступно: ${availableMoney.toFixed(2)} ₽
Можно откладывать: ${savingsRate.toFixed(2)} ₽ в месяц
Риск: ${riskMap[riskTolerance]}

Задача:
1. Назови сумму для резервного фонда (3-6 месяцев расходов).
2. Предложи распределение средств по инструментам в % и рублях — без использования таблиц markdown. Используй список с дефисом, указав каждый инструмент на отдельной строке с процентом и суммой.
3. Дай 2-3 конкретных инвестиционных варианта.
4. Укажи первый конкретный шаг.
5. Обязательно включи дисклеймер: «Это не является индивидуальной инвестиционной рекомендацией.»

Формат:
- Резервный фонд: ...
- План распределения:
  - Инструмент 1: XX% (YYY₽)
  - Инструмент 2: XX% (YYY₽)
  - Инструмент 3: XX% (YYY₽)
- Конкретные варианты: ...
- Первый шаг: ...
- Дисклеймер: ...

Ни слова на английском. Используй только рубли (₽), без долларов.`;

    return this.callGigaChatAPI(prompt);
  }

  /**
   * Анализирует особенности расходов и выявляет проблемы
   */
  async analyzeSpendingPatterns(
    request: FinancialAnalysisRequest
  ): Promise<string> {
    const translatedRequest = {
      ...request,
      topExpenseCategories: translateCategories(request.topExpenseCategories),
      recentTransactions: request.recentTransactions.map(t => ({
        ...t,
        category: translateCategory(t.category),
      })),
    };
    
    const prompt = this.buildSpendingAnalysisPrompt(translatedRequest);
    return this.callGigaChatAPI(prompt);
  }

  private buildFinancialAnalysisPrompt(
    request: FinancialAnalysisRequest
  ): string {
    const topCategories = request.topExpenseCategories
      .slice(0, 5)
      .map(c => `${c.category}: ${Math.abs(c.amount).toFixed(2)} ₽ (${c.percentage.toFixed(1)}%)`)
      .join('\n');

    return `Ты — персональный финансовый консультант. У тебя есть история доходов, расходов и последние категории расходов за последний доступный период. Используй только эти данные и не делай выводов про неизвестные даты.

Период для анализа: ${request.transactionSummary.period.start} — ${request.transactionSummary.period.end}
Доход: ${request.transactionSummary.totalIncome.toFixed(2)} ₽
Расходы: ${Math.abs(request.transactionSummary.totalExpenses).toFixed(2)} ₽
Баланс: ${request.transactionSummary.netBalance.toFixed(2)} ₽

Топ расходов:
${topCategories}

Задача:
1. В начале ответа укажи, за какой период ты делаешь анализ.
2. Кратко оцени финансовое состояние (1-2 предложения).
3. Назови 3 основные проблемы с цифрами и % от дохода.
4. Дай 3 практических совета с расчётом экономии в рублях.
5. Укажи, на какой период времени ссылаешься в выводе.

Формат: Итог, Проблемы, Советы, Быстрый шаг.
Запрещено: не придумывать данные, не говорить про «сегодня» или «текущий месяц». Не используй символ доллара $ ни в каком виде. Все суммы указывай только в рублях с символом ₽. Ответь на русском.`;
  }

  private buildSpendingAnalysisPrompt(
    request: FinancialAnalysisRequest
  ): string {
    const recentTransactionsText = request.recentTransactions
      .slice(0, 20)
      .map(t => `${t.date.split('T')[0]}: ${t.description.substring(0, 40)} (${t.category}) - ${Math.abs(t.amount)} ₽`)
      .join('\n');

    return `Ты — финансовый аналитик. Ответь только на русском. Используй только эти транзакции и не добавляй ничего лишнего.

${recentTransactionsText}

Задача:
1. Найди 2-3 повторяющихся шаблона расходов.
2. Для каждого напиши: категория/мерчант, ориентировочная сумма, конкретный совет по сокращению.
3. Укажи одну категорию или подписку, которую стоит проверить вручную.

Формат ответа:
1) Паттерн: ...
   - Сумма: ...
   - Совет: ...
2) Проверить: ...

Ни слова на английском.`;
  }

  private async callGigaChatAPI(prompt: string): Promise<string> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 600,
        stream: false,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
        proxy: false
      });

      if (response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
        return response.data.choices[0].message.content;
      }

      throw new Error('No response content from GigaChat API');
    } catch (error: any) {
      console.error('Error calling GigaChat API:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
}

export { GigaChatClient };
export type { GigaChatConfig, FinancialAnalysisRequest, GroqResponse };