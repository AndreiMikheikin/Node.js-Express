const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Функция для вычисления факториала
function factorial(n) {
    if (n === 0 || n === 1) return BigInt(1);
    let result = BigInt(1);
    for (let i = 2; i <= n; i++) {
        result *= BigInt(i);
    }
    return result;
}

// Функция для подсчёта суммы цифр
function sumOfDigits(num) {
    return num.toString().split('').reduce((sum, digit) => sum + Number(digit), 0);
}

// Запрос числа у пользователя
rl.question('Введите число: ', (input) => {
    const n = parseInt(input);
    if (isNaN(n) || n < 0) {
        console.log('Введите корректное неотрицательное число.');
    } else {
        const fact = factorial(n);
        const sum = sumOfDigits(fact);
        console.log(`Факториал: ${fact}`);
        console.log(`Сумма цифр факториала: ${sum}`);
    }
    rl.close();
});
