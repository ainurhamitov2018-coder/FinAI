/**
 * Утилиты для форматирования данных
 */

/**
 * Форматирует число как валюту
 */
export function formatCurrency(amount: number, currency: string = "RUB"): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Форматирует дату
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Форматирует дату и время
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Получает цвет для категории
 */
export function getCategoryColor(categoryId: string): string {
  const colors = [
    "#ef4444", "#f59e0b", "#8b5cf6", "#10b981",
    "#3b82f6", "#22c55e", "#ec4899", "#06b6d4",
  ];
  const index = parseInt(categoryId) % colors.length;
  return colors[index];
}

/**
 * Группирует транзакции по категории, возвращает массив { category, amount, count }
 */
export function groupTransactionsByCategory(transactions: any[]) {
  const map: Record<string, { amount: number; count: number }> = {};
  for (const t of transactions) {
    const key = String(t.category || t.categoryId || 'Прочие');
    if (!map[key]) map[key] = { amount: 0, count: 0 };
    map[key].amount += t.type === 'expense' ? Number(t.amount || 0) : 0;
    map[key].count += 1;
  }
  return Object.entries(map).map(([category, v]) => ({ category, amount: v.amount, count: v.count }));
}

/**
 * Группирует транзакции по продавцу/магазину (merchant extracted in description)
 */
export function groupTransactionsByMerchant(transactions: any[]) {
  const map: Record<string, { amount: number; count: number }> = {};
  for (const t of transactions) {
    // Try to pull merchant from description (before '—' used in mock data)
    const desc: string = t.description || '';
    const merchant = desc.includes('—') ? desc.split('—')[0].trim() : desc.split(/по карте|\bпо\b/i)[0].trim();
    const key = merchant || 'Unknown';
    if (!map[key]) map[key] = { amount: 0, count: 0 };
    map[key].amount += t.type === 'expense' ? Number(t.amount || 0) : 0;
    map[key].count += 1;
  }
  return Object.entries(map).map(([merchant, v]) => ({ merchant, amount: v.amount, count: v.count }));
}

/**
 * Скрывает полное ФИО в описаниях транзакций, оставляя только "Фамилия И."
 * Используется для защиты персональных данных
 */
export function maskFullName(description: string): string {
  if (!description) return description;
  
  // Паттерн для "Переводы через СБП. ФАМИЛИЯ ИМЯ ОТЧЕСТВО" или "Переводы через СБП. Фамилия Имя Отчество"
  const sbpPattern = /(Переводы через СБП\.\s*\.*\s*)([А-ЯЁ][А-ЯЁ\s]+)/i;
  const match = description.match(sbpPattern);
  
  if (match) {
    const prefix = match[1];
    const fullName = match[2].trim();
    
    // Разбиваем ФИО на части
    const nameParts = fullName.split(/\s+/).filter(p => p.length > 0);
    
    if (nameParts.length >= 2) {
      // Берем фамилию (первая часть) и первую букву имени (вторая часть)
      const surname = nameParts[0];
      const firstNameInitial = nameParts[1].charAt(0).toUpperCase();
      
      // Заменяем полное ФИО на "Фамилия И."
      const maskedName = `${surname} ${firstNameInitial}.`;
      return description.replace(sbpPattern, `${prefix}${maskedName}`);
    }
  }
  
  // Если не нашли паттерн СБП, возвращаем как есть
  return description;
}











