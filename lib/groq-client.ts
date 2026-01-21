/**
 * Groq AI Integration Service
 * 
 * Используется для анализа финансовых данных и предоставления рекомендаций
 * через Groq API (OpenAI-совместимый)
 */

interface GroqConfig {
  apiKey: string;
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

class GroqClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: GroqConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.groq.com/openai/v1';
    this.model = config.model || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
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
    return this.callGroqAPI(prompt);
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

    const prompt = `Ты - финансовый консультант, который помогает людям развивать финансовую грамотность и экономить деньги.

Общие расходы за анализируемый период: ${Math.abs(budget).toFixed(2)} ₽

Расходы по категориям:
${expenseText}

ВАЖНО - Инструкции к ответу:
1. ФОКУС НА ФИНАНСОВОЙ ГРАМОТНОСТИ: Объясняй не только ЧТО делать, но и ПОЧЕМУ это важно. Включай краткие уроки о принципах экономии.
2. КОНКРЕТНЫЕ СОВЕТЫ: Дай 5-7 практических рекомендаций с конкретными примерами из категорий расходов пользователя.
3. ИЗБЕГАЙ: Не упоминай переводы между людьми, имена получателей, личные отношения. Фокусируйся на категориях расходов и паттернах поведения.
4. ИЗМЕРИМЫЕ РЕЗУЛЬТАТЫ: Для каждой рекомендации укажи потенциальную экономию в рублях в месяц.
5. ПРОСТЫЕ ДЕЙСТВИЯ: Каждая рекомендация должна иметь конкретный первый шаг, который можно сделать прямо сейчас.
6. ОБУЧЕНИЕ: Включай краткие объяснения финансовых принципов (например, "правило 50/30/20", важность резервного фонда).
7. ИСПОЛЬЗУЙ РУССКИЕ НАЗВАНИЯ КАТЕГОРИЙ: Все категории должны быть на русском языке.

Формат ответа:
- Краткий анализ текущей ситуации (2-3 предложения)
- Список рекомендаций с обоснованием и потенциальной экономией
- Краткий урок финансовой грамотности (1-2 абзаца)

Напиши на русском языке, используй дружелюбный и обучающий тон.`;

    return this.callGroqAPI(prompt);
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

    const prompt = `Ты - финансовый аналитик. На основе расходов пользователя за прошлый период, спрогнозируй расходы на следующие ${months} месяца.

История расходов по категориям:
${dataText}

Дай прогноз на русском языке с указанием:
1. Ожидаемых расходов по категориям (используй русские названия категорий)
2. Трендов (растут/падают/стабильны)
3. Рисков и возможностей экономии
4. Рекомендаций по планированию бюджета
5. Советов по созданию финансовой подушки безопасности

Будь конкретен, используй цифры в рублях. Все категории называй на русском языке.`;

    return this.callGroqAPI(prompt);
  }

  /**
   * Дает инвестиционные рекомендации
   */
  async getInvestmentAdvice(
    availableMoney: number,
    savingsRate: number,
    riskTolerance: 'low' | 'medium' | 'high'
  ): Promise<string> {
    const riskTranslation = {
      'low': 'низкая (консервативный инвестор)',
      'medium': 'средняя (умеренный инвестор)',
      'high': 'высокая (агрессивный инвестор)',
    };
    
    const prompt = `Ты - финансовый консультант по инвестициям. Помоги пользователю разобраться, как приумножить деньги.

Исходные данные:
- Доступно для инвестирования: ${availableMoney.toFixed(2)} ₽
- Ежемесячно может откладывать: ${savingsRate.toFixed(2)} ₽
- Готовность к риску: ${riskTranslation[riskTolerance]}

Дай конкретные рекомендации на русском языке:

1. ФИНАНСОВАЯ ПОДУШКА: Объясни важность резервного фонда (3-6 месячных расходов) перед началом инвестирования.

2. ИНСТРУМЕНТЫ ДЛЯ НАЧИНАЮЩИХ: Перечисли подходящие инструменты для данного уровня риска:
   - Для низкого риска: банковские вклады, ОФЗ, накопительные счета
   - Для среднего риска: облигации, ETF на индексы, ПИФы
   - Для высокого риска: акции, криптовалюты (с оговорками о рисках)

3. КОНКРЕТНЫЙ ПЛАН: Предложи распределение средств по инструментам с указанием процентов и сумм.

4. РЕГУЛЯРНЫЕ ИНВЕСТИЦИИ: Объясни стратегию усреднения (DCA) и как использовать ежемесячные сбережения.

5. НАЛОГИ И ИИС: Расскажи про индивидуальный инвестиционный счёт и налоговые вычеты.

6. ПРЕДУПРЕЖДЕНИЯ: Укажи на типичные ошибки начинающих инвесторов.

Ответ должен быть практичным, с конкретными цифрами в рублях.`;

    return this.callGroqAPI(prompt);
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
    return this.callGroqAPI(prompt);
  }

  private buildFinancialAnalysisPrompt(
    request: FinancialAnalysisRequest
  ): string {
    const topCategories = request.topExpenseCategories
      .map(c => `${c.category}: ${Math.abs(c.amount).toFixed(2)} ₽ (${c.percentage.toFixed(1)}%)`)
      .join('\n');

    // Include merchants if available
    const merchantsText = (request as any).topMerchants 
      ? (request as any).topMerchants.map((m:any) => `${m.merchant}: ${Math.abs(m.amount).toFixed(2)} ₽`).join('\n') 
      : '';

    return `Ты - финансовый консультант, который помогает людям развивать финансовую грамотность. Проанализируй финансовые данные и дай практические советы для улучшения финансового здоровья.

Период анализа: ${request.transactionSummary.period.start} - ${request.transactionSummary.period.end}
Общий доход: ${request.transactionSummary.totalIncome.toFixed(2)} ₽
Общие расходы: ${Math.abs(request.transactionSummary.totalExpenses).toFixed(2)} ₽
Чистый баланс: ${request.transactionSummary.netBalance.toFixed(2)} ₽

Основные расходы по категориям:
${topCategories}

${merchantsText ? `Топ продавцов по расходам:\n${merchantsText}` : ''}

ВАЖНО - Инструкции к ответу:
1. ФОКУС НА ФИНАНСОВОЙ ГРАМОТНОСТИ: Объясняй не только ЧТО делать, но и ПОЧЕМУ это важно для финансового здоровья.
2. КОНКРЕТНЫЕ СОВЕТЫ: Давай 5-7 практических рекомендаций с конкретными примерами из данных пользователя.
3. ОБУЧЕНИЕ: Включай краткие объяснения финансовых принципов (например, "правило 50/30/20", важность резервного фонда, эффект сложных процентов).
4. ИЗБЕГАЙ: Не упоминай переводы между людьми, имена получателей, личные отношения. Фокусируйся на категориях расходов и паттернах поведения.
5. ИЗМЕРИМЫЕ РЕЗУЛЬТАТЫ: Для каждой рекомендации укажи потенциальную экономию в рублях в месяц.
6. ПРОСТЫЕ ДЕЙСТВИЯ: Каждая рекомендация должна иметь конкретный первый шаг, который можно сделать прямо сейчас.
7. ИСПОЛЬЗУЙ РУССКИЕ НАЗВАНИЯ: Все категории, термины и рекомендации должны быть на русском языке.

Формат ответа:
- Краткий вывод о финансовом состоянии (2-3 предложения)
- Список рекомендаций с обоснованием и потенциальной экономией
- Краткий урок финансовой грамотности (1-2 абзаца)

Напиши на русском языке, используй дружелюбный и обучающий тон.`;
  }

  private buildSpendingAnalysisPrompt(
    request: FinancialAnalysisRequest
  ): string {
    const recentTransactionsText = request.recentTransactions
      .slice(0, 40)
      .map(t => `${t.date}: ${t.description} (${t.category}) - ${Math.abs(t.amount)} ₽`)
      .join('\n');

    return `Проанализируй последние транзакции и выдели конкретные паттерны поведения:

${recentTransactionsText}

Прошу дать на русском языке:
1) 3–5 повторяющихся паттернов (например: частые заправки, ежедневные доставки еды, регулярные мелкие платежи),
2) Для каждого паттерна — почему это важно (финансовое влияние) и 1–2 практических шага, чтобы сократить расходы или улучшить привычку,
3) Предложения, какие транзакции стоит проверить вручную (подписки, автоплатежи), и как это сделать.

Формат ответа: короткие пункты с ссылкой на категорию/мерчант и примерной оценкой экономии в рублях.
Все категории называй на русском языке.`;
  }

  private async callGroqAPI(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'Ты - финансовый советник и аналитик. Помогай пользователю управлять его деньгами, предоставляя практические советы и анализ. ВСЕГДА отвечай на русском языке. Используй русские названия категорий расходов (Покупки, Еда, Транспорт, Развлечения и т.д.). Никогда не используй английские термины для категорий.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        let bodyText = await response.text();
        try {
          const json = JSON.parse(bodyText);
          const errCode = json?.error?.code || json?.code;
          const errMsg = json?.error?.message || json?.message || bodyText;
          if (errCode === 'model_decommissioned') {
            throw new Error(
              `Groq API error: model_decommissioned - ${errMsg}.\nPlease set a supported model in your .env: GROQ_MODEL=<model_name>. See https://console.groq.com/docs/deprecations`
            );
          }
          throw new Error(`Groq API error: ${response.status} - ${errMsg}`);
        } catch (e) {
          throw new Error(`Groq API error: ${response.status} - ${bodyText}`);
        }
      }

      const data = (await response.json()) as GroqResponse;

      if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content;
      }

      throw new Error('No response content from Groq API');
    } catch (error) {
      console.error('Error calling Groq API:', error);
      throw error;
    }
  }
}

export { GroqClient };
export type { GroqConfig, FinancialAnalysisRequest, GroqResponse };