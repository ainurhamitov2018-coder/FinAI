#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { categorizeTransaction, getCategoryCode } = require('./merchantMap');

function parseNumber(str) {
  if (str == null) return null;
  let cleaned = String(str).trim();
  cleaned = cleaned.replace(/\s/g, '');
  
  if (/,\d{2}$/.test(cleaned)) {
    cleaned = cleaned.replace(',', '.');
  }
  else if (cleaned.includes(',') && cleaned.includes('.')) {
    cleaned = cleaned.replace(/,/g, '');
  }
  
  const m = cleaned.match(/(-?\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

function toISO(dateStr, timeStr) {
  if (!dateStr) return null;
  const d = dateStr.trim().split('.');
  if (d.length !== 3) return null;
  const [dd, mm, yyyy] = d;
  if (timeStr) {
    const t = timeStr.trim();
    return `${yyyy}-${mm}-${dd}T${t}`;
  }
  return `${yyyy}-${mm}-${dd}`;
}

function parseStatement(lines) {
  const summary = {};
  const transactions = [];
  let idCounter = 1;
  
  const text = lines.join('\n');
  
  // Extract person name
  const nameMatch = text.match(/^([А-Я][а-я]+\s+[А-Я][а-я]+\s+[А-Я][а-я]+)/);
  if (nameMatch) summary.accountHolder = nameMatch[1].trim();
  
  // Extract account number
  const accountMatch = text.match(/Номер счёта\s+([\d]+)/);
  if (accountMatch) summary.accountNumber = accountMatch[1].trim();
  
  // Extract period
  const periodMatch = text.match(/Период выписки\s+([\d.]+)\s*-\s*([\d.]+)/);
  if (periodMatch) {
    summary.periodStart = periodMatch[1];
    summary.periodEnd = periodMatch[2];
  }
  
  // Extract summary values
  const balanceStartMatch = text.match(/Баланс на начало периода\s+([\d,\.]+)\s+RUB/);
  if (balanceStartMatch) {
    summary.startBalance = parseNumber(balanceStartMatch[1]);
    summary.currency = 'RUB';
  }
  
  const balanceEndMatch = text.match(/Баланс на конец периода\s+([\d,\.]+)\s+RUB/);
  if (balanceEndMatch) {
    summary.endBalance = parseNumber(balanceEndMatch[1]);
  }
  
  const incomeMatch = text.match(/Поступления\s+([\d,\.]+)\s+RUB/);
  if (incomeMatch) summary.income = parseNumber(incomeMatch[1]);
  
  const expensesMatch = text.match(/Расходные операции\s+([\d,\.]+)\s+RUB/);
  if (expensesMatch) summary.expenses = parseNumber(expensesMatch[1]);
  
  // Parse transactions
  const txRegex = /(\d{2}\.\d{2}\.\d{4})\s+(\d{2}:\d{2}:\d{2})\s+(\d{2}\.\d{2}\.\d{4})\s+([-\d,\.]+)\s+RUB\s+([\d,\.]*)\s+RUB\s+([\d,\.]*)\s+RUB\s+([0-9,\.]+)\s+(.*?)(?=\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}:\d{2}|$)/gs;
  
  let match;
  while ((match = txRegex.exec(text)) !== null) {
    const opDate = match[1];
    const opTime = match[2];
    const procDate = match[3];
    const opAmountStr = match[4];
    const commissionStr = match[7];
    const descriptionStr = match[8];
    
    const opAmount = parseNumber(opAmountStr);
    const commission = parseNumber(commissionStr);
    
    if (opAmount === null) continue;
    
    // Маскируем полное ФИО в описаниях СБП переводов
    let maskedDescription = descriptionStr.trim() || null;
    if (maskedDescription) {
      const sbpPattern = /(Переводы через СБП\.\s*\.*\s*)([А-ЯЁ][А-ЯЁа-яё\s]+)/i;
      const sbpMatch = maskedDescription.match(sbpPattern);
      if (sbpMatch) {
        const prefix = sbpMatch[1];
        const fullName = sbpMatch[2].trim();
        const nameParts = fullName.split(/\s+/).filter(p => p.length > 0);
        if (nameParts.length >= 2) {
          const surname = nameParts[0];
          const firstNameInitial = nameParts[1].charAt(0).toUpperCase();
          const maskedName = `${surname} ${firstNameInitial}.`;
          maskedDescription = maskedDescription.replace(sbpPattern, `${prefix}${maskedName}`);
        }
      }
    }
    
    // Получаем русское название категории, передаём сумму для определения типа
    const categoryName = categorizeTransaction(maskedDescription, opAmount);
    const categoryCode = getCategoryCode(maskedDescription, opAmount);
    
    const tx = {
      id: `tx_${Date.now()}_${idCounter++}`,
      operationDate: toISO(opDate, opTime),
      processedDate: toISO(procDate, null),
      amount: opAmount, // Сохраняем со знаком для определения типа
      currency: 'RUB',
      type: opAmount < 0 ? 'expense' : 'income',
      commission: commission || 0,
      description: maskedDescription,
      category: categoryCode,      // Внутренний код: 'mobile', 'taxi', etc.
      categoryName: categoryName,  // Русское название: 'Сотовая связь', 'Такси', etc.
    };
    
    transactions.push(tx);
  }

  return { summary, transactions };
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 1) {
    console.error('Usage: node parse_transactions.js <input.txt> [output.json]');
    process.exit(2);
  }
  const inputPath = path.resolve(argv[0]);
  const outputPath = argv[1] ? path.resolve(argv[1]) : null;
  if (!fs.existsSync(inputPath)) {
    console.error('Input file not found:', inputPath);
    process.exit(2);
  }
  const content = fs.readFileSync(inputPath, 'utf8');
  const lines = content.split(/\r?\n/);
  
  const result = parseStatement(lines);
  const out = JSON.stringify(result, null, 2);
  
  if (outputPath) {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    fs.writeFileSync(outputPath, out, 'utf8');
    console.log('✓ Parsed', result.transactions.length, 'transactions from', path.basename(inputPath));
    console.log('✓ Saved to', path.basename(outputPath));
    
    // Показать статистику по категориям
    const categoryStats = {};
    result.transactions.forEach(tx => {
      const cat = tx.categoryName || 'Прочее';
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });
    console.log('\n📊 Статистика по категориям:');
    Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count}`);
      });
  } else {
    console.log(out);
  }
}

if (require.main === module) main();

module.exports = { parseStatement };