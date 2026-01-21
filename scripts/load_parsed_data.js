#!/usr/bin/env node
/**
 * Загружает распарсенные данные из out_parsed.json в базу данных
 * Автоматически очищает старые транзакции и обновляет счет
 * 
 * Usage: node scripts/load_parsed_data.js [parsedFile]
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { categoryMapping } = require('./merchantMap');

const prisma = new PrismaClient();

// Маппинг кодов категорий из парсера в русские названия для БД
// Используем categoryMapping из merchantMap.js, но добавляем fallback
const categoryMap = {
  // Расходы
  'mobile': 'Сотовая связь',
  'taxi': 'Такси',
  'transport': 'Транспорт',
  'auto': 'Автомобиль',
  'groceries': 'Продукты',
  'cafe': 'Кафе и рестораны',
  'fastfood': 'Фастфуд',
  'delivery': 'Доставка еды',
  'shopping': 'Покупки',
  'clothing': 'Одежда',
  'health': 'Здоровье',
  'beauty': 'Красота',
  'entertainment': 'Развлечения',
  'subscriptions': 'Подписки',
  'utilities': 'ЖКХ',
  'education': 'Образование',
  'travel': 'Путешествия',
  'transfer_out': 'Переводы людям',
  
  // Доходы
  'salary': 'Зарплата',
  'transfer_in': 'Переводы от людей',
  'cashback': 'Кэшбэк',
  'refund': 'Возврат',
  'interest': 'Проценты',
  
  // Legacy категории (для совместимости со старыми данными)
  'transfer': 'Переводы людям',
  'food': 'Кафе и рестораны',
  'food_restaurants': 'Кафе и рестораны',
  'fast_food': 'Фастфуд',
  'pharmacy': 'Здоровье',
  'dental': 'Здоровье',
  'fuel': 'Автомобиль',
  'auto_wash': 'Автомобиль',
  'auto_service': 'Автомобиль',
  'gaming': 'Развлечения',
  'alcohol': 'Кафе и рестораны',
  'income': 'Зарплата',
  
  // Прочее
  'other': 'Прочее',
};

// Все категории которые должны быть в БД
const allCategoryNames = {
  expense: [
    'Сотовая связь',
    'Такси',
    'Транспорт',
    'Автомобиль',
    'Продукты',
    'Кафе и рестораны',
    'Фастфуд',
    'Доставка еды',
    'Покупки',
    'Одежда',
    'Здоровье',
    'Красота',
    'Развлечения',
    'Подписки',
    'ЖКХ',
    'Образование',
    'Путешествия',
    'Переводы людям',
    'Прочее',
  ],
  income: [
    'Зарплата',
    'Переводы от людей',
    'Кэшбэк',
    'Возврат',
    'Проценты',
    'Прочие доходы',
  ],
};

// Иконки и цвета для категорий
const categoryStyles = {
  'Сотовая связь': { icon: '📱', color: '#6366f1' },
  'Такси': { icon: '🚕', color: '#f59e0b' },
  'Транспорт': { icon: '🚌', color: '#f97316' },
  'Автомобиль': { icon: '🚗', color: '#64748b' },
  'Продукты': { icon: '🛒', color: '#22c55e' },
  'Кафе и рестораны': { icon: '🍽️', color: '#ec4899' },
  'Фастфуд': { icon: '🍔', color: '#f43f5e' },
  'Доставка еды': { icon: '🛵', color: '#f97316' },
  'Покупки': { icon: '🛍️', color: '#8b5cf6' },
  'Одежда': { icon: '👕', color: '#a855f7' },
  'Здоровье': { icon: '💊', color: '#10b981' },
  'Красота': { icon: '💅', color: '#ec4899' },
  'Развлечения': { icon: '🎬', color: '#8b5cf6' },
  'Подписки': { icon: '📺', color: '#6366f1' },
  'ЖКХ': { icon: '🏠', color: '#0ea5e9' },
  'Образование': { icon: '📚', color: '#3b82f6' },
  'Путешествия': { icon: '✈️', color: '#0ea5e9' },
  'Переводы людям': { icon: '💸', color: '#64748b' },
  'Прочее': { icon: '📦', color: '#94a3b8' },
  'Зарплата': { icon: '💰', color: '#22c55e' },
  'Переводы от людей': { icon: '💵', color: '#10b981' },
  'Кэшбэк': { icon: '🎁', color: '#f59e0b' },
  'Возврат': { icon: '↩️', color: '#0ea5e9' },
  'Проценты': { icon: '📈', color: '#22c55e' },
  'Прочие доходы': { icon: '💎', color: '#a855f7' },
};

async function loadParsedData() {
  const argv = process.argv.slice(2);
  const parsedFile = argv[0] || path.resolve(__dirname, 'out_parsed.json');

  console.log('📂 Загрузка данных из:', parsedFile);

  if (!fs.existsSync(parsedFile)) {
    console.error('❌ Файл не найден:', parsedFile);
    console.error('💡 Сначала запустите: npm run parse');
    process.exit(1);
  }

  const content = fs.readFileSync(parsedFile, 'utf8');
  const data = JSON.parse(content);

  if (!data.transactions || !Array.isArray(data.transactions)) {
    console.error('❌ Неверный формат файла. Ожидается объект с полем transactions');
    process.exit(1);
  }

  console.log(`📊 Найдено транзакций: ${data.transactions.length}`);
  console.log(`💰 Баланс на конец периода: ${data.summary?.endBalance || 0} ${data.summary?.currency || 'RUB'}`);

  // Находим или создаем demo пользователя
  const demoEmail = 'demo@finai.local';
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: demoEmail },
        { cardNumber: '1111222233334444' }
      ]
    }
  });

  if (!user) {
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('password123', 10);
    user = await prisma.user.create({
      data: {
        email: demoEmail,
        cardNumber: '1111222233334444',
        passwordHash,
        name: data.summary?.accountHolder || 'Демо Пользователь',
      },
    });
    console.log(`✅ Создан пользователь: ${user.email}`);
  } else {
    console.log(`✅ Найден пользователь: ${user.email}`);
  }

  // Находим или создаем основной счет
  let account = await prisma.account.findFirst({
    where: {
      userId: user.id,
      OR: [
        { name: 'Основной счет' },
        { type: 'checking' }
      ]
    },
    orderBy: { createdAt: 'asc' },
  });

  if (!account) {
    account = await prisma.account.create({
      data: {
        userId: user.id,
        name: 'Основной счет',
        balance: data.summary?.endBalance || 0,
        currency: data.summary?.currency || 'RUB',
        type: 'checking',
      },
    });
    console.log(`✅ Создан счет: ${account.name}`);
  } else {
    if (account.name !== 'Основной счет') {
      await prisma.account.update({
        where: { id: account.id },
        data: { name: 'Основной счет' },
      });
    }
    console.log(`✅ Найден счет: ${account.name}`);
  }

  // ОЧИСТКА: Удаляем ВСЕ транзакции пользователя
  console.log('🧹 Очистка старых транзакций...');
  const deletedCount = await prisma.transaction.deleteMany({
    where: { userId: user.id },
  });
  console.log(`✅ Удалено старых транзакций: ${deletedCount.count}`);
  
  // Удаляем накопительные счета (savings)
  console.log('🧹 Удаление накопительных счетов...');
  const deletedAccounts = await prisma.account.deleteMany({
    where: {
      userId: user.id,
      type: 'savings',
    },
  });
  console.log(`✅ Удалено накопительных счетов: ${deletedAccounts.count}`);

  // Создаем или обновляем категории
  console.log('📁 Подготовка категорий...');
  
  const categories = {};
  
  // Создаем категории расходов
  for (const catName of allCategoryNames.expense) {
    let cat = await prisma.category.findFirst({
      where: { name: catName },
    });
    
    const style = categoryStyles[catName] || { icon: '📦', color: '#94a3b8' };
    
    if (!cat) {
      cat = await prisma.category.create({
        data: { 
          name: catName, 
          type: 'expense',
          icon: style.icon,
          color: style.color,
        },
      });
    } else {
      // Обновляем иконку и цвет если нужно
      await prisma.category.update({
        where: { id: cat.id },
        data: {
          icon: style.icon,
          color: style.color,
        },
      });
    }
    categories[catName] = cat.id;
  }
  
  // Создаем категории доходов
  for (const catName of allCategoryNames.income) {
    let cat = await prisma.category.findFirst({
      where: { name: catName },
    });
    
    const style = categoryStyles[catName] || { icon: '💎', color: '#22c55e' };
    
    if (!cat) {
      cat = await prisma.category.create({
        data: { 
          name: catName, 
          type: 'income',
          icon: style.icon,
          color: style.color,
        },
      });
    } else {
      await prisma.category.update({
        where: { id: cat.id },
        data: {
          icon: style.icon,
          color: style.color,
        },
      });
    }
    categories[catName] = cat.id;
  }
  
  console.log(`✅ Категории готовы: ${Object.keys(categories).length}`);

  // Загружаем транзакции
  console.log('📥 Загрузка транзакций в базу данных...');
  let created = 0;
  let skipped = 0;
  
  // Статистика по категориям
  const categoryStats = {};

  for (let i = 0; i < data.transactions.length; i++) {
    const tx = data.transactions[i];
    
    try {
      // Получаем код категории из парсера
      const categoryCode = tx.category || 'other';
      
      // Преобразуем код в русское название
      let categoryName = categoryMap[categoryCode] || tx.categoryName || 'Прочее';
      
      // Определяем тип транзакции
      const isIncome = tx.type === 'income' || tx.amount > 0;
      
      // Корректируем категорию для доходов
      if (isIncome) {
        if (categoryCode === 'transfer_in' || categoryCode === 'transfer') {
          categoryName = 'Переводы от людей';
        } else if (categoryCode === 'salary' || categoryCode === 'income') {
          categoryName = 'Зарплата';
        } else if (categoryCode === 'cashback') {
          categoryName = 'Кэшбэк';
        } else if (categoryCode === 'refund') {
          categoryName = 'Возврат';
        } else if (categoryCode === 'interest') {
          categoryName = 'Проценты';
        } else if (!categories[categoryName]) {
          categoryName = 'Прочие доходы';
        }
      } else {
        // Для расходов - если категория не найдена, используем "Прочее"
        if (!categories[categoryName]) {
          categoryName = 'Прочее';
        }
      }

      const categoryId = categories[categoryName];
      
      if (!categoryId) {
        console.error(`   ⚠️ Категория не найдена: ${categoryName} (код: ${categoryCode})`);
        categoryName = isIncome ? 'Прочие доходы' : 'Прочее';
      }

      const txDate = tx.operationDate ? new Date(tx.operationDate) : new Date();
      const amount = Number(tx.amount || 0);
      const type = isIncome ? 'income' : 'expense';
      
      // Описание уже должно быть замаскировано в parse_transactions.js
      let description = (tx.description || '').slice(0, 255);
      
      // Дополнительная маскировка ФИО на случай если парсер не обработал
      const sbpPattern = /(Переводы через СБП\.\s*\.*\s*)([А-ЯЁ][А-ЯЁа-яё\s]+)/i;
      const match = description.match(sbpPattern);
      if (match) {
        const prefix = match[1];
        const fullName = match[2].trim();
        const nameParts = fullName.split(/\s+/).filter(p => p.length > 0);
        if (nameParts.length >= 2) {
          const surname = nameParts[0];
          const firstNameInitial = nameParts[1].charAt(0).toUpperCase();
          const maskedName = `${surname} ${firstNameInitial}.`;
          description = description.replace(sbpPattern, `${prefix}${maskedName}`);
        }
      }

      await prisma.transaction.create({
        data: {
          accountId: account.id,
          userId: user.id,
          amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
          type: type,
          categoryId: categories[categoryName] || categories['Прочее'],
          description: description,
          date: txDate,
        },
      });
      created++;
      
      // Статистика
      categoryStats[categoryName] = (categoryStats[categoryName] || 0) + 1;

      if ((i + 1) % 100 === 0) {
        console.log(`   Загружено: ${i + 1}/${data.transactions.length}`);
      }
    } catch (err) {
      skipped++;
      if (skipped <= 5) {
        console.error(`   ❌ Ошибка на транзакции ${i + 1}:`, err.message);
      }
    }
  }

  // Обновляем баланс счета
  if (data.summary?.endBalance !== undefined) {
    await prisma.account.update({
      where: { id: account.id },
      data: { balance: data.summary.endBalance },
    });
    console.log(`✅ Баланс счета обновлен: ${data.summary.endBalance} ${data.summary.currency || 'RUB'}`);
  }

  console.log('\n✅ Готово!');
  console.log(`   ✓ Создано транзакций: ${created}`);
  console.log(`   ✗ Пропущено: ${skipped}`);
  console.log(`   💰 Баланс счета: ${data.summary?.endBalance || account.balance} RUB`);
  
  // Показываем статистику по категориям
  console.log('\n📊 Транзакции по категориям:');
  Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });
  
  console.log('\n💡 Перезапустите приложение, чтобы увидеть обновленные данные!');

  await prisma.$disconnect();
}

loadParsedData().catch((err) => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});