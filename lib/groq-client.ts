/**
 * Groq AI Integration Service
 * 
 * Используется для анализа финансовых данных и предоставления рекомендаций
 * через Groq API (OpenAI-совместимый)
 * 
 * Для ВКР: демонстрирует интеграцию с Groq API и обработку 
 * финансовых данных для прогнозирования и рекомендаций
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
    const prompt = this.buildFinancialAnalysisPrompt(request);
    return this.callGroqAPI(prompt);
  }

  /**
   * Даёт советы по сбережению денег
   */
  async getSavingsTips(
    expenses: FinancialAnalysisRequest['topExpenseCategories'],
    budget: number
  ): Promise<string> {
    const expenseText = expenses
      .map(e => `${e.category}: ${e.amount.toFixed(2)} RUB (${e.percentage.toFixed(1)}%)`)
      .join('\n');

    const prompt = `Проанализируй мои расходы и дай конкретные, практические советы по экономии:

Мой бюджет: ${budget} RUB
Расходы по категориям:
${expenseText}

Дай 5-7 конкретных советов на русском языке с примерами и расчётами, как я могу сократить расходы и накопить больше денег.`;

    return this.callGroqAPI(prompt);
  }

  /**
   * Прогнозирует будущие расходы на основе истории
   */
  async forecastExpenses(
    historicalData: FinancialAnalysisRequest['topExpenseCategories'],
    months: number = 3
  ): Promise<string> {
    const dataText = historicalData
      .map(e => `${e.category}: ${e.amount.toFixed(2)} RUB`)
      .join('\n');

    const prompt = `На основе моих расходов за последний период, спрогнозируй мои расходы на следующие ${months} месяца:

История расходов:
${dataText}

Дай прогноз с указанием:
1. Ожидаемых расходов по категориям
2. Трендов (растут/падают)
3. Рисков и возможностей экономии
4. Рекомендаций по планированию бюджета`;

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
    const prompt = `Как мне приумножить свои деньги? У меня есть:
- Доступно для инвестирования: ${availableMoney} RUB
- Ежемесячно могу отложить: ${savingsRate} RUB
- Готовность к риску: ${riskTolerance}

Дай конкретные рекомендации на русском языке о том, куда и как инвестировать эти деньги, учитывая мой уровень готовности к риску.`;

    return this.callGroqAPI(prompt);
  }

  /**
   * Анализирует особенности расходов и выявляет проблемы
   */
  async analyzeSpendingPatterns(
    request: FinancialAnalysisRequest
  ): Promise<string> {
    const prompt = this.buildSpendingAnalysisPrompt(request);
    return this.callGroqAPI(prompt);
  }

  private buildFinancialAnalysisPrompt(
    request: FinancialAnalysisRequest
  ): string {
    const topCategories = request.topExpenseCategories
      .map(c => `${c.category}: ${c.amount.toFixed(2)} RUB (${c.percentage.toFixed(1)}%)`)
      .join('\n');

    return `Проанализируй мои финансовые данные и дай детальный анализ:

Период: ${request.transactionSummary.period.start} - ${request.transactionSummary.period.end}
Общий доход: ${request.transactionSummary.totalIncome.toFixed(2)} ${request.transactionSummary.currency}
Общие расходы: ${request.transactionSummary.totalExpenses.toFixed(2)} ${request.transactionSummary.currency}
Чистый баланс: ${request.transactionSummary.netBalance.toFixed(2)} ${request.transactionSummary.currency}

Основные расходы:
${topCategories}

Пожалуйста, дай:
1. Анализ моего финансового состояния
2. Определение основных направлений расходов
3. Оценку здоровости моего финансового положения
4. Конкретные рекомендации по улучшению`;
  }

  private buildSpendingAnalysisPrompt(
    request: FinancialAnalysisRequest
  ): string {
    const recentTransactionsText = request.recentTransactions
      .slice(0, 20)
      .map(t => `${t.date}: ${t.description} (${t.category}) - ${t.amount} RUB`)
      .join('\n');

    return `Проанализируй мои недавние расходы и выяви паттерны:

${recentTransactionsText}

Определи:
1. Необычные или чрезмерные расходы
2. Повторяющиеся паттерны расходов
3. Возможности для оптимизации
4. Риски финансовой нестабильности`;
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
              content: 'Ты - финансовый советник и аналитик. Помогай пользователю управлять его деньгами, предоставляя практические советы и анализ на русском языке.',
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

