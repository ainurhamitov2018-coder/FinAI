/**
 * Маппинг мерчантов и ключевых слов на категории
 * Используется в парсере транзакций для точной категоризации
 * 
 * Все категории на РУССКОМ языке
 */

const merchantMap = {
  // ===== СОТОВАЯ СВЯЗЬ =====
  'MEGAFON': 'mobile',
  'МЕГАФОН': 'mobile',
  'MTS': 'mobile',
  'МТС': 'mobile',
  'BEELINE': 'mobile',
  'БИЛАЙН': 'mobile',
  'TELE2': 'mobile',
  'ТЕЛЕ2': 'mobile',
  'YOTA': 'mobile',
  'ЙОТА': 'mobile',
  'ROSTELECOM': 'mobile',
  'РОСТЕЛЕКОМ': 'mobile',
  'СВЯЗЬ': 'mobile',
  'КОММЕРЧЕСКИХ ПРОВАЙДЕРОВ': 'mobile', // "Оплата услуг коммерческих провайдеров"

  // ===== ТАКСИ =====
  'YANDEX*TAXI': 'taxi',
  'ЯНДЕКС*ТАКСИ': 'taxi',
  'YANDEX*4121*UBER': 'taxi',
  'UBER': 'taxi',
  'GETT': 'taxi',
  'TAXIFY': 'taxi',
  'BOLT': 'taxi',
  'CITYMOBIL': 'taxi',
  'СИТИМОБИЛ': 'taxi',
  'МАКСИМ': 'taxi',
  'MAXIM': 'taxi',
  'ТАКСИ': 'taxi',
  'TAXI': 'taxi',

  // ===== ТРАНСПОРТ (метро, автобус, электрички) =====
  'KAZANMETRO': 'transport',
  'TRANSKART': 'transport',
  'ТРАНСКАРТ': 'transport',
  'METRO': 'transport',
  'МЕТРО': 'transport',
  'МЦК': 'transport',
  'МЦД': 'transport',
  'AEROEXPRESS': 'transport',
  'АЭРОЭКСПРЕСС': 'transport',
  'RZD': 'transport',
  'РЖД': 'transport',
  'TICKETS': 'transport',
  'ЭЛЕКТРИЧКА': 'transport',
  'АВТОБУС': 'transport',
  'ТРОЛЛЕЙБУС': 'transport',
  'ТРАМВАЙ': 'transport',
  'ТРОЙКА': 'transport',
  'ПОДОРОЖНИК': 'transport',

  // ===== АВТОМОБИЛЬ (топливо, мойка, сервис, парковка) =====
  'АЗС': 'auto',
  'GAZPROM': 'auto',
  'ГАЗПРОМ': 'auto',
  'ROSNEFT': 'auto',
  'РОСНЕФТЬ': 'auto',
  'LUKOIL': 'auto',
  'ЛУКОЙЛ': 'auto',
  'SHELL': 'auto',
  'ШЕЛЛ': 'auto',
  'BP ': 'auto',
  'BENZIN': 'auto',
  'БЕНЗИН': 'auto',
  'ТОПЛИВО': 'auto',
  'NEFTMAGISTRAL': 'auto',
  'TATNEFT': 'auto',
  'ТАТНЕФТЬ': 'auto',
  'ROBOMOJKA': 'auto',
  'МОЙКА': 'auto',
  'CARWASH': 'auto',
  'АВТОМОЙКА': 'auto',
  'PARKING': 'auto',
  'ПАРКОВКА': 'auto',
  'AVTOPRO': 'auto',
  'АВТОСЕРВИС': 'auto',
  'ШИНОМОНТАЖ': 'auto',
  'EXIST': 'auto',
  'AUTODOC': 'auto',

  // ===== ПРОДУКТЫ =====
  'PYATEROCHKA': 'groceries',
  'ПЯТЕРОЧКА': 'groceries',
  'MAGNIT': 'groceries',
  'МАГНИТ': 'groceries',
  'LENTA': 'groceries',
  'ЛЕНТА': 'groceries',
  'AUCHAN': 'groceries',
  'АШАН': 'groceries',
  'PEREKRESTOK': 'groceries',
  'ПЕРЕКРЕСТОК': 'groceries',
  'METRO CASH': 'groceries',
  'МЕТРО КЭШ': 'groceries',
  'BILLA': 'groceries',
  'БИЛЛА': 'groceries',
  'SPAR': 'groceries',
  'СПАР': 'groceries',
  'DIXY': 'groceries',
  'ДИКСИ': 'groceries',
  'VKUSVILL': 'groceries',
  'ВКУСВИЛЛ': 'groceries',
  'AZBUKA': 'groceries',
  'АЗБУКА ВКУСА': 'groceries',
  'PRODUKTY': 'groceries',
  'ПРОДУКТЫ': 'groceries',
  'GALAMART': 'groceries',
  'ГАЛАМАРТ': 'groceries',
  'OKEY': 'groceries',
  'ОКЕЙ': 'groceries',
  'GLOBUS': 'groceries',
  'ГЛОБУС': 'groceries',
  'MIRATORG': 'groceries',
  'МИРАТОРГ': 'groceries',
  'MYASNOV': 'groceries',

  // ===== КАФЕ И РЕСТОРАНЫ =====
  'DOMASHNYAYA': 'cafe',
  'STOLOVAYA': 'cafe',
  'СТОЛОВАЯ': 'cafe',
  'RESTORAN': 'cafe',
  'РЕСТОРАН': 'cafe',
  'CAFE': 'cafe',
  'КАФЕ': 'cafe',
  'COFFEE': 'cafe',
  'КОФЕ': 'cafe',
  'COFFEE LIKE': 'cafe',
  'STARBUCKS': 'cafe',
  'СТАРБАКС': 'cafe',
  'COFIX': 'cafe',
  'ШОКОЛАДНИЦА': 'cafe',
  'КОФЕМАНИЯ': 'cafe',
  'SURF COFFEE': 'cafe',
  
  // ===== ФАСТФУД =====
  'BURGER KING': 'fastfood',
  'БУРГЕР КИНГ': 'fastfood',
  'KFC': 'fastfood',
  'КФС': 'fastfood',
  'MCDONALD': 'fastfood',
  'МАКДОНАЛДС': 'fastfood',
  'ВКУСНО И ТОЧКА': 'fastfood',
  'SUBWAY': 'fastfood',
  'САБВЕЙ': 'fastfood',
  'PIZZA': 'fastfood',
  'ПИЦЦА': 'fastfood',
  'DODO': 'fastfood',
  'ДОДО': 'fastfood',
  'SUSHI': 'fastfood',
  'СУШИ': 'fastfood',
  'ТЕРЕМОК': 'fastfood',
  'KROSHKA': 'fastfood',
  'КРОШКА': 'fastfood',

  // ===== ДОСТАВКА ЕДЫ =====
  'DELIVERY CLUB': 'delivery',
  'ДЕЛИВЕРИ': 'delivery',
  'ЯНДЕКС.ЕДА': 'delivery',
  'YANDEX.EDA': 'delivery',
  'САМОКАТ': 'delivery',
  'SAMOKAT': 'delivery',
  'ЯНДЕКС.ЛАВКА': 'delivery',
  'LAVKA': 'delivery',
  'SBERMARKET': 'delivery',
  'СБЕРМАРКЕТ': 'delivery',

  // ===== ПОКУПКИ ОНЛАЙН =====
  'OZON': 'shopping',
  'ОЗОН': 'shopping',
  'WILDBERRIES': 'shopping',
  'ВАЙЛДБЕРРИЗ': 'shopping',
  'ALIEXPRESS': 'shopping',
  'АЛИЭКСПРЕСС': 'shopping',
  'AMAZON': 'shopping',
  'АМАЗОН': 'shopping',
  'LAMODA': 'shopping',
  'ЛАМОДА': 'shopping',
  'DNS': 'shopping',
  'ДНС': 'shopping',
  'MVIDEO': 'shopping',
  'М.ВИДЕО': 'shopping',
  'ELDORADO': 'shopping',
  'ЭЛЬДОРАДО': 'shopping',
  'CITILINK': 'shopping',
  'СИТИЛИНК': 'shopping',
  'SVYAZNOY': 'shopping',
  'СВЯЗНОЙ': 'shopping',
  'RE:STORE': 'shopping',
  'IKEA': 'shopping',
  'ИКЕА': 'shopping',
  'LEROY': 'shopping',
  'ЛЕРУА': 'shopping',
  'OBI': 'shopping',
  'ОБИ': 'shopping',
  'CASTORAMA': 'shopping',
  'КАСТОРАМА': 'shopping',
  'PORT M': 'shopping', // PORT M-307

  // ===== ОДЕЖДА =====
  'ZARA': 'clothing',
  'ЗАРА': 'clothing',
  'H&M': 'clothing',
  'UNIQLO': 'clothing',
  'ЮНИКЛО': 'clothing',
  'ADIDAS': 'clothing',
  'АДИДАС': 'clothing',
  'NIKE': 'clothing',
  'НАЙК': 'clothing',
  'PUMA': 'clothing',
  'ПУМА': 'clothing',
  'REEBOK': 'clothing',
  'РИБОК': 'clothing',
  'SPORTMASTER': 'clothing',
  'СПОРТМАСТЕР': 'clothing',
  'DECATHLON': 'clothing',
  'ДЕКАТЛОН': 'clothing',
  'RESERVED': 'clothing',
  'BERSHKA': 'clothing',
  'MASSIMO': 'clothing',
  'PULL&BEAR': 'clothing',
  'GLORIA JEANS': 'clothing',
  'ГЛОРИЯ ДЖИНС': 'clothing',
  'OSTIN': 'clothing',
  'ОСТИН': 'clothing',

  // ===== ЗДОРОВЬЕ И АПТЕКИ =====
  'APTEKA': 'health',
  'АПТЕКА': 'health',
  'PHARMACY': 'health',
  'RIGLA': 'health',
  'РИГЛА': 'health',
  'GORZDRAV': 'health',
  'ГОРЗДРАВ': 'health',
  '36.6': 'health',
  'VITA': 'health',
  'ВИТА': 'health',
  'FARMA': 'health',
  'ФАРМА': 'health',
  'ZDRAVCITY': 'health',
  'CLINIC': 'health',
  'КЛИНИКА': 'health',
  'DOKTOR': 'health',
  'ДОКТОР': 'health',
  'MEDIC': 'health',
  'МЕДИК': 'health',
  'HOSPITAL': 'health',
  'БОЛЬНИЦА': 'health',
  'DENTAL': 'health',
  'СТОМАТОЛОГ': 'health',
  'INVITRO': 'health',
  'ИНВИТРО': 'health',
  'GEMOTEST': 'health',
  'ГЕМОТЕСТ': 'health',

  // ===== КРАСОТА =====
  'SALON': 'beauty',
  'САЛОН': 'beauty',
  'BEAUTY': 'beauty',
  'БЬЮТИ': 'beauty',
  'BARBER': 'beauty',
  'БАРБЕР': 'beauty',
  'ПАРИКМАХЕР': 'beauty',
  'SPA': 'beauty',
  'СПА': 'beauty',
  'MASSAGE': 'beauty',
  'МАССАЖ': 'beauty',
  'NAIL': 'beauty',
  'МАНИКЮР': 'beauty',
  'КОСМЕТИК': 'beauty',
  'ЛЕТУАЛЬ': 'beauty',
  'LUSH': 'beauty',
  'ЗОЛОТОЕ ЯБЛОКО': 'beauty',
  'РИВ ГОШ': 'beauty',

  // ===== РАЗВЛЕЧЕНИЯ =====
  'CINEMA': 'entertainment',
  'КИНО': 'entertainment',
  'KINOMAX': 'entertainment',
  'КИНОТЕАТР': 'entertainment',
  'КАРО': 'entertainment',
  'СИНЕМА': 'entertainment',
  'MULTIPLEX': 'entertainment',
  'ТЕАТР': 'entertainment',
  'THEATRE': 'entertainment',
  'CONCERT': 'entertainment',
  'КОНЦЕРТ': 'entertainment',
  'TICKET': 'entertainment',
  'БИЛЕТ': 'entertainment',
  'KASSIR': 'entertainment',
  'КАССИР': 'entertainment',
  'AFISHA': 'entertainment',
  'АФИША': 'entertainment',
  'МУЗЕЙ': 'entertainment',
  'MUSEUM': 'entertainment',
  'ПАРК': 'entertainment',
  'PARK': 'entertainment',
  'АТТРАКЦИОН': 'entertainment',
  'БОУЛИНГ': 'entertainment',
  'BOWLING': 'entertainment',
  'KARAOKE': 'entertainment',
  'КАРАОКЕ': 'entertainment',
  'HOOKAH': 'entertainment',
  'КАЛЬЯН': 'entertainment',
  'КЛУБ': 'entertainment',
  'CLUB': 'entertainment',
  'BAR ': 'entertainment',
  'БАР ': 'entertainment',
  'PUB': 'entertainment',
  'ПАБ': 'entertainment',

  // ===== ПОДПИСКИ И СЕРВИСЫ =====
  'NETFLIX': 'subscriptions',
  'НЕТФЛИКС': 'subscriptions',
  'SPOTIFY': 'subscriptions',
  'СПОТИФАЙ': 'subscriptions',
  'YOUTUBE': 'subscriptions',
  'ЮТУБ': 'subscriptions',
  'YANDEX PLUS': 'subscriptions',
  'ЯНДЕКС ПЛЮС': 'subscriptions',
  'YANDEX.PLUS': 'subscriptions',
  'VK MUSIC': 'subscriptions',
  'ВК МУЗЫКА': 'subscriptions',
  'APPLE': 'subscriptions',
  'ЭПЛ': 'subscriptions',
  'GOOGLE': 'subscriptions',
  'ГУГЛ': 'subscriptions',
  'KINOPOISK': 'subscriptions',
  'КИНОПОИСК': 'subscriptions',
  'IVI': 'subscriptions',
  'ИВИ': 'subscriptions',
  'OKKO': 'subscriptions',
  'ОККО': 'subscriptions',
  'MEGOGO': 'subscriptions',
  'МЕГОГО': 'subscriptions',
  'STEAM': 'subscriptions',
  'СТИМ': 'subscriptions',
  'PLAYSTATION': 'subscriptions',
  'XBOX': 'subscriptions',
  'TELEGRAM': 'subscriptions',
  'ТЕЛЕГРАМ': 'subscriptions',

  // ===== ЖКХ И КОММУНАЛЬНЫЕ =====
  'VODOKANAL': 'utilities',
  'ВОДОКАНАЛ': 'utilities',
  'MOSENERGO': 'utilities',
  'МОСЭНЕРГО': 'utilities',
  'ELECTRIC': 'utilities',
  'ЭЛЕКТРО': 'utilities',
  'ЭНЕРГО': 'utilities',
  'ГАЗИФИКАЦ': 'utilities',
  'ТЕПЛОСЕТ': 'utilities',
  'ЖИЛКОМСЕРВИС': 'utilities',
  'ЖКХ': 'utilities',
  'УК ': 'utilities',
  'УПРАВЛЯЮЩАЯ': 'utilities',
  'ТСЖ': 'utilities',
  'ДОМОФОН': 'utilities',
  'ИНТЕРНЕТ': 'utilities',
  'ПРОВАЙДЕР': 'utilities',

  // ===== ОБРАЗОВАНИЕ =====
  'SCHOOL': 'education',
  'ШКОЛА': 'education',
  'UNIVERSITY': 'education',
  'УНИВЕРСИТЕТ': 'education',
  'INSTITUTE': 'education',
  'ИНСТИТУТ': 'education',
  'COLLEGE': 'education',
  'КОЛЛЕДЖ': 'education',
  'COURSE': 'education',
  'КУРС': 'education',
  'SKILLBOX': 'education',
  'СКИЛБОКС': 'education',
  'GEEKBRAINS': 'education',
  'ГИКБРЕЙНС': 'education',
  'NETOLOGY': 'education',
  'НЕТОЛОГИЯ': 'education',
  'SKYENG': 'education',
  'СКАЙЕНГ': 'education',
  'BOOK': 'education',
  'КНИГ': 'education',
  'LIBRARY': 'education',
  'БИБЛИОТЕК': 'education',
  'ЛИТРЕС': 'education',
  'ЛАБИРИНТ': 'education',

  // ===== ПУТЕШЕСТВИЯ =====
  'HOTEL': 'travel',
  'ОТЕЛЬ': 'travel',
  'ГОСТИНИЦ': 'travel',
  'BOOKING': 'travel',
  'БУКИНГ': 'travel',
  'AIRBNB': 'travel',
  'OSTROVOK': 'travel',
  'ОСТРОВОК': 'travel',
  'FLIGHT': 'travel',
  'АВИА': 'travel',
  'AIRLINE': 'travel',
  'AEROFLOT': 'travel',
  'АЭРОФЛОТ': 'travel',
  'S7': 'travel',
  'ПОБЕДА': 'travel',
  'POBEDA': 'travel',
  'UTAIR': 'travel',
  'ЮТЭЙР': 'travel',
  'AVIASALES': 'travel',
  'АВИАСЕЙЛС': 'travel',
  'TUTU': 'travel',
  'ТУТУ': 'travel',

  // ===== ПЕРЕВОДЫ ЛЮДЯМ =====
  'ПЕРЕВОДЫ ЧЕРЕЗ СБП': 'transfer_out',
  'СБП': 'transfer_out',
  'ПЕРЕВОД': 'transfer_out',
  'TRANSFER': 'transfer_out',

  // ===== ЗАРПЛАТА И ДОХОДЫ ОТ ОРГАНИЗАЦИЙ =====
  'ООО': 'salary',
  'АО': 'salary',
  'ПАО': 'salary',
  'ИП': 'salary',
  'ОРГАНИЗАЦИ': 'salary',
  'ЗАРПЛАТ': 'salary',
  'ЗАРАБОТН': 'salary',
  'АВАНС': 'salary',

  // ===== КЭШБЭК И ВОЗВРАТЫ =====
  'КЭШБЭК': 'cashback',
  'CASHBACK': 'cashback',
  'CASH BACK': 'cashback',
  'БОНУС': 'cashback',
  'ВОЗВРАТ': 'refund',
  'REFUND': 'refund',
  'RETURN': 'refund',

  // ===== ПРОЦЕНТЫ =====
  'ПРОЦЕНТ': 'interest',
  'INTEREST': 'interest',
  'ВКЛАД': 'interest',
  'НАКОПИТЕЛЬН': 'interest',
};

/**
 * Определяет категорию по описанию мерчанта
 */
function getCategoryByMerchant(description, amount) {
  if (!description) return 'other';

  let str = String(description).toUpperCase();
  const isIncome = amount > 0;

  // Специальная обработка переводов СБП
  if (str.includes('ПЕРЕВОДЫ ЧЕРЕЗ СБП') || str.includes('СБП')) {
    // Если это доход (положительная сумма) - это входящий перевод
    if (isIncome) {
      // Проверяем, есть ли ФИО (физлицо) или организация
      if (str.includes('ООО') || str.includes('АО ') || str.includes('ПАО') || str.includes('ИП ')) {
        return 'salary'; // Перевод от организации = зарплата
      }
      return 'transfer_in'; // Входящий перевод от человека
    } else {
      return 'transfer_out'; // Исходящий перевод человеку
    }
  }

  // Проверяем зарплату для входящих платежей
  if (isIncome) {
    if (str.includes('ООО') || str.includes('АО ') || str.includes('ПАО') || str.includes('ОРГАНИЗАЦИ')) {
      return 'salary';
    }
    if (str.includes('ЗАРПЛАТ') || str.includes('ЗАРАБОТН') || str.includes('АВАНС')) {
      return 'salary';
    }
    if (str.includes('КЭШБЭК') || str.includes('CASHBACK') || str.includes('БОНУС')) {
      return 'cashback';
    }
    if (str.includes('ВОЗВРАТ') || str.includes('REFUND') || str.includes('RETURN')) {
      return 'refund';
    }
    if (str.includes('ПРОЦЕНТ') || str.includes('ВКЛАД') || str.includes('НАКОПИТЕЛЬН')) {
      return 'interest';
    }
  }

  // If description is a generic 'Оплата товаров и услуг. MERCHANT по карте ...', try to extract MERCHANT
  try {
    const m = str.match(/ОПЛАТА ТОВАРОВ И УСЛУГ\.?\s*([^\n\r]+?)\s+ПО\b/);
    if (m && m[1]) {
      let candidate = m[1].replace(/\bООО\b|\bИП\b|\bIP\b|\*\d{2,4}|ПО\s*КАРТЕ/gi, '').trim();
      candidate = candidate.replace(/[\.,;\/]+/g, ' ').trim();
      
      // try matching candidate tokens
      for (const token of candidate.split(/\s+/)) {
        for (const [keyword, category] of Object.entries(merchantMap)) {
          if (token.includes(keyword) || keyword.includes(token)) {
            return category;
          }
        }
      }
      // fallback: test full candidate
      for (const [keyword, category] of Object.entries(merchantMap)) {
        if (candidate.includes(keyword)) return category;
      }
    }
  } catch (e) {
    // continue to general matching
  }

  // Проверяем услуги коммерческих провайдеров (сотовая связь)
  if (str.includes('КОММЕРЧЕСКИХ ПРОВАЙДЕРОВ')) {
    // Проверяем конкретного оператора
    if (str.includes('МЕГАФОН') || str.includes('MEGAFON')) return 'mobile';
    if (str.includes('МТС') || str.includes('MTS')) return 'mobile';
    if (str.includes('БИЛАЙН') || str.includes('BEELINE')) return 'mobile';
    if (str.includes('ТЕЛЕ2') || str.includes('TELE2')) return 'mobile';
    if (str.includes('YOTA') || str.includes('ЙОТА')) return 'mobile';
    return 'mobile'; // По умолчанию это сотовая связь
  }

  // General matching on the whole description
  for (const [keyword, category] of Object.entries(merchantMap)) {
    if (str.includes(keyword)) return category;
  }

  // Try to split by '.' and check each part
  const parts = str.split('.').map(p => p.trim()).filter(Boolean);
  for (const part of parts) {
    for (const [keyword, category] of Object.entries(merchantMap)) {
      if (part.includes(keyword)) return category;
    }
  }

  return 'other';
}

/**
 * Маппинг внутренних категорий на стандартные для БД (на русском)
 */
const categoryMapping = {
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
  
  // Прочее
  'other': 'Прочее',
};

/**
 * Категоризирует транзакцию на основе описания
 * Возвращает русское название категории
 */
function categorizeTransaction(description, amount = 0) {
  const internalCategory = getCategoryByMerchant(description, amount);
  return categoryMapping[internalCategory] || 'Прочее';
}

/**
 * Получить внутренний код категории
 */
function getCategoryCode(description, amount = 0) {
  return getCategoryByMerchant(description, amount);
}

module.exports = { 
  merchantMap, 
  getCategoryByMerchant, 
  categorizeTransaction,
  getCategoryCode,
  categoryMapping 
};